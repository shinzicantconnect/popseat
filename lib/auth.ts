'use client'

import { createClient } from '@/lib/supabase/client'

export interface PopSeatUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

export interface RegisteredAccount {
  id: string
  email: string
  fullName: string
  password?: string
  createdAt?: string
}

const STORAGE_KEY = 'popseat_session_user'
const ACCOUNTS_KEY = 'popseat_registered_accounts'

export function getStoredAccounts(): Record<string, RegisteredAccount> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveStoredAccount(account: RegisteredAccount) {
  if (typeof window === 'undefined') return
  try {
    const accounts = getStoredAccounts()
    accounts[account.email.toLowerCase()] = account
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Ignore storage errors
  }
}

export async function getPopSeatUser(): Promise<PopSeatUser | null> {
  // 1. Check local session first for instant responsiveness
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) {
      try {
        return JSON.parse(local) as PopSeatUser
      } catch {
        // Ignore JSON error
      }
    }
  }

  // 2. Check Supabase session
  try {
    const supabase = createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (user && user.email) {
      return {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      }
    }
  } catch {
    // Continue
  }

  return null
}

export function setPopSeatLocalUser(user: PopSeatUser | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    try {
      document.cookie = `popseat_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`
    } catch {
      // Ignore cookie errors
    }
    window.dispatchEvent(new Event('popseat-auth-change'))
  } else {
    localStorage.removeItem(STORAGE_KEY)
    try {
      document.cookie = 'popseat_user=; path=/; max-age=0; SameSite=Lax'
    } catch {
      // Ignore cookie errors
    }
    window.dispatchEvent(new Event('popseat-auth-change'))
  }
}

import { useState, useEffect } from 'react'

export function usePopSeatAuth() {
  const [user, setUser] = useState<PopSeatUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const syncAuth = async () => {
      try {
        const u = await getPopSeatUser()
        if (isMounted) {
          setUser(u)
          setLoading(false)
        }
      } catch {
        if (isMounted) setLoading(false)
      }
    }

    syncAuth()

    const handleAuthChange = () => {
      syncAuth()
    }

    window.addEventListener('popseat-auth-change', handleAuthChange)

    let subscription: { unsubscribe: () => void } | null = null
    try {
      const supabase = createClient()
      const { data } = supabase.auth.onAuthStateChange(() => {
        syncAuth()
      })
      subscription = data?.subscription || null
    } catch {
      // Continue
    }

    return () => {
      isMounted = false
      window.removeEventListener('popseat-auth-change', handleAuthChange)
      subscription?.unsubscribe()
    }
  }, [])

  return { user, isLoggedIn: !!user, loading }
}


