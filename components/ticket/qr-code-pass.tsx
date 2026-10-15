'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Armchair,
  Eye,
  X,
  Sparkles
} from 'lucide-react'

export interface QRCodePassProps {
  bookingId: string
  movieTitle?: string
  moviePoster?: string | null
  hallName?: string
  startTime?: string
  seats?: string[]
  totalPrice?: number
  customerEmail?: string
  customerName?: string
}

export function QRCodePass({
  bookingId,
  movieTitle = 'Featured Movie',
  moviePoster,
  hallName = 'Main Cinema Hall',
  startTime,
  seats = [],
  totalPrice,
  customerEmail,
  customerName
}: QRCodePassProps) {
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [imgError, setImgError] = useState(false)

  const formattedDate = startTime
    ? new Date(startTime).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Confirmed Date'

  const formattedTime = startTime
    ? new Date(startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Scheduled Showtime'

  const qrPayload = JSON.stringify({
    ref: bookingId,
    movie: movieTitle,
    hall: hallName,
    seats,
    status: 'CONFIRMED'
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-left">
      {/* ========================================================================= */}
      {/* Main Electronic Cinema Ticket Card */}
      {/* ========================================================================= */}
      <div
        id="cinema-ticket-card"
        className="relative bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl text-left print:border-2 print:border-black print:bg-white print:text-black print:shadow-none print:rounded-2xl"
      >
        {/* Top Header */}
        <div className="relative bg-gradient-to-br from-red-950/60 via-zinc-950 to-black p-6 border-b border-zinc-800 print:bg-none print:border-b-2 print:border-black print:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-xs">
              <Film className="w-4 h-4 text-red-500 print:text-black" />
              <span className="text-white print:text-black">
                POP<span className="text-red-500 print:text-black">SEAT</span>
              </span>
              <span className="text-neutral-500 text-[10px] ml-1 print:text-neutral-600">E-PASS</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:border-black print:text-black print:bg-neutral-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 print:text-black" />
              ADMIT ONE
            </span>
          </div>

          {/* Movie Details (Left Aligned beside poster) */}
          <div className="mt-5 flex gap-4 items-start text-left">
            <div className="relative w-20 h-28 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-lg print:border-black print:bg-neutral-100">
              {moviePoster && !imgError ? (
                <img
                  src={moviePoster}
                  alt={movieTitle}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Film className="w-7 h-7 text-neutral-600 print:text-neutral-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 print:text-black block mb-0.5">
                Feature Film
              </span>
              <h2 className="text-xl font-black text-white print:text-black leading-tight tracking-tight break-words">
                {movieTitle}
              </h2>

              <p className="text-xs text-red-400 print:text-black font-semibold mt-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500 print:text-black" />
                <span className="truncate">{hallName}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-neutral-400 print:text-neutral-700">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 print:text-black shrink-0" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500 print:text-black shrink-0" />
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Cutout Separators */}
        <div className="relative h-6 bg-zinc-950 flex items-center justify-between print:bg-white">
          <div className="w-5 h-5 rounded-full bg-black -ml-2.5 border-r border-zinc-800 print:border-black print:bg-white" />
          <div className="flex-1 border-b-2 border-dashed border-zinc-800 mx-2 print:border-black" />
          <div className="w-5 h-5 rounded-full bg-black -mr-2.5 border-l border-zinc-800 print:border-black print:bg-white" />
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-5 text-left print:p-5">
          {/* Seats and Booking Ref Grid */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-black/80 border border-zinc-800 text-left print:border-black print:bg-neutral-50">
              <span className="text-[10px] text-neutral-400 print:text-neutral-700 uppercase tracking-wider font-bold flex items-center gap-1 mb-1.5">
                <Armchair className="w-3.5 h-3.5 text-red-500 print:text-black" />
                Seats ({seats.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {seats.length > 0 ? (
                  seats.map((seat) => (
                    <span
                      key={seat}
                      className="px-2 py-0.5 rounded-lg text-xs font-mono font-black bg-red-700 text-white print:bg-black print:text-white"
                    >
                      {seat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-neutral-300 print:text-black">General</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/80 border border-zinc-800 text-left print:border-black print:bg-neutral-50">
              <span className="text-[10px] text-neutral-400 print:text-neutral-700 uppercase tracking-wider font-bold block mb-1.5">
                Booking Reference
              </span>
              <span className="text-xs font-mono font-black text-red-400 print:text-black tracking-wider block break-all">
                {bookingId}
              </span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-600 block mt-0.5 uppercase">
                Turnstile Code
              </span>
            </div>
          </div>

          {/* QR Code Admission Section */}
          <div className="p-5 rounded-2xl bg-white flex flex-col items-center justify-center text-center shadow-inner border border-zinc-200 print:border-black">
            <div className="p-2 bg-white rounded-xl">
              <QRCodeSVG
                value={qrPayload}
                size={160}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-[10px] font-mono font-bold uppercase text-neutral-700 mt-2 tracking-wider">
              Scan at Cinema Gate for Entry
            </p>
          </div>

          {/* Customer & Price Footer info */}
          <div className="space-y-2 text-xs border-t border-zinc-800 pt-4 text-neutral-400 print:border-black print:text-neutral-800">
            {customerName && (
              <div className="flex justify-between items-center text-left">
                <span className="text-neutral-400 print:text-neutral-700">Guest Name</span>
                <span className="text-neutral-200 print:text-black font-semibold text-right">
                  {customerName}
                </span>
              </div>
            )}
            {customerEmail && (
              <div className="flex justify-between items-center text-left">
                <span className="text-neutral-400 print:text-neutral-700">Email Pass</span>
                <span className="text-neutral-200 print:text-black font-mono text-[11px] truncate max-w-[200px] text-right">
                  {customerEmail}
                </span>
              </div>
            )}
            {totalPrice !== undefined && (
              <div className="flex justify-between items-center font-semibold pt-2 border-t border-zinc-800 text-left">
                <span className="text-neutral-300 print:text-black">Total Paid</span>
                <span className="text-red-400 print:text-black font-black text-sm">
                  ₱{totalPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="px-6 py-3 bg-black/80 border-t border-zinc-800 flex items-center justify-between text-[10px] text-neutral-500 print:bg-white print:border-black print:text-neutral-600 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500 print:text-black" />
            Verified PopSeat Pass
          </span>
          <span>{new Date().getFullYear()} © PopSeat Cinemas</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Action Buttons: Preview & Print */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-3 print:hidden">
        <button
          type="button"
          onClick={() => setShowPrintPreview(true)}
          className="py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-neutral-200 text-xs font-bold border border-zinc-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Eye className="w-4 h-4 text-red-500" />
          Preview Print Pass
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/50 active:scale-95"
        >
          <Printer className="w-4 h-4 text-white" />
          Print / Save Pass
        </button>
      </div>

      {/* ========================================================================= */}
      {/* Print Preview Modal */}
      {/* ========================================================================= */}
      {showPrintPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto print:hidden"
        >
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-6 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-white">Paper Print Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              This preview shows how your admission pass will format when sent to a physical printer or exported as a PDF file.
            </p>

            {/* Paper Ticket Canvas Simulation */}
            <div className="p-6 bg-white rounded-2xl border-2 border-neutral-300 text-black shadow-lg space-y-4 max-w-sm mx-auto font-sans">
              {/* Paper Ticket Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="font-black text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-black" />
                  <span>POPSEAT CINEMAS</span>
                </div>
                <span className="text-[10px] font-bold uppercase border border-black px-2 py-0.5 rounded">
                  OFFICIAL PASS
                </span>
              </div>

              {/* Movie Title */}
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-600 block">Film Presentation</span>
                <h4 className="text-base font-black leading-tight">{movieTitle}</h4>
                <p className="text-xs font-bold mt-0.5">{hallName}</p>
              </div>

              {/* Details table */}
              <div className="grid grid-cols-2 gap-2 text-xs border-y border-neutral-200 py-2">
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Date</span>
                  <span className="font-semibold">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Time</span>
                  <span className="font-semibold">{formattedTime}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Seats</span>
                  <span className="font-black text-sm">{seats.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Total Paid</span>
                  <span className="font-black text-sm">{totalPrice ? `₱${totalPrice.toFixed(2)}` : 'PAID'}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-300 flex flex-col items-center justify-center">
                <QRCodeSVG
                  value={qrPayload}
                  size={130}
                  level="M"
                  bgColor="#f8fafc"
                  fgColor="#000000"
                />
                <span className="text-[9px] font-mono font-bold uppercase text-neutral-600 mt-1">
                  Admit at Turnstile Scanner
                </span>
              </div>

              {/* Terms & Footer */}
              <div className="text-[9px] text-neutral-500 text-center border-t border-neutral-200 pt-2 space-y-0.5">
                <p>Non-refundable • Valid only for session indicated</p>
                <p className="font-mono">{bookingId} • Powered by PopSeat</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-neutral-300 text-xs font-semibold border border-zinc-800 transition cursor-pointer"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPrintPreview(false)
                  setTimeout(() => window.print(), 300)
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40"
              >
                <Printer className="w-4 h-4" />
                Print Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRCodePass
