'use client'

import React, { useState, useEffect } from 'react'
import { SeatLegend } from './seat-legend'
import { SeatButton } from './seat-button'
import { LockTimer } from './lock-timer'
import { Film, Armchair } from 'lucide-react'
import { BookingSummary } from '@/components/booking/booking-summary'
import { CheckoutModal } from '@/components/booking/checkout-modal'
import { getPopSeatUser, PopSeatUser } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/actions/stripe'

export interface Seat {
  id: string
  row: string
  number: number
  type: 'standard' | 'vip' | 'accessible'
  price: number
  status: 'available' | 'selected' | 'held' | 'booked'
}

export interface SeatSelectorProps {
  showtimeId: string
  hallName?: string
  basePrice?: number
  ticketPrice?: number
  vipPrice?: number
  isFullyBooked?: boolean
  reservedSeats?: string[]
  movieTitle?: string
  moviePoster?: string | null
  startTime?: string
  onProceedToCheckout?: (selectedSeats: Seat[]) => void
}

export const DEFAULT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
export const SEATS_PER_ROW = 12

export function generateInitialSeats(
  basePrice: number = 300,
  reservedSeats: string[] = [],
  vipPrice: number = 350
): Seat[] {
  const seats: Seat[] = []

  DEFAULT_ROWS.forEach((row, rowIndex) => {
    // Back two rows (I & J) are VIP recliners (24 VIP seats total)
    const isVip = rowIndex >= DEFAULT_ROWS.length - 2
    const seatPrice = isVip ? (vipPrice ?? 350) : (basePrice ?? 300)

    for (let num = 1; num <= SEATS_PER_ROW; num++) {
      const seatId = `${row}${num}`
      const isBooked = reservedSeats.includes(seatId)
      const isAccessible = rowIndex === 0 && (num <= 2 || num >= SEATS_PER_ROW - 1)

      seats.push({
        id: seatId,
        row,
        number: num,
        type: isVip
          ? 'vip'
          : (isAccessible ? 'accessible' : 'standard'),
        price: seatPrice,
        status: isBooked ? 'booked' : 'available'
      })
    }
  })

  return seats
}

export function SeatSelector({
  showtimeId,
  hallName = 'Main Cinema Hall',
  basePrice = 300,
  ticketPrice,
  vipPrice = 350,
  isFullyBooked = false,
  reservedSeats = [],
  movieTitle,
  moviePoster,
  startTime,
  onProceedToCheckout
}: SeatSelectorProps) {
  const effectiveBasePrice = ticketPrice ?? basePrice
  const effectiveVipPrice = vipPrice ?? 350
  const [seats, setSeats] = useState<Seat[]>(() =>
    generateInitialSeats(effectiveBasePrice, reservedSeats, effectiveVipPrice)
  )
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isProcessingStripe, setIsProcessingStripe] = useState(false)
  const [currentUser, setCurrentUser] = useState<PopSeatUser | null>(null)

  // Track authentication status to ensure account is required before booking
  useEffect(() => {
    getPopSeatUser().then((u) => setCurrentUser(u))
    const handleAuthChange = () => {
      getPopSeatUser().then((u) => setCurrentUser(u))
    }
    window.addEventListener('popseat-auth-change', handleAuthChange)
    return () => window.removeEventListener('popseat-auth-change', handleAuthChange)
  }, [])

  // Re-synchronize seats whenever reservedSeats or price updates
  useEffect(() => {
    setSeats(generateInitialSeats(effectiveBasePrice, reservedSeats, effectiveVipPrice))
  }, [effectiveBasePrice, reservedSeats, effectiveVipPrice])

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id))
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0)
  const availableCount = seats.filter((s) => s.status === 'available').length
  const fullyBooked = isFullyBooked || (seats.length > 0 && availableCount === 0)

  const handleSeatClick = (seat: Seat) => {
    if (fullyBooked || seat.status === 'booked' || seat.status === 'held') return

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id))
      if (selectedSeatIds.length <= 1) {
        setIsLocked(false)
      }
    } else {
      setSelectedSeatIds((prev) => [...prev, seat.id])
      setIsLocked(true)
    }
  }

  const handleRemoveSeat = (seatId: string) => {
    setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId))
    if (selectedSeatIds.length <= 1) {
      setIsLocked(false)
    }
  }

  const handleClearSeats = () => {
    setSelectedSeatIds([])
    setIsLocked(false)
  }

  const handleTimerExpire = () => {
    setSelectedSeatIds([])
    setIsLocked(false)
    setIsCheckoutOpen(false)
  }

  const handleTriggerCheckout = async () => {
    if (onProceedToCheckout) {
      onProceedToCheckout(selectedSeats)
      return
    }

    if (selectedSeats.length === 0) return

    try {
      setIsProcessingStripe(true)
      const seatIds = selectedSeats.map((s) => s.id)
      const customerEmail = currentUser?.email || 'edsimonmendoza@gmail.com'

      const res = await createCheckoutSession({
        showtimeId,
        movieTitle: movieTitle || 'Movie Ticket',
        seats: seatIds,
        totalPrice: totalPrice,
        customerEmail
      })

      if (res?.url) {
        window.location.href = res.url
        return
      }
    } catch (err) {
      console.error('[SeatSelector] Stripe checkout session error:', err)
      setIsCheckoutOpen(true)
    } finally {
      setIsProcessingStripe(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Expanded Seat Map */}
        <div className="lg:col-span-7 xl:col-span-8 bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 backdrop-blur-xl shadow-2xl">
          {/* Top Bar: Hall & Seat Availability Counter & Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${fullyBooked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                <h2 className="text-xl font-bold text-white tracking-wide">{hallName}</h2>
                {fullyBooked && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white font-extrabold text-[10px] uppercase tracking-wider shadow flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    Fully Booked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                {fullyBooked ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    Sold Out • No seats available
                  </span>
                ) : (
                  <>
                    <span>Select your preferred seats</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5" />
                      {availableCount} of {seats.length} Available
                    </span>
                  </>
                )}
              </div>
            </div>

            {isLocked && selectedSeats.length > 0 && (
              <LockTimer initialSeconds={300} onExpire={handleTimerExpire} />
            )}
          </div>

          {/* Curved Cinema Screen */}
          <div className="my-8 sm:my-10 flex flex-col items-center">
            <div className="w-11/12 max-w-2xl h-3.5 bg-gradient-to-r from-red-700/20 via-red-600 to-red-700/20 rounded-t-full shadow-[0_-8px_25px_rgba(220,38,38,0.45)]" />
            <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase mt-3 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-red-500" />
              Cinema Screen
            </p>
          </div>

          {/* Seat Map Grid (120 Seats: 10 Rows x 12 Columns) */}
          <div className="overflow-x-auto pb-4 pt-2">
            <div className="min-w-[560px] sm:min-w-[620px] flex flex-col items-center gap-2 sm:gap-2.5">
              {/* Column numbers header */}
              <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] text-neutral-500 font-mono select-none mb-1">
                <span className="w-5 text-center" />
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i + 1} className="w-7 h-4 sm:w-8 md:w-9 flex items-center justify-center text-center">
                      {i + 1}
                    </span>
                  ))}
                </div>
                <div className="w-5 sm:w-7 text-center text-neutral-600 text-[9px] font-bold tracking-widest">
                  AISLE
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i + 7} className="w-7 h-4 sm:w-8 md:w-9 flex items-center justify-center text-center">
                      {i + 7}
                    </span>
                  ))}
                </div>
                <span className="w-5 text-center" />
              </div>

              {DEFAULT_ROWS.map((rowLetter) => {
                const rowSeats = seats
                  .filter((s) => s.row === rowLetter)
                  .sort((a, b) => a.number - b.number)
                const half = Math.floor(SEATS_PER_ROW / 2)
                return (
                  <div key={rowLetter} className="flex items-center gap-2 sm:gap-2.5">
                    <span className="w-5 text-center text-xs font-bold text-neutral-500 font-mono">
                      {rowLetter}
                    </span>

                    {/* Left Wing */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {rowSeats.slice(0, half).map((seat) => (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeatIds.includes(seat.id)}
                          onClick={() => handleSeatClick(seat)}
                        />
                      ))}
                    </div>

                    {/* Central Aisle */}
                    <div className="w-5 sm:w-7 text-center text-[10px] text-neutral-700 font-mono select-none flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                    </div>

                    {/* Right Wing */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {rowSeats.slice(half).map((seat) => (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeatIds.includes(seat.id)}
                          onClick={() => handleSeatClick(seat)}
                        />
                      ))}
                    </div>

                    <span className="w-5 text-center text-xs font-bold text-neutral-500 font-mono">
                      {rowLetter}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <SeatLegend />
          </div>
        </div>

        {/* Right Column: Live Booking Summary */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <BookingSummary
            movieTitle={movieTitle}
            moviePoster={moviePoster}
            hallName={hallName}
            startTime={startTime}
            selectedSeats={selectedSeats}
            basePrice={effectiveBasePrice}
            onProceedToCheckout={handleTriggerCheckout}
            onRemoveSeat={handleRemoveSeat}
            onClearSeats={handleClearSeats}
            isLoggedIn={true}
            disabled={isProcessingStripe}
            isFullyBooked={fullyBooked}
          />
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        showtimeId={showtimeId}
        movieTitle={movieTitle}
        moviePoster={moviePoster}
        hallName={hallName}
        startTime={startTime}
        selectedSeats={selectedSeats}
        totalPrice={totalPrice + 1.50}
      />
    </div>
  )
}

export default SeatSelector
