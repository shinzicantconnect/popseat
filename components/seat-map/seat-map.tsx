'use server'

import { redis } from '@/lib/redis'

export interface HoldSeatResult {
  success: boolean
  message?: string
}

export async function holdSeat(
  showtimeId: string, 
  seats: string[]
): Promise<HoldSeatResult> {
  try {
    if (!redis) return { success: true }

    for (const seat of seats) {
      const lockKey = `hold:${showtimeId}:${seat}`
      await redis.set(lockKey, 'locked', { ex: 300 })
    }

    return { success: true }
  } catch (error: any) {
    console.error('[holdSeat] Exception:', error)
    return { success: false, message: error?.message || 'Could not lock seat.' }
  }
}

export async function toggleSeatHoldAction(
  showtimeId: string,
  seatId: string,
  isHoldingOrUserId?: boolean | string
): Promise<HoldSeatResult> {
  try {
    if (!redis) return { success: true }

    const lockKey = `hold:${showtimeId}:${seatId}`
    const shouldHold = typeof isHoldingOrUserId === 'boolean' ? isHoldingOrUserId : true

    if (shouldHold) {
      await redis.set(lockKey, 'locked', { ex: 300 })
    } else {
      await redis.del(lockKey)
    }

    return { success: true }
  } catch (error: any) {
    console.error('[toggleSeatHoldAction] Exception:', error)
    return { success: false, message: error?.message || 'Could not update seat hold status.' }
  }
}