import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Soit tu mets une version stable, soit tu supprimes la ligne apiVersion
  apiVersion: '2025-02-27.acacia', 
  typescript: true,
})
