import React from 'react'
import { Film } from 'lucide-react'

export function PopSeatLogo({ className = 'h-6' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-black tracking-wider uppercase ${className}`}>
      <Film className="h-5 w-5 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
      <span className="text-white text-base">
        POP<span className="text-red-600">SEAT</span>
      </span>
    </div>
  )
}