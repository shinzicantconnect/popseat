import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createBooking } from '@/lib/actions/create-booking'
import { getShowtimeDetails } from '@/lib/queries/get-showtime'
import { sendTicketEmail } from '@/lib/actions/send-email'
import { getStripeReceiptUrl } from '@/lib/actions/stripe'
import { PopSeatLogo } from '@/components/pop-seat-logo'
import { CheckCircle2, Mail, Ticket, Home, Film, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CheckoutSuccessPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const query = searchParams ? await searchParams : {}

  const showtimeId = typeof query.showtime_id === 'string' ? query.showtime_id : ''
  const seatsParam = typeof query.seats === 'string' ? query.seats : ''
  const email =
    typeof query.email === 'string' && query.email.trim()
      ? query.email.trim()
      : 'edsimonmendoza@gmail.com'
  const priceParam = typeof query.price === 'string' ? query.price : '0'
  const totalPrice = parseFloat(priceParam) || 0
  const sessionId = typeof query.session_id === 'string' ? query.session_id : ''

  const seatList = seatsParam
    ? seatsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  // Retrieve Stripe receipt URL via server action (keeps secret key scoped to 'use server' boundary)
  let stripeReceiptUrl = ''
  if (sessionId) {
    try {
      stripeReceiptUrl = (await getStripeReceiptUrl(sessionId)) ?? ''
    } catch (stripeErr) {
      console.warn('[CheckoutSuccess] Stripe receipt lookup notice:', stripeErr)
    }
  }

  // Synchronize cinema booking records, seat locks, and Redis cache
  let bookingCode = ''
  if (showtimeId && seatList.length > 0) {
    try {
      const res = await createBooking({
        showtimeId,
        seats: seatList,
        totalPrice,
        customerEmail: email
      })
      if (res?.bookingRef) {
        bookingCode = res.bookingRef
      }
    } catch (bookingErr) {
      console.warn('[CheckoutSuccess] createBooking notice:', bookingErr)
    }
  }

  // Fallback booking code lookup if page was reloaded or already confirmed
  if (!bookingCode && showtimeId) {
    try {
      const supabase = await createClient()
      const { data: latestBooking } = await supabase
        .from('bookings')
        .select('booking_code')
        .eq('showtime_id', showtimeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (latestBooking?.booking_code) {
        bookingCode = latestBooking.booking_code.split('-').slice(0, 3).join('-')
      }
    } catch {
      // Continue if latest booking lookup fails
    }
  }

  // Retrieve showtime details to display movie metadata
  let showtime = null
  if (showtimeId) {
    try {
      showtime = await getShowtimeDetails(showtimeId)
    } catch {
      // Continue if showtime query fails
    }
  }

  // Dispatch cinema ticket confirmation email via Resend
  if (showtimeId && seatList.length > 0) {
    try {
      await sendTicketEmail({
        toEmail: email,
        movieTitle: showtime?.movie.title || 'PopSeat Cinema Screening',
        seats: seatList,
        totalPrice,
        bookingCode: bookingCode || 'PS-CONFIRMED',
        cinemaHall: showtime?.hall_name || 'Main Cinema Hall',
        startTime: showtime?.start_time
      })
    } catch (emailErr) {
      console.warn('[CheckoutSuccess] sendTicketEmail notice:', emailErr)
    }
  }

  const showDate = (() => {
    if (!showtime?.start_time) return null
    try {
      const d = new Date(showtime.start_time)
      return isNaN(d.getTime())
        ? null
        : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    } catch {
      return null
    }
  })()

  const showTime = (() => {
    if (!showtime?.start_time) return null
    try {
      const d = new Date(showtime.start_time)
      return isNaN(d.getTime())
        ? null
        : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return null
    }
  })()

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PopSeatLogo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <main className="max-w-xl mx-auto px-4 py-12 flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Booking Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Your cinema seat reservation has been processed successfully.
            </p>
          </div>

          {/* Email Receipt Notification Alert */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-start gap-3 shadow-lg shadow-emerald-950/20">
            <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1.5 flex-1">
              <p className="font-bold text-emerald-300">E-Ticket Sent via Resend</p>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Your cinema ticket was emailed to{' '}
                <span className="font-mono font-bold text-white underline decoration-emerald-500">edsimonmendoza@gmail.com</span>{' '}
                via Resend.
              </p>
              {stripeReceiptUrl && (
                <div className="pt-1">
                  <a
                    href={stripeReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition"
                  >
                    <span>View Stripe Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <span className="font-bold text-white text-sm">
                  {showtime?.movie.title || 'Cinema Screening'}
                </span>
              </div>
              {bookingCode && (
                <span className="px-2.5 py-1 rounded-md bg-red-950/50 border border-red-800/40 font-mono text-[11px] font-bold text-red-400">
                  {bookingCode}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                  Reserved Seats
                </p>
                <p className="font-bold text-neutral-200 mt-0.5">
                  {seatList.length > 0 ? seatList.join(', ') : 'Assigned Seats'}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                  Amount Paid
                </p>
                <p className="font-bold text-emerald-400 mt-0.5">
                  ₱{totalPrice.toFixed(2)}
                </p>
              </div>

              {showDate && (
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                    Date & Time
                  </p>
                  <p className="font-semibold text-neutral-300 mt-0.5">
                    {showDate} • {showTime}
                  </p>
                </div>
              )}

              {showtime?.hall_name && (
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                    Cinema Hall
                  </p>
                  <p className="font-semibold text-neutral-300 mt-0.5">
                    {showtime.hall_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 space-y-2.5">
            <Link
              href="/"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm text-center shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>

            {bookingCode && (
              <Link
                href={`/ticket/${bookingCode}?movie=${encodeURIComponent(
                  showtime?.movie.title || 'Movie'
                )}&seats=${seatList.join(',')}&total=${totalPrice.toFixed(2)}&email=${encodeURIComponent(
                  email
                )}${showtime?.movie.poster_url ? `&poster=${encodeURIComponent(showtime.movie.poster_url)}` : ''}${showtime?.hall_name ? `&hall=${encodeURIComponent(showtime.hall_name)}` : ''}${showtime?.start_time ? `&time=${encodeURIComponent(showtime.start_time)}` : ''}`}
                className="w-full py-3 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-neutral-300 font-semibold text-xs text-center flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-red-500" />
                <span>View E-Ticket Pass</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
