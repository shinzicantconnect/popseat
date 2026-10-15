import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { PopSeatLogo } from '@/components/pop-seat-logo'

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      {/* Top Navbar Skeleton */}
      <header className="border-b border-zinc-800 bg-black/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <PopSeatLogo />
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <section className="relative min-h-[70vh] flex items-center justify-center border-b border-zinc-900 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 w-full">
          <div className="flex justify-center">
            <Skeleton className="h-7 w-64 rounded-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 sm:h-16 w-3/4 mx-auto rounded-2xl" />
            <Skeleton className="h-10 sm:h-12 w-2/3 mx-auto rounded-2xl" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Skeleton className="h-12 w-44 rounded-2xl" />
            <Skeleton className="h-12 w-40 rounded-2xl" />
            <Skeleton className="h-12 w-40 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Movies Catalog Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 w-full">
        <div className="space-y-2 border-b border-zinc-800 pb-6">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-zinc-950/60 border border-zinc-800 rounded-3xl overflow-hidden space-y-4 p-5"
            >
              <Skeleton className="w-full aspect-[2/3] max-h-80 rounded-2xl" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="pt-2 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
