// app/api/webhooks/stripe/route.ts
// Receives and verifies Stripe webhook events, then syncs confirmed payments
// to Supabase and triggers the Resend ticket-confirmation email.

export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendTicketEmail } from '@/lib/actions/send-email'

// ── Stripe client ─────────────────────────────────────────────────────────────
// Uses the same apiVersion as lib/actions/stripe.ts to stay in sync.
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.')
  return new Stripe(key, { apiVersion: '2026-09-30.endive', typescript: true })
}

// ── Supabase Service-Role client ──────────────────────────────────────────────
// The service-role key bypasses Row Level Security so the webhook can write
// bookings even without a user session (the request comes from Stripe servers).
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.'
    )
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  })
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Read the raw body as text — Stripe needs the unmodified bytes to verify
  //    the HMAC signature. Never call request.json() before this step.
  const body = await request.text()

  // 2. Extract the stripe-signature header
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('[stripe-webhook] Missing stripe-signature header.')
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured.')
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 3. Verify webhook signature — rejects tampered or replayed requests
  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[stripe-webhook] Signature verification failed:', message)
    return new Response(
      JSON.stringify({ error: `Webhook signature verification failed: ${message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 4. Route the event to the appropriate handler
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      // Add more event types here as needed:
      // case 'payment_intent.payment_failed':
      //   await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
      //   break

      default:
        // Acknowledge unhandled events so Stripe doesn't retry them
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[stripe-webhook] Error handling ${event.type}:`, message)
    return new Response(
      JSON.stringify({ error: `Handler error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 5. Always return 200 so Stripe knows the webhook was received
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── checkout.session.completed ────────────────────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripeSessionId = session.id

  // Extract booking metadata embedded when creating the Checkout Session
  // (set in lib/actions/stripe.ts → stripeClient.checkout.sessions.create)
  const showtimeId =
    session.metadata?.showtime_id ?? (session.client_reference_id || '')
  const seatsRaw = session.metadata?.seats ?? ''
  const customerEmail =
    session.customer_email ??
    session.metadata?.customer_email ??
    'edsimonmendoza@gmail.com'
  const totalPrice =
    parseFloat(session.metadata?.total_price ?? '0') ||
    (session.amount_total ? session.amount_total / 100 : 0)

  const seats: string[] = seatsRaw
    ? seatsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  console.log('[stripe-webhook] checkout.session.completed', {
    stripeSessionId,
    showtimeId,
    seats,
    customerEmail,
    totalPrice,
  })

  if (!showtimeId) {
    console.warn(
      '[stripe-webhook] No showtime_id in session metadata — skipping DB write.'
    )
    return
  }

  const supabase = getServiceClient()

  // ── Idempotency guard ───────────────────────────────────────────────────────
  // Stripe may deliver the same event more than once. Check whether a booking
  // with this stripe_session_id already exists before inserting.
  const { data: existing, error: lookupError } = await supabase
    .from('bookings')
    .select('id, booking_code')
    .eq('stripe_session_id', stripeSessionId)
    .limit(1)

  if (lookupError) {
    // Column may not exist yet — fall through and attempt insert anyway
    console.warn(
      '[stripe-webhook] stripe_session_id lookup failed (column may not exist yet):',
      lookupError.message
    )
  } else if (existing && existing.length > 0) {
    console.log(
      '[stripe-webhook] Duplicate webhook — booking already recorded:',
      existing[0].booking_code
    )
    return
  }

  // ── Generate booking reference ──────────────────────────────────────────────
  const bookingRef = `PS-${showtimeId.slice(0, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`

  // ── Fetch seat rows so we can resolve label → seat UUID ────────────────────
  const { data: seatRows } = await supabase
    .from('seats')
    .select('id, row_name, seat_number')

  // ── Fetch showtime for email enrichment ────────────────────────────────────
  const { data: showtime } = await supabase
    .from('showtimes')
    .select('start_time, cinema_hall, movies(title)')
    .eq('id', showtimeId)
    .single()

  const movieTitle =
    (showtime?.movies as { title?: string } | null)?.title ?? 'PopSeat Cinema'
  const cinemaHall = showtime?.cinema_hall ?? 'Main Cinema Hall'
  const startTime: string | undefined = showtime?.start_time ?? undefined

  // ── Build booking records ───────────────────────────────────────────────────
  const pricePerSeat =
    seats.length > 0
      ? Number((totalPrice / seats.length).toFixed(2))
      : totalPrice

  const deduplicatedSeats = Array.from(
    new Set(seats.map((s) => s.trim().toUpperCase()).filter(Boolean))
  )

  // Fetch already-confirmed seats for this showtime to prevent re-inserting
  const { data: bookedRows } = await supabase
    .from('bookings')
    .select('seat_id')
    .eq('showtime_id', showtimeId)

  const bookedSeatIds = new Set((bookedRows ?? []).map((b) => b.seat_id))
  const allocatedSeatIds = new Set<string>()

  const recordsToInsert: Array<{
    showtime_id: string
    seat_id: string
    total_price: number
    booking_code: string
    status: string
    stripe_session_id: string
  }> = []

  for (let i = 0; i < deduplicatedSeats.length; i++) {
    const seatStr = deduplicatedSeats[i]
    const row = seatStr.charAt(0)
    const num = parseInt(seatStr.slice(1), 10)

    let matched = (seatRows ?? []).find(
      (s) => s.row_name === row && s.seat_number === num
    )

    // Fall back to any available seat if the exact label isn't found or is taken
    if (
      !matched ||
      allocatedSeatIds.has(matched.id) ||
      bookedSeatIds.has(matched.id)
    ) {
      matched = (seatRows ?? []).find(
        (s) => !bookedSeatIds.has(s.id) && !allocatedSeatIds.has(s.id)
      )
    }

    if (
      matched &&
      !allocatedSeatIds.has(matched.id) &&
      !bookedSeatIds.has(matched.id)
    ) {
      allocatedSeatIds.add(matched.id)
      recordsToInsert.push({
        showtime_id: showtimeId,
        seat_id: matched.id,
        total_price: pricePerSeat,
        booking_code: i === 0 ? bookingRef : `${bookingRef}-${i + 1}`,
        status: 'CONFIRMED',
        stripe_session_id: stripeSessionId,
      })
    }
  }

  // ── Write to Supabase ───────────────────────────────────────────────────────
  if (recordsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('bookings')
      .upsert(recordsToInsert, {
        onConflict: 'showtime_id,seat_id',
        ignoreDuplicates: true,
      })

    if (insertError) {
      if (
        insertError.code === '23505' ||
        insertError.message?.toLowerCase().includes('unique') ||
        insertError.message?.toLowerCase().includes('duplicate')
      ) {
        console.warn(
          '[stripe-webhook] Seats already recorded — safe to continue.'
        )
      } else {
        // Re-throw so the catch in POST returns a 500 and Stripe retries
        throw new Error(`DB insert error: ${insertError.message}`)
      }
    } else {
      console.log(
        `[stripe-webhook] Inserted ${recordsToInsert.length} booking row(s). Ref: ${bookingRef}`
      )
    }
  } else {
    console.log('[stripe-webhook] No new seats to insert (all already booked).')
  }

  // ── Send confirmation email via Resend ─────────────────────────────────────
  // Fire-and-forget: an email failure must never cause the webhook to return
  // a non-200 status (that would make Stripe retry and double-book).
  sendTicketEmail({
    toEmail: customerEmail,
    movieTitle,
    seats,
    totalPrice,
    bookingCode: bookingRef,
    cinemaHall,
    startTime,
  }).catch((err) => {
    console.warn('[stripe-webhook] sendTicketEmail failed (non-fatal):', err)
  })
}