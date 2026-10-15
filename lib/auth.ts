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
    window.dispatchEvent(new Event('popseat-auth-change'))
  } else {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('popseat-auth-change'))
  }
}

