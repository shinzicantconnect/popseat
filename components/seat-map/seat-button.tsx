'use client'

import React from 'react'
import { Seat } from './seat-selector'

interface SeatButtonProps {
  seat: Seat
  isSelected: boolean
  onClick: () => void
}

export function SeatButton({ seat, isSelected, onClick }: SeatButtonProps) {
  const isBooked = seat.status === 'booked'
  const isHeld = seat.status === 'held'

  let buttonStyles = 'bg-zinc-900 text-neutral-300 hover:bg-zinc-800 hover:text-white border-zinc-800'
  
  if (isSelected) {
    buttonStyles = 'bg-red-700 text-white border-red-500 font-bold scale-105 shadow-md shadow-red-900/50 ring-2 ring-red-500/50'
  } else if (isBooked) {
    buttonStyles = 'bg-black/90 text-neutral-700 border-neutral-900/60 cursor-not-allowed opacity-40'
  } else if (isHeld) {
    buttonStyles = 'bg-rose-950/40 text-rose-400 border-rose-900/60 cursor-not-allowed opacity-70'
  } else if (seat.type === 'vip') {
    buttonStyles = 'bg-red-950/40 text-red-300 hover:bg-red-900/50 border-red-800/40 hover:border-red-600'
  }

  return (
    <button
      type="button"
      disabled={isBooked || isHeld}
      onClick={onClick}
      title={`Seat ${seat.id} (${(seat.type ?? 'standard').toUpperCase()}) - ₱${(seat.price ?? 0).toFixed(2)} [${seat.status}]`}
      className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg border text-[10px] sm:text-[11px] font-medium flex flex-col items-center justify-center transition-all duration-150 ${buttonStyles}`}
    >
      <span className="leading-none">{seat.number}</span>
    </button>
  )
}

export default SeatButton
