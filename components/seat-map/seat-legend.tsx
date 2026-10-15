'use client'

import React from 'react'

export function SeatLegend() {
  const legendItems = [
    { label: 'Normal (₱300)', style: 'bg-zinc-900 border-zinc-750 text-neutral-300' },
    { label: 'VIP Seat (₱350)', style: 'bg-red-950/40 border-red-800/50 text-red-300' },
    { label: 'Selected', style: 'bg-red-700 border-red-500 text-white font-bold' },
    { label: 'Held / Reserved', style: 'bg-rose-950/40 border-rose-800/60 text-rose-400' },
    { label: 'Sold / Unavailable', style: 'bg-black/90 border-neutral-900/60 text-neutral-700 opacity-50' }
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-400">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[9px] ${item.style}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default SeatLegend
