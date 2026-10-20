'use client'

import React from 'react'
import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'
import { usePopSeatAuth } from '@/lib/auth'

export function HeroAuthCta() {
  const { isLoggedIn, loading } = usePopSeatAuth()

  // If already authenticated, do not show Sign In or Create Account
  if (loading || isLoggedIn) {
    return null
  }

  return (
    <>
      <Link
        href="/login"
        className="px-6 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-white font-bold text-sm tracking-wide backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:border-zinc-700"
      >
        <LogIn className="w-4 h-4 text-red-500" />
        <span>Sign In to PopSeat</span>
      </Link>

      <Link
        href="/login?mode=signup"
        className="px-6 py-3.5 rounded-2xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-400 font-bold text-sm tracking-wide backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:border-red-700/60"
      >
        <UserPlus className="w-4 h-4" />
        <span>Create Account</span>
      </Link>
    </>
  )
}
