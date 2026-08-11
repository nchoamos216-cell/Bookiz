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

    // 2. Récupérer ou créer l'entreprise (business) par défaut
    let business = await db.business.findFirst()

    if (!business) {
      business = await db.business.create({
        data: {
          name: 'Mon Entreprise par défaut',
        },
      })
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
        businessId: business.id,
        status: 'PENDING',
        isPaid: false,
      },
    })

    // 5. Sécuriser le montant pour Stripe (convertit en centimes et vérifie la validité)
    const unitAmount = Math.round(Number(service.price) * 100)
    if (isNaN(unitAmount) || unitAmount <= 0) {
      return { success: false, message: 'Le prix du service est invalide.' }
    }

    // 6. Créer la session de paiement Stripe Checkout
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/success?booking_id=${newBooking.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book?canceled=true`,
      metadata: {
        bookingId: newBooking.id,
      },
    })

    if (!session.url) {
      return { success: false, message: 'Erreur lors de la création de la session de paiement.' }
    }

    // 7. Redirection vers la page de paiement sécurisée Stripe
    redirect(session.url)

    } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') {
      throw error
    }
    // Affiche l'erreur détaillée de Stripe dans les logs Render
    console.error('Erreur Stripe détaillée :', error?.raw || error.message || error)
    return { success: false, message: 'Impossible d\'initier le paiement.' }
  }

}
