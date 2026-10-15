import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  X,
  CreditCard,
  Wallet,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Film,
  Lock,
  ArrowRight,
  LogIn,
  UserPlus,
  User
} from 'lucide-react'
import { Seat } from '../seat-map/seat-selector'
import { createBooking } from '@/lib/actions/create-booking'
import { createCheckoutSession } from '@/lib/actions/stripe'
import { getPopSeatUser, PopSeatUser } from '@/lib/auth'
import { Skeleton } from '@/components/ui/skeleton'

export interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  showtimeId: string
  movieTitle?: string
  moviePoster?: string | null
  hallName?: string
  startTime?: string
  selectedSeats: Seat[]
  totalPrice?: number
  onBookingComplete?: (bookingRef: string) => void
}

type PaymentMethod = 'card' | 'wallet' | 'demo'

export function CheckoutModal({
  isOpen,
  onClose,
  showtimeId,
  movieTitle = 'Featured Movie',
  moviePoster,
  hallName = 'Main Cinema Hall',
  startTime,
  selectedSeats = [],
  totalPrice,
  onBookingComplete
}: CheckoutModalProps) {
  const router = useRouter()

  // Form states
  const [currentUser, setCurrentUser] = useState<PopSeatUser | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('demo')

  // Mock card inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('888')

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null)

  // Calculate total price if not passed
  const calculatedTotal =
    totalPrice ??
    selectedSeats.reduce((sum, s) => sum + s.price, 0) + (selectedSeats.length > 0 ? 1.5 : 0)

  // Require and auto-populate logged-in user credentials
  useEffect(() => {
    if (isOpen) {
      setIsCheckingAuth(true)
      getPopSeatUser().then((user) => {
        setCurrentUser(user)
        setIsCheckingAuth(false)
        if (user) {
          setEmail(user.email || 'edsimonmendoza@gmail.com')
          setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ed Simon Mendoza')
        } else {
          setEmail('edsimonmendoza@gmail.com')
          setFullName('Ed Simon Mendoza')
        }
      })
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // If no active session, ensure email defaults to edsimonmendoza@gmail.com
    const activeUser = await getPopSeatUser()
    if (!activeUser && !email.trim()) {
      setEmail('edsimonmendoza@gmail.com')
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address for e-ticket delivery.')
      return
    }

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat before checking out.')
      return
    }

    setIsSubmitting(true)

    try {
      const seatIds = selectedSeats.map((s) => s.id)
      const customerEmail = email.trim() || 'edsimonmendoza@gmail.com'

      const sessionRes = await createCheckoutSession({
        showtimeId,
        movieTitle,
        seats: seatIds,
        totalPrice: calculatedTotal,
        customerEmail
      })

      if (sessionRes?.url) {
        window.location.href = sessionRes.url
        return
      }

      const res = await createBooking({
        showtimeId,
        seats: seatIds,
        totalPrice: calculatedTotal,
        customerEmail
      })

      if (res && res.bookingRef) {
        setConfirmedRef(res.bookingRef)
        setIsSuccess(true)

        if (onBookingComplete) {
          onBookingComplete(res.bookingRef)
        }

        // Redirect after brief celebration
        setTimeout(() => {
          const params = new URLSearchParams({
            movie: movieTitle,
            hall: hallName,
            time: startTime || '',
            seats: seatIds.join(','),
            total: calculatedTotal.toFixed(2),
            email: email.trim(),
            name: fullName.trim(),
            ...(moviePoster ? { poster: moviePoster } : {})
          })

          router.push(`/ticket/${res.bookingRef}?${params.toString()}`)
        }, 1200)
      } else {
        setErrorMessage('Booking reservation could not be confirmed. Please try again.')
      }
    } catch {
      setErrorMessage('A network error occurred while securing your seats. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
    >
      <div
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cinema Checkout</h3>
              <p className="text-xs text-neutral-400">Finalize your live seat reservation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-zinc-900 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State While Checking Account */}
        {isCheckingAuth ? (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-16 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-3 gap-2.5">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ) : !currentUser ? (
          /* Account Required Gate */
          <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400 shadow-xl shadow-red-950/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-xl font-black text-white tracking-tight">
                Account Required to Book
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                You must have an active PopSeat account before reserving cinema seats. Your tickets and QR passes will be securely issued to your account.
              </p>
            </div>

            {/* Quick Order Overview */}
            <div className="p-4 rounded-2xl bg-black/80 border border-zinc-800 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Screening:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{movieTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Selected Seats:</span>
                <span className="font-bold text-red-400">
                  {selectedSeats.map((s) => s.id).join(', ')} ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800">
                <span className="text-neutral-400 font-medium">Total Amount:</span>
                <span className="font-black text-red-400 text-sm">₱{calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Direct Login and Register Actions */}
            <div className="space-y-2.5 pt-1">
              <Link
                href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/showtime/${showtimeId}`)}`}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Continue Booking</span>
              </Link>

              <Link
                href={`/login?mode=signup&redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/showtime/${showtimeId}`)}`}
                className="w-full py-3 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-red-400" />
                <span>Create New Account</span>
              </Link>
            </div>

            <p className="text-[11px] text-neutral-500">
              Only takes a few seconds • Accepts any @gmail.com
            </p>
          </div>
        ) : isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Your seats are secured and your electronic pass is ready.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/80 border border-zinc-800 font-mono text-xs text-neutral-300">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                Booking Reference
              </span>
              <span className="text-base font-bold text-red-400 tracking-wider">
                {confirmedRef}
              </span>
            </div>
            <p className="text-xs text-neutral-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
              Redirecting to your digital admission ticket...
            </p>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleCheckout} className="p-6 sm:p-7 space-y-6">
            {/* Quick Order Mini-Banner */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/80 border border-zinc-800 text-xs">
              <div className="w-12 h-16 rounded-lg bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-800">
                {moviePoster ? (
                  <img
                    src={moviePoster}
                    alt={movieTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Film className="w-5 h-5 text-neutral-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate text-sm">{movieTitle}</p>
                <p className="text-neutral-400 text-[11px] truncate mt-0.5">
                  {hallName} • {startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '7:30 PM'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-neutral-400">Seats:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.id}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-800/40"
                      >
                        {s.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right pl-2 border-l border-zinc-800 shrink-0">
                <span className="text-[10px] text-neutral-400 block uppercase font-medium">Due</span>
                <span className="text-base font-black text-red-400">
                  ₱{calculatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Customer Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                  1. Contact Information
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified PopSeat Member</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 font-medium">
                    Ticket Recipient Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-zinc-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
                    <span>Account Email</span>
                    <span className="text-[10px] text-neutral-500">Locked to account</span>
                  </label>
                  <input
                    type="email"
                    required
                    readOnly
                    value={email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-red-400 font-semibold focus:outline-none cursor-not-allowed opacity-90 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 font-medium">
                  Phone Number (Optional SMS pass)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-zinc-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-red-600 transition"
                />
              </div>
            </div>

            {/* Section 2: Payment Method */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                2. Select Payment Method
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('demo')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'demo'
                      ? 'bg-red-950/30 border-red-600 text-red-400 shadow-md shadow-red-950/40'
                      : 'bg-black/60 border-zinc-800 text-neutral-400 hover:border-zinc-700 hover:text-neutral-200'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold text-center">Instant Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-red-950/30 border-red-600 text-red-400 shadow-md shadow-red-950/40'
                      : 'bg-black/60 border-zinc-800 text-neutral-400 hover:border-zinc-700 hover:text-neutral-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-bold text-center">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'bg-red-950/30 border-red-600 text-red-400 shadow-md shadow-red-950/40'
                      : 'bg-black/60 border-zinc-800 text-neutral-400 hover:border-zinc-700 hover:text-neutral-200'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-bold text-center">E-Wallet / GCash</span>
                </button>
              </div>

              {/* Payment Details Sub-form */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-black/70 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="p-4 rounded-2xl bg-black/70 border border-zinc-800 space-y-2 animate-in fade-in duration-200 text-center">
                  <Wallet className="w-8 h-8 text-red-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-white">Digital Wallet Checkout</p>
                  <p className="text-[11px] text-neutral-400">
                    You will be prompted to authenticate your e-wallet authorization upon clicking confirm.
                  </p>
                </div>
              )}

              {paymentMethod === 'demo' && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center gap-2.5 animate-in fade-in duration-200">
                  <Zap className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="font-bold">Instant Sandbox Simulation</span>
                    <p className="text-[10px] text-red-400/80">
                      No real charges made. Automatically authorizes and produces live QR cinema passes.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-black text-sm tracking-wide shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Securing Seats & Issuing Ticket...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Confirm & Pay ₱{calculatedTotal.toFixed(2)}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted Cinema Checkout</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CheckoutModal
