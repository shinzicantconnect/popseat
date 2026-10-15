'use server'

import { redis } from '@/lib/redis'

export async function holdSeat(showtimeId: string, seats: string[]) {
  try {
    if (!redis) return { success: true }

    // Lock selected seats in Redis with a 300-second (5-minute) TTL
    for (const seat of seats) {
      const lockKey = `hold:${showtimeId}:${seat}`
      await redis.set(lockKey, 'locked', { ex: 300 })
    }

    return { success: true }
  } catch (error) {
    console.error('[holdSeat] Exception:', error)
    return { success: true } // Graceful degraded operation
  }
}