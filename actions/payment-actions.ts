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
    const service = await db.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return { success: false, message: 'Service introuvable.' }
    }

    let business = await db.business.findFirst()

    if (!business) {
      business = await db.business.create({
        data: {
          name: 'Mon Entreprise par défaut',
        },
      })
    }

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

    const newBooking = await db.booking.create({
      data: {
        serviceId,
        clientName,
        clientEmail,
        date: new Date(date),
        clientId: client.id,
        businessId: business.id,
        status: 'PENDING',
        isPaid: false,
      },
    })

    const unitAmount = Math.round(Number(service.price) * 100)
    if (isNaN(unitAmount) || unitAmount <= 0) {
      return { success: false, message: 'Le prix du service est invalide.' }
    }

    // Récupération sécurisée de l'URL de base avec repli vers le domaine de production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookiz.onrender.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: service.title || 'Prestation Bookiz',
              description: service.description || undefined,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: clientEmail,
      success_url: `${baseUrl}/book/success?booking_id=${newBooking.id}`,
      cancel_url: `${baseUrl}/book?canceled=true`,
      metadata: {
        bookingId: newBooking.id,
      },
    })

    if (!session.url) {
      return { success: false, message: 'Erreur lors de la création de la session de paiement.' }
    }

    redirect(session.url)

  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('--- ERREUR STRIPE EXPLICITE ---')
    console.error('Message :', error?.raw?.message || error?.message)
    console.error('Type :', error?.raw?.type)
    console.error('Code :', error?.raw?.code)
    console.error('-------------------------------')
    
    return { success: false, message: 'Impossible d\'initier le paiement.' }
  }
}
