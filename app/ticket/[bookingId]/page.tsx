import React from 'react'
import Link from 'next/link'
import { PopSeatLogo } from '@/components/pop-seat-logo'
import { ChevronLeft } from 'lucide-react'
import { QRCodePass } from '@/components/ticket/qr-code-pass'
import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/redis'

import { getMoviePoster } from '@/lib/queries/omdb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface TicketPageProps {
  params: Promise<{
    bookingId: string
  }>
  searchParams?: Promise<{
    movie?: string
    hall?: string
    time?: string
    seats?: string
    total?: string
    email?: string
    name?: string
    poster?: string
  }>
}

export default async function TicketPage({ params, searchParams }: TicketPageProps) {
  const { bookingId } = await params
  const query = searchParams ? await searchParams : {}

  let movieTitle = query.movie
  let moviePoster: string | null | undefined = query.poster
  let hallName = query.hall
  let startTime = query.time
  let seatsList = query.seats ? query.seats.split(',').filter(Boolean) : []
  let totalPrice = query.total ? parseFloat(query.total) : undefined
  const customerEmail = query.email
  const customerName = query.name

  // If poster or any key metadata is missing, retrieve from Supabase or OMDB
  if (!moviePoster || !startTime || !hallName || !movieTitle || seatsList.length === 0) {
    try {
      const supabase = await createClient()

      // 1. Query bookings table by booking_code
      const { data: bookingRows } = await supabase
        .from('bookings')
        .select('*, showtimes(*, movies(*)), seats(*)')
        .or(`booking_code.eq.${bookingId},booking_code.like.${bookingId}-%`)

      if (bookingRows && bookingRows.length > 0) {
        const first = bookingRows[0]
        const showtime = Array.isArray(first.showtimes) ? first.showtimes[0] : first.showtimes
        const movie = Array.isArray(showtime?.movies) ? showtime?.movies[0] : showtime?.movies

        movieTitle = movieTitle || movie?.title || 'Featured Movie'
        moviePoster = moviePoster || movie?.poster_url || null
        hallName = hallName || showtime?.cinema_hall || showtime?.hall_name || 'Main Cinema Hall'
        startTime = startTime || showtime?.start_time

        if (seatsList.length === 0) {
          seatsList = bookingRows
            .map((b) => {
              const s = Array.isArray(b.seats) ? b.seats[0] : b.seats
              return s ? `${s.row_name}${s.seat_number}` : ''
            })
            .filter(Boolean)
        }

        if (totalPrice === undefined) {
          const sum = bookingRows.reduce((acc, b) => acc + (Number(b.total_price) || 0), 0)
          totalPrice = sum > 0 ? sum : undefined
        }
      }

      // 2. If details are still missing, match showtime using the prefix from bookingId (e.g. PS-A69DB3-W84V0 -> a69db3)
      const showtimePrefix = bookingId.split('-')[1]?.toLowerCase()
      if (showtimePrefix && (!moviePoster || !startTime || !hallName)) {
        try {
          const { data: showtimes } = await supabase
            .from('showtimes')
            .select('*, movies(*)')

          const matchedShowtime = (showtimes || []).find((st: any) =>
            st.id?.toLowerCase().startsWith(showtimePrefix)
          )

          if (matchedShowtime) {
            const m = Array.isArray(matchedShowtime.movies)
              ? matchedShowtime.movies[0]
              : matchedShowtime.movies

            movieTitle = movieTitle || m?.title
            moviePoster = moviePoster || m?.poster_url
            hallName = hallName || matchedShowtime.cinema_hall || matchedShowtime.hall_name
            startTime = startTime || matchedShowtime.start_time
          }
        } catch (stErr) {
          console.warn('[TicketPage] Showtime lookup notice:', stErr)
        }
      }

      // 3. If movie poster is still missing but title is available, query movies table by title
      if (!moviePoster && movieTitle) {
        try {
          const { data: movieRecord } = await supabase
            .from('movies')
            .select('poster_url')
            .ilike('title', movieTitle)
            .limit(1)
            .maybeSingle()

          if (movieRecord?.poster_url) {
            moviePoster = movieRecord.poster_url
          }
        } catch {
          // Continue if query fails
        }
      }
    } catch (e) {
      console.warn('[TicketPage] DB fallback notice:', e)
    }

    // 4. Redis fallback: Retrieve booking from Redis if seats are still missing
    if (seatsList.length === 0 && redis) {
      try {
        const cached = await redis.get<any>(`booking_meta:${bookingId}`)
        if (cached) {
          const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
          if (Array.isArray(parsed.seats) && parsed.seats.length > 0 && seatsList.length === 0) {
            seatsList = parsed.seats
          }
          if (parsed.totalPrice && totalPrice === undefined) {
            totalPrice = parsed.totalPrice
          }
        }
      } catch (redisErr) {
        console.warn('[TicketPage] Redis fallback notice:', redisErr)
      }
    }

    // 5. Guaranteed fallback: Fetch poster via getMoviePoster
    if (!moviePoster && movieTitle) {
      try {
        moviePoster = (await getMoviePoster(movieTitle)) || null
      } catch {
        // Continue if getMoviePoster fails
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-16 print:bg-white print:text-black print:pb-0">
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <PopSeatLogo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Movies
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="text-center print:hidden">
          <h1 className="text-2xl font-black text-white">Booking Confirmed!</h1>
          <p className="text-xs text-neutral-400 mt-1">Present this electronic pass at the cinema turnstile.</p>
        </div>

        <QRCodePass
          bookingId={bookingId}
          movieTitle={movieTitle || 'Featured Movie'}
          moviePoster={moviePoster || undefined}
          hallName={hallName || 'Main Cinema Hall'}
          startTime={startTime}
          seats={seatsList}
          totalPrice={totalPrice}
          customerEmail={customerEmail}
          customerName={customerName}
        />

        <div className="print:hidden">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-neutral-300 text-xs font-bold transition-colors"
          >
            Browse More Showtimes
          </Link>
        </div>
      </main>
    </div>
  )
}
