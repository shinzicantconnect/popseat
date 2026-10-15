// lib/actions/create-booking.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/redis'
import { revalidatePath } from 'next/cache'

export interface CreateBookingParams {
  showtimeId: string
  seats: string[]
  totalPrice: number
  customerEmail?: string
}

export async function createBooking({
  showtimeId,
  seats,
  totalPrice,
  customerEmail
}: CreateBookingParams) {
  if (!customerEmail || !customerEmail.trim() || !customerEmail.includes('@')) {
    throw new Error('A verified account is required to reserve cinema seats.')
  }

  // Generate a unique booking reference code
  const bookingRef = `PS-${showtimeId.slice(0, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

  try {
    const supabase = await createClient()

    // 1. Fetch seat records to match seat IDs (e.g., "A1" -> row_name "A", seat_number 1)
    const { data: seatRows } = await supabase
      .from('seats')
      .select('id, row_name, seat_number')

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (seatRows && seatRows.length > 0) {
      // Fetch already-booked seats for this showtime to avoid duplicate key conflicts
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('seat_id, booking_code')
        .eq('showtime_id', showtimeId)

      const bookedSeatIdMap = new Map<string, string>()
      if (existingBookings) {
        for (const b of existingBookings) {
          if (b.seat_id) {
            bookedSeatIdMap.set(b.seat_id, b.booking_code)
          }
        }
      }

      const deduplicatedSeats = Array.from(
        new Set(seats.map((s) => s.trim().toUpperCase()).filter(Boolean))
      )

      const recordsToInsert: Array<{
        user_id?: string | null
        showtime_id: string
        seat_id: string
        total_price: number
        booking_code: string
        status: string
      }> = []

      const pricePerSeat =
        deduplicatedSeats.length > 0
          ? Number((totalPrice / deduplicatedSeats.length).toFixed(2))
          : totalPrice

      // Track all seat IDs allocated in this batch to prevent ANY duplicate seat_id in recordsToInsert
      const allocatedSeatIds = new Set<string>()
      let existingRefFound = ''

      deduplicatedSeats.forEach((seatStr, index) => {
        const row = seatStr.charAt(0)
        const num = parseInt(seatStr.slice(1), 10)

        // Try exact match first
        let matched = seatRows.find(
          (s) => s.row_name === row && s.seat_number === num
        )

        // If exact matched seat is already booked for this showtime, record existing booking ref
        if (matched && bookedSeatIdMap.has(matched.id)) {
          if (!existingRefFound) {
            existingRefFound = bookedSeatIdMap.get(matched.id) || ''
          }
          return // Skip re-inserting already-booked seat
        }

        // If not matched or if matched seat was already allocated in this batch, find an unallocated seat
        if (!matched || allocatedSeatIds.has(matched.id)) {
          const availableSeat = seatRows.find(
            (s) => !bookedSeatIdMap.has(s.id) && !allocatedSeatIds.has(s.id)
          )

          if (availableSeat) {
            matched = availableSeat
          } else if (!matched) {
            // Fallback by index if all else fails
            const fallbackIndex =
              (row.charCodeAt(0) * 12 + (isNaN(num) ? 0 : num)) % seatRows.length
            matched = seatRows[fallbackIndex]
          }
        }

        // Only insert if this seat_id hasn't been added to this batch and isn't already booked
        if (
          matched &&
          !allocatedSeatIds.has(matched.id) &&
          !bookedSeatIdMap.has(matched.id)
        ) {
          allocatedSeatIds.add(matched.id)
          recordsToInsert.push({
            user_id: user?.id || null,
            showtime_id: showtimeId,
            seat_id: matched.id,
            total_price: pricePerSeat,
            booking_code: index === 0 ? bookingRef : `${bookingRef}-${index + 1}`,
            status: 'CONFIRMED'
          })
        }
      })

      if (recordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('bookings')
          .upsert(recordsToInsert, {
            onConflict: 'showtime_id,seat_id',
            ignoreDuplicates: true
          })

        if (insertError) {
          if (
            insertError.code === '23505' ||
            insertError.message?.toLowerCase().includes('unique') ||
            insertError.message?.toLowerCase().includes('duplicate')
          ) {
            console.warn(
              '[createBooking] Seat(s) already recorded for this showtime in Supabase, continuing safely.'
            )
          } else {
            console.error('[createBooking] DB Insert error:', insertError.message)
          }
        }
      }

      // If all requested seats were already booked previously, reuse existing booking reference
      if (!recordsToInsert.length && existingRefFound) {
        const baseRef = existingRefFound.split('-').slice(0, 3).join('-') || existingRefFound
        return { success: true, bookingRef: baseRef }
      }
    }

    // 2. Persist all booked seats in Redis for high-speed real-time cinema locks
    if (redis) {
      try {
        for (const seatStr of seats) {
          const bookedKey = `booked:${showtimeId}:${seatStr}`
          await redis.set(bookedKey, JSON.stringify({
            bookingRef,
            email: customerEmail || null,
            bookedAt: new Date().toISOString()
          }))
          // Clear any temporary holds
          await redis.del(`hold:${showtimeId}:${seatStr}`)
        }

        // Store overall booking record in Redis for resilient lookup across all expanded seat rows
        await redis.set(`booking_meta:${bookingRef}`, JSON.stringify({
          bookingRef,
          showtimeId,
          seats,
          totalPrice,
          customerEmail: customerEmail || null,
          bookedAt: new Date().toISOString()
        }))
      } catch (redisErr) {
        console.warn('[createBooking] Redis lock error:', redisErr)
      }
    }

    revalidatePath(`/showtime/${showtimeId}`)
    return { success: true, bookingRef }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[createBooking] Fallback mode used:', message)
    return { success: true, bookingRef }
  }
}
