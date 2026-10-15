'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { addMovieAction } from '@/lib/actions/add-movie'
import { deleteMovieAction } from '@/lib/actions/delete-movie'
import { addComingSoonAction, deleteComingSoonAction } from '@/lib/actions/coming-soon'
import {
  Film,
  Calendar,
  Ticket,
  ChevronLeft,
  Clock,
  Upload,
  Plus,
  X,
  Image as ImageIcon,
  Trash2,
  Building,
  Sparkles,
  CalendarClock,
  Users,
  Clapperboard,
} from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'nowshowing' | 'comingsoon'>('nowshowing')

  // --- Now Showing state ---
  const [movies, setMovies] = useState<any[]>([])
  const [bookingsCount, setBookingsCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // --- Coming Soon state ---
  const [comingSoon, setComingSoon] = useState<any[]>([])
  const [isCSOpen, setIsCSOpen] = useState(false)
  const [isCSSubmitting, setIsCSSubmitting] = useState(false)
  const [csPreviewUrl, setCsPreviewUrl] = useState<string | null>(null)
  const [deletingCSId, setDeletingCSId] = useState<string | null>(null)

  const [customerUrl, setCustomerUrl] = useState('/')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { protocol, host } = window.location
      if (host.startsWith('admin.')) {
        setCustomerUrl(`${protocol}//${host.replace(/^admin\./, '')}/`)
      } else if (host.startsWith('admin:')) {
        setCustomerUrl(`${protocol}//localhost:${host.split(':')[1]}/`)
      } else {
        setCustomerUrl('/')
      }
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMovies(data)
      })

    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count != null) setBookingsCount(count)
      })

    supabase
      .from('coming_soon')
      .select('*')
      .order('release_date', { ascending: true })
      .then(({ data }) => {
        if (data) setComingSoon(data)
      })
  }, [])

  // ── NOW SHOWING handlers ──────────────────────────────────────────────────

  async function handleAddMovie(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await addMovieAction(formData)
    if (result.success) {
      setIsOpen(false)
      setPreviewUrl(null)
      ;(e.target as HTMLFormElement).reset()
      // Refetch movies list after successful add
      const supabase = createClient()
      const { data } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setMovies(data)
    } else {
      alert(`Failed to add movie: ${result.message}`)
    }
    setIsSubmitting(false)
  }

  async function handleDeleteMovie(id: string) {
    if (!confirm('Delete this movie and all its showtimes?')) return
    setDeletingId(id)
    const result = await deleteMovieAction(id)
    if (result.success) {
      setMovies(movies.filter((m) => m.id !== id))
    } else {
      alert(`Failed to delete: ${result.message}`)
    }
    setDeletingId(null)
  }

  // ── COMING SOON handlers ──────────────────────────────────────────────────

  async function handleAddComingSoon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCSSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await addComingSoonAction(formData)
    if (result.success) {
      setIsCSOpen(false)
      setCsPreviewUrl(null)
      ;(e.target as HTMLFormElement).reset()
      // Refetch coming soon list after successful add
      const supabase = createClient()
      const { data } = await supabase
        .from('coming_soon')
        .select('*')
        .order('release_date', { ascending: true })
      if (data) setComingSoon(data)
    } else {
      alert(`Failed to add coming soon title: ${result.message}`)
    }
    setIsCSSubmitting(false)
  }

  async function handleDeleteComingSoon(id: string) {
    if (!confirm('Delete this Coming Soon title?')) return
    setDeletingCSId(id)
    const result = await deleteComingSoonAction(id)
    if (result.success) {
      setComingSoon(comingSoon.filter((m) => m.id !== id))
    } else {
      alert(`Failed to delete: ${result.message}`)
    }
    setDeletingCSId(null)
  }

  const formatReleaseDate = (dateStr: string) => {
    if (!dateStr) return 'TBA'
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              POP<span className="text-red-500">SEAT</span>
            </Link>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-800/40 rounded uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
          <a
            href={customerUrl}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Customer View
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">Management Console</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Manage Now Showing movies and upcoming Coming Soon titles.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-neutral-400">Now Showing</p>
              <p className="text-3xl font-black text-white mt-1">{movies.length}</p>
            </div>
            <div className="p-3 bg-red-950/40 rounded-xl text-red-500 border border-red-800/40">
              <Film className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-neutral-400">Coming Soon</p>
              <p className="text-3xl font-black text-white mt-1">{comingSoon.length}</p>
            </div>
            <div className="p-3 bg-violet-950/40 rounded-xl text-violet-400 border border-violet-800/40">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-neutral-400">Total Bookings</p>
              <p className="text-3xl font-black text-white mt-1">{bookingsCount}</p>
            </div>
            <div className="p-3 bg-red-950/40 rounded-xl text-red-500 border border-red-800/40">
              <Ticket className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-neutral-400">Status</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">Self-Hosted</p>
            </div>
            <div className="p-3 bg-red-950/40 rounded-xl text-red-500 border border-red-800/40">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950/80 border border-zinc-800 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('nowshowing')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'nowshowing'
                ? 'bg-red-700 text-white shadow-lg shadow-red-950/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            Now Showing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comingsoon')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'comingsoon'
                ? 'bg-violet-700 text-white shadow-lg shadow-violet-950/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Coming Soon
          </button>
        </div>

        {/* ── NOW SHOWING TAB ── */}
        {activeTab === 'nowshowing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Now Showing Movies</h2>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-red-950/40"
              >
                <Plus className="h-4 w-4" />
                Add Movie
              </button>
            </div>

            {movies.length === 0 ? (
              <div className="py-16 text-center bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                <Film className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">No movies yet. Add your first movie above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-zinc-950/70 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full aspect-[2/3] max-h-72 bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-800">
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="h-10 w-10 text-neutral-600" />
                      )}
                    </div>
                    <div className="p-4 space-y-2 flex-1">
                      <h3 className="font-black text-white text-base leading-snug">{movie.title}</h3>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {movie.genre && (
                          <span className="px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-800/30 rounded-full font-bold">
                            {movie.genre}
                          </span>
                        )}
                        {movie.duration_minutes && (
                          <span className="flex items-center gap-1 text-neutral-400">
                            <Clock className="h-3 w-3" />
                            {movie.duration_minutes} min
                          </span>
                        )}
                      </div>
                      {movie.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2">{movie.description}</p>
                      )}
                    </div>
                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        type="button"
                        disabled={deletingId === movie.id}
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/30 text-rose-400 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === movie.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMING SOON TAB ── */}
        {activeTab === 'comingsoon' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Coming Soon Titles</h2>
              <button
                type="button"
                onClick={() => setIsCSOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-violet-950/40"
              >
                <Plus className="h-4 w-4" />
                Add Title
              </button>
            </div>

            {comingSoon.length === 0 ? (
              <div className="py-16 text-center bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                <Clapperboard className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">No upcoming titles yet. Add your first one above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {comingSoon.map((film) => (
                  <div
                    key={film.id}
                    className="bg-zinc-950/70 border border-violet-900/30 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full aspect-[2/3] max-h-72 bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-800">
                      {film.poster_url ? (
                        <img
                          src={film.poster_url}
                          alt={film.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Clapperboard className="h-10 w-10 text-neutral-600" />
                      )}
                    </div>
                    <div className="p-4 space-y-2 flex-1">
                      <h3 className="font-black text-white text-base leading-snug">{film.title}</h3>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {film.genre && (
                          <span className="px-2 py-0.5 bg-violet-950/40 text-violet-400 border border-violet-800/30 rounded-full font-bold">
                            {film.genre}
                          </span>
                        )}
                        {film.release_date && (
                          <span className="flex items-center gap-1 text-neutral-400">
                            <CalendarClock className="h-3 w-3" />
                            {formatReleaseDate(film.release_date)}
                          </span>
                        )}
                      </div>
                      {film.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2">{film.description}</p>
                      )}
                    </div>
                    <div className="p-4 pt-0">
                      <button
                        type="button"
                        disabled={deletingCSId === film.id}
                        onClick={() => handleDeleteComingSoon(film.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/30 text-rose-400 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingCSId === film.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── ADD MOVIE MODAL ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Add New Movie</h2>
              <button
                type="button"
                onClick={() => { setIsOpen(false); setPreviewUrl(null) }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMovie} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Movie Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Inception"
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief plot summary…"
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Genre</label>
                  <input
                    name="genre"
                    placeholder="e.g. Sci-Fi"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Duration (min)</label>
                  <input
                    name="duration_minutes"
                    type="number"
                    min={1}
                    placeholder="120"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Poster Image URL</label>
                <div className="flex gap-2">
                  <input
                    name="poster_url"
                    type="url"
                    placeholder="https://…"
                    onChange={(e) => setPreviewUrl(e.target.value || null)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                  />
                </div>
                {previewUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800 w-24 h-32">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewUrl(null)} />
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-red-500" />
                  Add Showtime (optional)
                </p>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Date & Time</label>
                  <input
                    name="start_time"
                    type="datetime-local"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 focus:outline-none focus:border-red-600 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      <Building className="inline h-3 w-3 mr-1" />Hall Name
                    </label>
                    <input
                      name="hall_name"
                      placeholder="e.g. Hall 1"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      <Users className="inline h-3 w-3 mr-1" />Ticket Price (₱)
                    </label>
                    <input
                      name="ticket_price"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="350.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-red-950/50"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="h-4 w-4 animate-pulse" />
                    Adding Movie…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Movie to Catalog
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD COMING SOON MODAL ── */}
      {isCSOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Add Coming Soon Title
              </h2>
              <button
                type="button"
                onClick={() => { setIsCSOpen(false); setCsPreviewUrl(null) }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddComingSoon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Dune: Part Three"
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief plot summary…"
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Genre</label>
                  <input
                    name="genre"
                    placeholder="e.g. Action"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Duration (min)</label>
                  <input
                    name="duration_minutes"
                    type="number"
                    min={1}
                    placeholder="120"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Release Date</label>
                  <input
                    name="release_date"
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 focus:outline-none focus:border-violet-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Est. Ticket Price (₱)</label>
                  <input
                    name="ticket_price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="350.00"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Director</label>
                  <input
                    name="directed_by"
                    placeholder="e.g. Denis Villeneuve"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Cast</label>
                  <input
                    name="cast_list"
                    placeholder="e.g. Timothée Chalamet, …"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Poster Image URL</label>
                <input
                  name="poster_url"
                  type="url"
                  placeholder="https://…"
                  onChange={(e) => setCsPreviewUrl(e.target.value || null)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-600 transition"
                />
                {csPreviewUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800 w-24 h-32">
                    <img src={csPreviewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setCsPreviewUrl(null)} />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isCSSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-700 to-violet-800 hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-violet-950/50"
              >
                {isCSSubmitting ? (
                  <>
                    <Upload className="h-4 w-4 animate-pulse" />
                    Adding Title…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Coming Soon Title
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
