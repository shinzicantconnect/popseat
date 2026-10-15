import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { PopSeatLogo } from '@/components/pop-seat-logo'

export default function ShowtimeLoading() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <PopSeatLogo />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </header>

      {/* Movie Banner Skeleton */}
      <div className="border-b border-zinc-800 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl shrink-0" />
          <div className="space-y-3 flex-1 w-full text-center sm:text-left">
            <Skeleton className="h-4 w-24 rounded-full mx-auto sm:mx-0" />
            <Skeleton className="h-8 sm:h-10 w-3/4 mx-auto sm:mx-0 rounded-xl" />
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Seat Map Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Seat Map Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>

            {/* Cinema Screen Curved Bar Skeleton */}
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="w-10/12 h-3 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>

            {/* 10 Rows Seat Grid Skeleton */}
            <div className="space-y-2.5 py-4 flex flex-col items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                <div key={row} className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <Skeleton key={s} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
                    ))}
                  </div>
                  <div className="w-4" />
                  <div className="flex gap-1.5">
                    {[7, 8, 9, 10, 11, 12].map((s) => (
                      <Skeleton key={s} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
                    ))}
                  </div>
                  <Skeleton className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>

            {/* Legend Skeleton */}
            <div className="pt-6 border-t border-zinc-800 flex justify-center gap-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Right Column Summary Skeleton */}
          <div className="lg:col-span-5 xl:col-span-4 bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="w-16 h-24 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  )
}