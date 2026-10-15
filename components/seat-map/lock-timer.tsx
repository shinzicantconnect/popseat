'use client'

import React, { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'

interface LockTimerProps {
  initialSeconds?: number
  onExpire?: () => void
}

export function LockTimer({ initialSeconds = 300, onExpire }: LockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire()
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isWarning = timeLeft < 60

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium transition-colors ${
        isWarning
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
          : 'bg-red-950/40 border-red-800/40 text-red-400'
      }`}
    >
      <Timer className="w-3.5 h-3.5" />
      <span>Locked for: {formattedTime}</span>
    </div>
  )
}

export default LockTimer
