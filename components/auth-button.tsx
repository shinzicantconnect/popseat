'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPopSeatUser, setPopSeatLocalUser, PopSeatUser } from '@/lib/auth'
import { User, LogOut, LogIn } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

export function AuthButton() {
  const router = useRouter()
  const [user, setUser] = useState<PopSeatUser | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const refreshUser = () => {
    getPopSeatUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshUser()

    // 1. Supabase Auth state subscription
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      refreshUser()
    })

    // 2. Custom local auth change event listener
    const handleAuthChange = () => {
      refreshUser()
    }
    window.addEventListener('popseat-auth-change', handleAuthChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('popseat-auth-change', handleAuthChange)
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore network signout errors
    }
    setPopSeatLocalUser(null)
    setUser(null)
    router.refresh()
  }

  if (loading) {
    return (
      <Skeleton className="h-8 w-24 rounded-full bg-zinc-800" />
    )
  }

  if (user) {
    const displayName =
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Member'

    return (
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-neutral-200">
          <User className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold max-w-[120px] sm:max-w-[160px] truncate">
            {displayName}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          title="Sign Out"
          className="p-1.5 rounded-full text-neutral-400 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 text-neutral-300 hover:text-white hover:bg-zinc-850 rounded-full transition cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5 text-red-500" />
        <span>Sign In</span>
      </Link>
      <Link
        href="/login?mode=signup"
        className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white rounded-full transition shadow-md shadow-red-950/50 cursor-pointer"
      >
        <span>Register</span>
      </Link>
    </div>
  )
}

export default AuthButton
