import React from 'react'
import Image from 'next/image'

export function PopSeatLogo({ className = 'h-9' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <Image
        src="/logo.png"
        alt="PopSeat"
        width={160}
        height={98}
        className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(220,38,38,0.35)]"
        priority
      />
    </div>
  )
}