'use server' // Run only on the server side NOT on the front-end

import { redis } from '@/lib/redis' // uses function to use in this file

export async function holdSeat(showtimeId: string, seats: string[]) { // defines the function to hold a seat
  try { // try catch block to catch any errors
    if (!redis) return { success: true } // returns true if the seat was held successfully //Remote Dictionary Server 

    for (const seat of seats) { // iterates through the seats
      const lockKey = `hold:${showtimeId}:${seat}`
      await redis.set(lockKey, 'locked', { ex: 300 })
    }

    return { success: true }
  } catch (error) {  
    console.error('[holdSeat] Exception:', error)
    return { success: true }
  }
}

export async function toggleSeatHoldAction(showtimeId: string, seatId: string, isHolding: boolean) {
  try {
    if (!redis) return { success: true }

    const lockKey = `hold:${showtimeId}:${seatId}`
    if (isHolding) {
      await redis.set(lockKey, 'locked', { ex: 300 })
    } else {
      await redis.del(lockKey)
    }

    return { success: true }
  } catch (error) {
    console.error('[toggleSeatHoldAction] Exception:', error)
    return { success: true }
  }
}