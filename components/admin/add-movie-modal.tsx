'use client'

import React, { useState } from 'react'
import { X, Film, Clock, Image as ImageIcon, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { addMovie } from '@/lib/actions/add-movie'

interface AddMovieModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddMovieModal({ isOpen, onClose, onSuccess }: AddMovieModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [genre, setGenre] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDurationMinutes('')
    setPosterUrl('')
    setGenre('')
    setErrorMessage(null)
    setIsSuccess(false)
  }

  const handleClose = () => {
    if (isLoading) return
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!title.trim()) {
      setErrorMessage('Movie title is required.')
    }

    const duration = parseInt(durationMinutes, 10)
    if (!duration || duration <= 0) {
      setErrorMessage('Please enter a valid duration in minutes.')
      return
    }

    setIsLoading(true)

    try {
      const res = await addMovie({
        title,
        description,
        durationMinutes: duration,
        posterUrl: posterUrl.trim() || undefined,
        genre: genre.trim() || undefined,
      })

      if (res?.success) {
        setIsSuccess(true)
        setTimeout(() => {
          handleClose()
          if (onSuccess) onSuccess()
        }, 1200)
      } else {
        setErrorMessage(res?.error || 'Failed to save movie. Please try again.')
      }
    } catch {
      setErrorMessage('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add New Movie</h3>
              <p className="text-xs text-neutral-400">Add a film to your catalog & database</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Movie added successfully!</span>
            </div>
          )}

          {/* Title & Duration row */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-red-500" />
              Movie Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inception"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-red-500" />
                Duration (mins) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="148"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <span>Genre</span>
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Action, Sci-Fi"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Poster URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-red-500" />
              Poster Image URL
            </label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://image.tmdb.org/t/p/w500/... or /uploads/..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition disabled:opacity-50"
            />
            {posterUrl && (
              <div className="mt-2 p-2 bg-black/60 rounded-xl border border-zinc-800 flex items-center gap-3">
                <img
                  src={posterUrl}
                  alt="Poster preview"
                  className="w-10 h-14 object-cover rounded-md bg-zinc-900 border border-zinc-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none'
                  }}
                />
                <span className="text-[11px] text-neutral-400 truncate">Poster preview</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-red-500" />
              Synopsis / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter short storyline or synopsis..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition resize-none disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-zinc-900 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-600 active:scale-95 rounded-xl transition shadow-lg shadow-red-950/40 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Movie'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMovieModal
