'use client'

import React, { useState } from 'react'
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Sparkles,
  ShieldCheck,
  Tag,
  Check,
  X,
  CreditCard,
  ChevronRight,
  Armchair,
  Trash2,
  Percent,
  Lock,
  Loader2
} from 'lucide-react'
import { Seat } from '../seat-map/seat-selector'

export interface BookingSummaryProps {
  movieTitle?: string
  moviePoster?: string | null
  hallName?: string
  startTime?: string
  selectedSeats: Seat[]
  basePrice?: number
  bookingFee?: number
  onProceedToCheckout?: () => void
  onClearSeats?: () => void
  onRemoveSeat?: (seatId: string) => void
  className?: string
  compact?: boolean
  showCheckoutButton?: boolean
  disabled?: boolean
  isLoggedIn?: boolean
  isFullyBooked?: boolean
}

const PROMO_CODES: Record<string, { code: string; discountPct: number; label: string }> = {
  POPFAN: { code: 'POPFAN', discountPct: 15, label: '15% Movie Buff Discount' },
  POPCORN: { code: 'POPCORN', discountPct: 10, label: '10% Snack Saver Discount' },
  VIP20: { code: 'VIP20', discountPct: 20, label: '20% Special Premiere Pass' },
}

export function BookingSummary({
  movieTitle = 'Featured Movie',
  moviePoster,
  hallName = 'Main Cinema Hall',
  startTime,
  selectedSeats = [],
  bookingFee = 1.50,
  onProceedToCheckout,
  onClearSeats,
  onRemoveSeat,
  className = '',
  compact = false,
  showCheckoutButton = true,
  disabled = false,
  isLoggedIn = false,
  isFullyBooked = false
}: BookingSummaryProps) {
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    discountPct: number
    label: string
  } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError(null)
    const normalized = promoInput.trim().toUpperCase()

    if (!normalized) return

    if (PROMO_CODES[normalized]) {
      setAppliedPromo(PROMO_CODES[normalized])
      setPromoInput('')
    } else {
      setPromoError('Invalid promo code. Try "POPFAN" for 15% off!')
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoError(null)
  }

  // Calculations
  const seatsSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0)
  const feeAmount = selectedSeats.length > 0 ? bookingFee : 0
  const discountAmount = appliedPromo
    ? (seatsSubtotal * appliedPromo.discountPct) / 100
    : 0
  const finalTotal = Math.max(0, seatsSubtotal + feeAmount - discountAmount)

  // Formatted date and time
  const formattedDate = startTime
    ? new Date(startTime).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    : 'Today'

  const formattedTime = startTime
    ? new Date(startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '7:30 PM'

  // Empty State
  if (selectedSeats.length === 0) {
    return (
      <div
        className={`bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4 ${className}`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isFullyBooked
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              : 'bg-red-950/40 border border-red-800/40 text-red-400'
          }`}
        >
          <Ticket className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Booking Summary</h3>
          {isFullyBooked ? (
            <div className="mt-2 space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Fully Booked
              </span>
              <p className="text-xs text-rose-300/80 mt-1 max-w-xs">
                This screening is completely sold out. All seats are currently occupied or reserved.
              </p>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              No seats selected yet. Click any available seat on the cinema layout to begin your reservation.
            </p>
          )}
        </div>
        <div className="w-full pt-4 border-t border-zinc-800 flex items-center justify-center gap-4 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-700" /> Normal (₱300)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-700" /> VIP (₱350)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Instant Lock
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-zinc-950/80 border border-zinc-800 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden transition-all ${
        compact ? 'p-4 sm:p-5' : 'p-6 sm:p-7'
      } ${className}`}
    >
      <div className="space-y-6">
        {/* Header: Movie & Screening Context */}
        <div className="flex items-start gap-4 pb-5 border-b border-zinc-800">
          <div className="relative w-16 h-22 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
            {moviePoster ? (
              <img
                src={moviePoster}
                alt={movieTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <Film className="w-6 h-6 text-neutral-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-800/40">
                PopSeat Pass
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white truncate mt-1">
              {movieTitle}
            </h3>

            <div className="mt-2 space-y-1 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{hallName}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Seats Badges */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5 text-red-500" />
              Selected Seats ({selectedSeats.length})
            </span>
            {onClearSeats && (
              <button
                type="button"
                onClick={onClearSeats}
                className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {selectedSeats.map((seat) => (
              <div
                key={seat.id}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs shadow-sm"
              >
                <span className="font-mono font-bold text-red-400">
                  {seat.id}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase">
                  {seat.type === 'vip' ? '★ VIP' : seat.type}
                </span>
                <span className="text-[11px] font-semibold text-neutral-300 ml-1">
                  ₱{seat.price.toFixed(2)}
                </span>
                {onRemoveSeat && (
                  <button
                    type="button"
                    onClick={() => onRemoveSeat(seat.id)}
                    className="ml-1 text-neutral-500 hover:text-red-400 p-0.5 rounded transition cursor-pointer"
                    title={`Remove seat ${seat.id}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Promo Code Input */}
        {!compact && (
          <div className="pt-2">
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-300">
                      {appliedPromo.code} Applied
                    </span>
                    <p className="text-[10px] text-emerald-400/80">
                      {appliedPromo.label}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-xs text-neutral-400 hover:text-red-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. POPFAN)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/70 border border-zinc-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-red-600 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!promoInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-neutral-200 text-xs font-semibold border border-zinc-800 transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-rose-400 pl-1">{promoError}</p>
                )}
              </form>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>
              Seats Subtotal ({selectedSeats.length}{' '}
              {selectedSeats.length === 1 ? 'ticket' : 'tickets'})
            </span>
            <span className="font-semibold text-neutral-200">
              ₱{seatsSubtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span className="flex items-center gap-1">
              Booking & Convenience Fee
            </span>
            <span className="font-semibold text-neutral-200">
              ₱{feeAmount.toFixed(2)}
            </span>
          </div>

          {appliedPromo && (
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3" />
                Promo Discount ({appliedPromo.discountPct}%)
              </span>
              <span className="font-semibold">
                -₱{discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-zinc-800 flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                Total Price
              </span>
              <p className="text-[10px] text-neutral-500">Includes all cinema taxes</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-red-500 tracking-tight">
                ₱{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Action Button */}
      {showCheckoutButton && (
        <div className="pt-6 space-y-3">
          {selectedSeats.length > 0 && !isLoggedIn && (
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>Account required: Sign in or register to book</span>
            </div>
          )}

          <button
            type="button"
            disabled={disabled || selectedSeats.length === 0}
            onClick={onProceedToCheckout}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-black text-sm tracking-wide shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            {disabled && selectedSeats.length > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Redirecting to Stripe Checkout...</span>
              </>
            ) : isLoggedIn ? (
              <>
                <Ticket className="w-4 h-4" />
                <span>Proceed to Checkout</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Book {selectedSeats.length > 0 ? `(${selectedSeats.length} Seats)` : ''}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Guaranteed Instant Seat Hold & E-Ticket</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingSummary
