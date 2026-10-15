'use server'

import 'server-only'
import Stripe from 'stripe'
import { headers } from 'next/headers'

// Initialise Stripe inline inside the server action file.
// This guarantees the secret key is never included in any client bundle —
// 'use server' boundary + 'server-only' both enforce this at build time.
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.')
  return new Stripe(key, { apiVersion: '2026-09-30.endive', typescript: true })
}

export interface CreateCheckoutSessionParams {
  showtimeId: string
  movieTitle?: string
  seats: string[]
  totalPrice: number
  customerEmail?: string
}

/**
 * Creates a Stripe Checkout Session for seat bookings.
 * Derives origin dynamically from request headers so success/cancel URLs
 * resolve correctly on Vercel, Netlify, and any custom domain — not just localhost.
 */
export async function createCheckoutSession(
  showtimeIdOrParams: string | CreateCheckoutSessionParams,
  movieTitleArg?: string,
  seatsArg?: string[],
  totalPriceArg?: number,
  customerEmailArg?: string
) {
  let showtimeId: string
  let movieTitle: string
  let seats: string[]
  let totalPrice: number
  let customerEmail: string

  if (typeof showtimeIdOrParams === 'object' && showtimeIdOrParams !== null) {
    showtimeId = showtimeIdOrParams.showtimeId
    movieTitle = showtimeIdOrParams.movieTitle || 'PopSeat Cinema Tickets'
    seats = showtimeIdOrParams.seats || []
    totalPrice = Number(showtimeIdOrParams.totalPrice) || 0
    customerEmail =
      showtimeIdOrParams.customerEmail?.trim()
        ? showtimeIdOrParams.customerEmail.trim()
        : 'edsimonmendoza@gmail.com'
  } else {
    showtimeId = showtimeIdOrParams
    movieTitle = movieTitleArg || 'PopSeat Cinema Tickets'
    seats = seatsArg || []
    totalPrice = Number(totalPriceArg) || 0
    customerEmail =
      customerEmailArg?.trim() ? customerEmailArg.trim() : 'edsimonmendoza@gmail.com'
  }

  // Ensure valid email fallback
  if (!customerEmail || !customerEmail.includes('@')) {
    customerEmail = 'edsimonmendoza@gmail.com'
  }

  // ── Derive origin dynamically from request headers ──────────────────────
  // This is critical for Vercel/Netlify: NEXT_PUBLIC_APP_URL may be localhost
  // in .env.local but the deployed host will differ. Using the `origin` header
  // ensures success/cancel URLs always resolve to the actual deployment URL.
  const headerList = await headers()
  const origin =
    headerList.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'

  const seatsParam = seats.join(',')
  const encodedEmail = encodeURIComponent(customerEmail)

  const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&showtime_id=${showtimeId}&seats=${seatsParam}&email=${encodedEmail}&price=${totalPrice}`
  const cancelUrl = `${origin}/showtime/${showtimeId}?canceled=true`

  // Stripe expects amounts in the smallest currency unit (centavos for PHP)
  const unitAmount = Math.max(50, Math.round(totalPrice * 100))

  const stripeClient = getStripe()

  const session = await stripeClient.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    payment_intent_data: {
      // Stripe sends its own receipt to this email after payment succeeds
      receipt_email: customerEmail,
    },
    line_items: [
      {
        price_data: {
          currency: 'php',
          product_data: {
            name: `${movieTitle} — Cinema Ticket`,
            description: `Reserved Seats: ${seats.join(', ') || 'Standard Admission'}`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      showtime_id: showtimeId,
      seats: seatsParam,
      customer_email: customerEmail,
      total_price: String(totalPrice),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return {
    id: session.id,
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Retrieves the Stripe receipt URL for a completed checkout session.
 * Exposed as a server action so Server Components never need to import
 * the Stripe instance directly (which would drag the secret key into
 * Next.js's module graph in ways that can cause Vercel build issues).
 */
export async function getStripeReceiptUrl(sessionId: string): Promise<string | null> {
  try {
    const stripeClient = getStripe()
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.latest_charge'],
    })
    const pi = session.payment_intent as { latest_charge?: { receipt_url?: string } } | null
    return pi?.latest_charge?.receipt_url ?? null
  } catch (err) {
    console.warn('[getStripeReceiptUrl] Could not retrieve receipt:', err)
    return null
  }
}
