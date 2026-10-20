import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  Film,
  Calendar,
  Clock,
  ChevronRight,
  Ticket,
  Sparkles,
  ShieldCheck,
  Zap,
  QrCode,
  Armchair,
  ArrowDown,
  LogIn,
  UserPlus,
  Star,
  Clapperboard,
  CalendarClock
} from 'lucide-react'
import { AuthButton } from '@/components/auth-button'
import { PopSeatLogo } from '@/components/pop-seat-logo'
import { HeroAuthCta } from '@/components/home/hero-auth-cta'
import { MiddleAuthCta } from '@/components/home/middle-auth-cta'
import { PreFooterCta } from '@/components/home/pre-footer-cta'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  let movies: any[] = []
  let comingSoon: any[] = []
  let isLoggedIn = false

  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const cookieStore = await cookies()
    const popseatCookie = cookieStore.get('popseat_user')
    isLoggedIn = !!user || !!popseatCookie?.value

    // 1. Fetch all movies
    const { data: movieData } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    // 2. Fetch all showtimes
    const { data: showtimeData } = await supabase
      .from('showtimes')
      .select('*')
      .order('start_time', { ascending: true })

    // 3. Fetch all bookings to check seat reservations
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('showtime_id')

    // 4. Fetch coming soon titles
    const { data: csData } = await supabase
      .from('coming_soon')
      .select('*')
      .order('release_date', { ascending: true })
    comingSoon = csData || []

    // Total cinema capacity: 120 seats (Rows A-J x 12 seats)
    const totalSeats = 120

    if (movieData) {
      movies = movieData.map((movie) => {
        const movieShowtimes = (showtimeData || []).filter(
          (st) => st.movie_id === movie.id
        ).map((st) => {
          const bookedCount = (bookingData || []).filter(
            (b) => b.showtime_id === st.id
          ).length
          const isFullyBooked = bookedCount >= totalSeats
          return {
            ...st,
            bookedCount,
            totalSeats,
            isFullyBooked
          }
        })

        const isFullyBooked =
          movieShowtimes.length > 0 && movieShowtimes.every((st) => st.isFullyBooked)

        return {
          ...movie,
          showtimes: movieShowtimes,
          isFullyBooked
        }
      })
    }
  } catch (err) {
    console.error('Error fetching customer movies:', err)
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col selection:bg-red-700 selection:text-white">
      {/* Sticky Header Navigation */}
      <header className="border-b border-zinc-800 bg-black/85 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <PopSeatLogo />
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-400">
            <a href="#movies" className="hover:text-red-400 transition-colors">
              Now Showing
            </a>
            <a href="#features" className="hover:text-red-400 transition-colors">
              Features
            </a>
            <a href="#experience" className="hover:text-red-400 transition-colors">
              The Experience
            </a>
          </nav>

          {/* Right Action: Auth Buttons */}
          <div className="flex items-center gap-3">
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Hero Landing Section with Background Image & Fade to Black */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer with Poster Collage & Fade-to-Black Gradients */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Base Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform motion-safe:animate-pulse [animation-duration:8s]"
            style={{ backgroundImage: `url('/landing-bg.jpg')` }}
          />

          {/* Layer 1: Dark Obsidian Tint */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[1.5px]" />

          {/* Layer 2: Radial Black & Dark Red Vignette (Subtle Crimson Center, Deep Black on Edges) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(127, 29, 29, 0.18) 0%, rgba(5, 5, 5, 0.88) 60%, rgba(0, 0, 0, 0.99) 100%)',
            }}
          />

          {/* Layer 3: Vertical Top-to-Bottom Fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-transparent to-black" />

          {/* Layer 4: Deep Black Bottom Fade Transition into Content */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/90 to-transparent" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-semibold shadow-lg shadow-red-950/40 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Next-Gen Cinema Ticketing & Live Seat Locking</span>
          </div>

          {/* Hero Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
              Every Movie. Every Seat.{' '}
              <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600 drop-shadow-sm">
                Locked In Real-Time.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Skip box office queues. Discover world-class cinema, handpick your luxury recliner seats with instant live reservations, and receive digital QR passes right to your phone.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#movies"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-sm tracking-wide shadow-xl shadow-red-950/50 flex items-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-white" />
              <span>Browse Now Showing</span>
              <ArrowDown className="w-4 h-4 text-white animate-bounce" />
            </a>

            <HeroAuthCta />
          </div>

          {/* Quick Cinema Guarantees Ribbon */}
          <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
              <Zap className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">Live Redis Hold</p>
                <p className="text-[10px] text-neutral-400">Zero double-bookings</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
              <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">Instant QR Passes</p>
                <p className="text-[10px] text-neutral-400">Paperless entrance</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
              <Armchair className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">Luxury Recliners</p>
                <p className="text-[10px] text-neutral-400">Pick your exact row</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">Guaranteed Lock</p>
                <p className="text-[10px] text-neutral-400">5-minute hold timer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section id="features" className="py-20 bg-black border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest bg-red-950/40 px-3 py-1 rounded-full border border-red-800/40">
              Why Choose PopSeat
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Built For Seamless Cinema Night
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Experience the pinnacle of cinema reservation technology designed to give you priority access and flawless seat selection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-800 hover:border-red-700/50 transition-all group backdrop-blur-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Armchair className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                Interactive Cinema Map
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                View real-time auditorium arrangements with Standard, Premium, and VIP rows clearly marked. Select your exact seats with immediate feedback.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-800 hover:border-cyan-500/40 transition-all group backdrop-blur-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                Anti-Clash Seat Locks
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Backed by distributed Redis locks. The moment you tap a seat, it is temporarily reserved for you for 5 minutes, preventing anyone else from taking it.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/40 transition-all group backdrop-blur-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Instant Mobile QR E-Ticket
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Complete checkout and get an authentic digital cinema ticket complete with scannable QR verification code, ready for instant entrance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Showcase Banner */}
      <section id="experience" className="py-16 bg-gradient-to-b from-black via-zinc-950/80 to-black border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-red-950/30 via-zinc-950 to-red-950/20 border border-red-900/40 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md">
            <div className="space-y-3 text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/50 text-red-400 text-[11px] font-bold border border-red-800/40">
                <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>The PopSeat Standard</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Ultra-Immersive Sound & 4K Laser Projection
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Every screening hall is calibrated with Dolby Atmos acoustic spatial sound, crisp laser clarity, and climate-controlled luxury seating.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full md:w-auto">
              <a
                href="#movies"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-red-700 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider text-center transition cursor-pointer shadow-lg shadow-red-950/50"
              >
                Book Your Seats
              </a>
              <MiddleAuthCta />
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section id="coming-soon" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full space-y-8 scroll-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">
                  Arriving Soon
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Coming Soon
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Upcoming titles — mark your calendar and be the first to book.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-neutral-400 rounded-full">
              {comingSoon.length} {comingSoon.length === 1 ? 'Title' : 'Titles'} Upcoming
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoon.map((film) => {
              const releaseLabel = film.release_date
                ? new Date(film.release_date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'TBA'

              return (
                <div
                  key={film.id}
                  className="bg-zinc-950/70 border border-violet-900/30 rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col group hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-950/30 transition-all duration-300"
                >
                  {/* Poster */}
                  <div className="relative w-full aspect-[2/3] max-h-96 bg-zinc-900 overflow-hidden border-b border-zinc-800 flex items-center justify-center">
                    {film.poster_url ? (
                      <img
                        src={film.poster_url}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-neutral-600">
                        <Clapperboard className="h-10 w-10" />
                        <span className="text-xs font-semibold">Poster Coming Soon</span>
                      </div>
                    )}

                    {/* Genre badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      {film.genre || 'Cinema'}
                    </div>

                    {/* Coming Soon ribbon */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-violet-700/90 backdrop-blur-md border border-violet-400/30 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-lg">
                      Coming Soon
                    </div>

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                    {/* Release date pinned at bottom of poster */}
                    <div className="absolute bottom-3 left-0 right-0 px-4">
                      <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md rounded-xl px-3 py-2 border border-violet-800/40">
                        <CalendarClock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="text-xs font-bold text-violet-200">{releaseLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                        <Clock className="h-3.5 w-3.5 text-violet-400" />
                        <span>{film.duration_minutes || 120} mins</span>
                      </div>
                      {film.ticket_price && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/30">
                          Est. &#8369;{Number(film.ticket_price).toFixed(0)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-white leading-snug group-hover:text-violet-300 transition-colors">
                      {film.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {film.description || 'No plot summary available.'}
                    </p>

                    {(film.directed_by || film.cast_list) && (
                      <div className="pt-2 border-t border-zinc-800 space-y-1">
                        {film.directed_by && (
                          <p className="text-[10px] text-neutral-500">
                            <span className="text-neutral-400 font-semibold">Director:</span> {film.directed_by}
                          </p>
                        )}
                        {film.cast_list && (
                          <p className="text-[10px] text-neutral-500 line-clamp-1">
                            <span className="text-neutral-400 font-semibold">Cast:</span> {film.cast_list}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer CTA */}
                  <div className="px-6 pb-6">
                    <div className="w-full py-2.5 rounded-2xl bg-violet-950/40 border border-violet-800/30 text-center text-xs font-bold text-violet-400 tracking-wide">
                      Tickets Available on Release
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Movies Catalog Section */}
      <main id="movies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-8 scroll-mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">
                Cinema Catalog
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Now Showing in Theaters
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              Select your screening and proceed directly to live seat selection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-neutral-400 rounded-full">
              {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'} Scheduled
            </span>
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="py-20 text-center bg-zinc-950/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm space-y-4">
            <Film className="h-12 w-12 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Movies Currently Scheduled</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              No movie entries currently exist in the catalog. Please check back soon for upcoming theatrical releases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className={`bg-zinc-950/70 border rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col justify-between transition-all duration-300 group ${
                  movie.isFullyBooked
                    ? 'border-rose-900/50 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/10'
                    : 'border-zinc-800 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-950/30'
                }`}
              >
                <div>
                  <div className="relative w-full aspect-[2/3] max-h-96 bg-zinc-900 overflow-hidden border-b border-zinc-800 flex items-center justify-center">
                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          movie.isFullyBooked ? 'grayscale-[20%] opacity-90' : ''
                        }`}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-neutral-600">
                        <Film className="h-10 w-10" />
                        <span className="text-xs font-semibold">No Poster Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                      {movie.genre || 'Cinema'}
                    </div>

                    {/* Fully Booked Indicator Badge */}
                    {movie.isFullyBooked && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-rose-600/95 backdrop-blur-md border border-rose-400 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-lg shadow-rose-950/60 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Fully Booked
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                        <Clock className="h-3.5 w-3.5 text-red-500" />
                        <span>{movie.duration || movie.duration_minutes || 120} mins</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-neutral-300 border border-zinc-800">
                        HD 4K Laser
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white leading-snug group-hover:text-red-400 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {movie.description || 'No plot summary available.'}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-red-500" />
                    Available Showtimes
                  </span>

                  {movie.showtimes && movie.showtimes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {movie.showtimes.map((st: any) => (
                        <Link
                          key={st.id}
                          href={`/showtime/${st.id}`}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition group/btn ${
                            st.isFullyBooked
                              ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/40 text-neutral-300'
                              : 'bg-black/70 border-zinc-800 hover:border-red-600/50 hover:bg-zinc-900 text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={st.isFullyBooked ? 'text-neutral-300 font-bold' : 'text-red-400 font-bold'}>
                              {new Date(st.start_time).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              •{' '}
                              {new Date(st.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-neutral-500 font-normal text-[11px]">
                              ({st.cinema_hall || 'Hall 1'})
                            </span>
                          </div>
                          {st.isFullyBooked ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wide">
                              Fully Booked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-red-400 font-bold group-hover/btn:translate-x-0.5 transition-transform">
                              Select Seats
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800 text-center text-xs text-neutral-500">
                      No showtimes scheduled
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Pre-Footer Action Banner (Client-reactive to login state) */}
      <PreFooterCta />

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 bg-black text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PopSeatLogo className="h-7" />
            <span>— Next-Generation Cinema Reservation</span>
          </div>
          <p>© {new Date().getFullYear()} PopSeat Cinema System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}