'use client'

import React from 'react'
import Link from 'next/link'
import { usePopSeatAuth } from '@/lib/auth'

export function MiddleAuthCta() {
  const { isLoggedIn, loading } = usePopSeatAuth()

  // If already logged in, do not show Register Account
  if (loading || isLoggedIn) {
    return null
  }

  return (
    <Link
      href="/login?mode=signup"
      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer"
    >
      Register Account
    </Link>
  )
}
