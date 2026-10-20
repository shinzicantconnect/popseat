'use client'

import React from 'react'
import Link from 'next/link'
import { Ticket, Film } from 'lucide-react'
import { usePopSeatAuth } from '@/lib/auth'

export function PreFooterCta() {
  const { user, isLoggedIn, loading } = usePopSeatAuth()

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member'

  return (
    <section className="py-16 border-t border-zinc-900 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex p-3 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-400">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Ready to Catch the Next Screening?
        </h2>

        {!loading && isLoggedIn ? (
          <>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Welcome back, <span className="text-white font-semibold">{displayName}</span>! Pick your luxury recliner seats with instant live reservations and digital passes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#movies"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-red-950/50 flex items-center gap-2"
              >
                <Film className="w-4 h-4 text-white" />
                <span>Browse Now Showing</span>
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Create your account today or sign in to save your electronic passes and access fast-track booking.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?mode=signup"
                className="px-6 py-3 rounded-2xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-red-950/50"
              >
                Register Now
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-neutral-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
