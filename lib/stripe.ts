import 'server-only'
import Stripe from 'stripe'

// Stripe instance is server-only. Never import this file into client components.
// The secret key must never be exposed to the browser bundle.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-09-30.endive',
  typescript: true,
})
