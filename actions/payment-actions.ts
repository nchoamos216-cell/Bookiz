'use server'

import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { bookingSchema } from '@/lib/schemas'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(formData: FormData) {
  const rawData = {
    serviceId: formData.get('serviceId') as string,
    clientName: formData.get('clientName') as string,
    clientEmail: formData.get('clientEmail') as string,
    date: formData.get('date') as string,
  }

  // Validation rigoureuse avec Zod
  const validatedFields = bookingSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { 
      success: false, 
      message: 'Informations de réservation invalides.', 
      errors: validatedFields.error.flatten().fieldErrors 
    }
  }

  const { serviceId, clientName, clientEmail, date } = validatedFields.data

  try {
    // 1. Récupérer le service pour obtenir son prix et son titre
    const service = await db.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return { success: false, message: 'Service introuvable.' }
    }

    // 2. Récupérer l'entreprise (business) pour lier la réservation
    const business = await db.business.findFirst()

    if (!business) {
      return { success: false, message: 'Aucune entreprise configurée dans la base.' }
    }

    // 3. Trouver ou créer le client (CRM)
    let client = await db.client.findUnique({
      where: { email: clientEmail },
    })

    if (!client) {
      client = await db.client.create({
        data: {
          name: clientName,
          email: clientEmail,
        },
      })
    }

    // 4. Créer la réservation en statut PENDING et isPaid à false avec le businessId
    const newBooking = await db.booking.create({
      data: {
        serviceId,
        clientName,
        clientEmail,
        date: new Date(date),
        clientId: client.id,
        businessId: business.id, // <--- Ajouté ici pour corriger l'erreur Prisma
        status: 'PENDING',
        isPaid: false,
      },
    })

    // 5. Créer la session de paiement Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: service.title,
              description: service.description || undefined,
            },
            unit_amount: Math.round(service.price * 100), // Stripe attend les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: clientEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/success?booking_id=${newBooking.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book?canceled=true`,
      metadata: {
        bookingId: newBooking.id,
      },
    })

    if (!session.url) {
      return { success: false, message: 'Erreur lors de la création de la session de paiement.' }
    }

    // 6. Redirection vers la page de paiement sécurisée Stripe
    redirect(session.url)

  } catch (error: any) {
    // Next.js redirect lance une erreur spéciale qu'il faut laisser passer
    if (error?.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Erreur Stripe Checkout :', error)
    return { success: false, message: 'Impossible d\'initier le paiement.' }
  }
}
