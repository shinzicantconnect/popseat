import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getShowtimeDetails } from '@/lib/queries/get-showtime'
import { createClient } from '@/lib/supabase/server'
import { PopSeatLogo } from '@/components/pop-seat-logo'
import { Calendar, Clock, MapPin, ChevronLeft, Film, Ticket } from 'lucide-react'
import { SeatSelector } from '@/components/seat-map/seat-selector'
import { redis } from '@/lib/redis'
import { AuthButton } from '@/components/auth-button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ShowtimePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ShowtimePageProps): Promise<Metadata> {
  const { id } = await params
  const showtime = await getShowtimeDetails(id)

  if (!showtime) {
    return {
      title: 'Showtime Not Found | PopSeat'
    }
  }

  return {
    title: `${showtime.movie.title} - Book Seats | PopSeat`,
    description: `Book your tickets for ${showtime.movie.title} at ${showtime.hall_name} with PopSeat.`
  }
}

export default async function ShowtimePage({ params }: ShowtimePageProps) {
  const { id } = await params
  const showtime = await getShowtimeDetails(id)

  if (!showtime) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Showtime Not Found</h1>
        <p className="text-neutral-400 mb-6">The requested screening session could not be retrieved.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-red-700 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-950/50"
        >
          Return Home
        </Link>
      </div>
    )
  }

  // Fetch already booked seats for this showtime from Supabase
  const reservedSeats: string[] = []
  let isFullyBooked = false

  try {
    const supabase = await createClient()

    // Fetch booked seat codes from confirmed bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('seat_code')
      .eq('showtime_id', showtime.id)

    if (bookings) {
      for (const b of bookings) {
        if (b.seat_code && !reservedSeats.includes(b.seat_code)) {
          reservedSeats.push(b.seat_code)
        }
      }
    }

    // Also fetch seats currently held via Redis
    try {
      const [bookedKeys, heldKeys] = await Promise.all([
        redis.keys(`booked:${showtime.id}:*`),
        redis.keys(`hold:${showtime.id}:*`)
      ])

      for (const k of [...bookedKeys, ...heldKeys]) {
        const seatCode = k.split(':').pop()
        if (seatCode && !reservedSeats.includes(seatCode)) {
          reservedSeats.push(seatCode)
        }
      }
    } catch {
      // Continue if Redis keys check fails
    }

    // Total cinema capacity: 120 seats (Rows A-J x 12 seats)
    const TOTAL_CAPACITY = 120
    isFullyBooked = reservedSeats.length >= TOTAL_CAPACITY
  } catch (err) {
    console.warn('[ShowtimePage] Could not load existing bookings:', err)
  }

  // Safe date/time formatting
  const showDate = (() => {
    try {
      const d = new Date(showtime.start_time)
      return isNaN(d.getTime())
        ? 'Upcoming'
        : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    } catch {
      return 'Upcoming'
    }
  })()

  const showTime = (() => {
    try {
      const d = new Date(showtime.start_time)
      return isNaN(d.getTime())
        ? '7:30 PM'
        : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '7:30 PM'
    }
  })()

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PopSeatLogo />
          </Link>
          <div className="flex items-center gap-4">
            <AuthButton />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Movies
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="relative w-28 h-40 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-zinc-800 flex items-center justify-center">
            {showtime.movie.poster_url ? (
              <Image
                src={showtime.movie.poster_url}
                alt={showtime.movie.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 112px, 112px"
              />
            ) : (
              <Film className="h-8 w-8 text-neutral-600" />
            )}
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1">
                {showtime.movie.genre || 'Feature Film'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {showtime.movie.title}
              </h1>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Calendar className="h-3.5 w-3.5 text-red-500" />
                {showDate}
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-red-500" />
                {showTime}
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                {showtime.hall_name || 'Hall 1'}
              </span>
              {showtime.movie.duration_minutes && (
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <Film className="h-3.5 w-3.5 text-neutral-500" />
                  {showtime.movie.duration_minutes} min
                </span>
              )}
            </div>

            {showtime.ticket_price && (
              <div className="flex justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-bold">
                  <Ticket className="h-3.5 w-3.5" />
                  ₱{Number(showtime.ticket_price).toFixed(2)} per seat
                </span>
              </div>
            )}
          </div>
        </div>

        {isFullyBooked ? (
          <div className="py-16 text-center bg-rose-950/20 border border-rose-800/30 rounded-2xl space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 mb-1">
              <Ticket className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-white">This Showtime is Fully Booked</h2>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              All 120 seats have been reserved. Please check other available showtimes.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-950/50"
            >
              Browse Other Movies
            </Link>
          </div>
        ) : (
          <SeatSelector
            showtimeId={showtime.id}
            ticketPrice={showtime.ticket_price ?? showtime.price_standard}
            reservedSeats={reservedSeats}
          />
        )}
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-neutral-500 bg-black">
        <p>© {new Date().getFullYear()} PopSeat Cinema Reservation System. All rights reserved.</p>
      </footer>
    </div>
  )
}
