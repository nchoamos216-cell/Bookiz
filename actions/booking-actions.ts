'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { bookingSchema } from '@/lib/schemas'
import { sendBookingConfirmation } from '@/lib/mail'

// Récupérer les services pour la page publique
export async function getPublicServices() {
  try {
    return await db.service.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des services :', error)
    return []
  }
}

// Récupérer la liste des clients pour le CRM
export async function getClients() {
  try {
    return await db.client.findMany({
      include: {
        bookings: {
          include: { service: true },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des clients :', error)
    return []
  }
}

// Créer une réservation (avec gestion automatique du client CRM)
export async function createBooking(formData: FormData) {
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
    // 1. Trouver ou créer le client (CRM)
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
    } else if (client.name !== clientName) {
      // Mettre à jour le nom si le client a changé de nom
      client = await db.client.update({
        where: { id: client.id },
        data: { name: clientName },
      })
    }

    // 2. Créer la réservation liée au client et récupérer le service associé
    const newBooking = await db.booking.create({
      data: {
        serviceId,
        clientName,
        clientEmail,
        date: new Date(date),
        clientId: client.id,
      },
      include: {
        service: true, // Nécessaire pour obtenir le titre du service pour l'e-mail
      },
    })

    // 3. Envoyer l'e-mail de confirmation automatique
    await sendBookingConfirmation(
      clientEmail,
      clientName,
      newBooking.service.title,
      newBooking.date
    )

    revalidatePath('/book')
    revalidatePath('/')
    return { success: true, message: 'Votre réservation a été confirmée avec succès !' }
  } catch (error) {
    console.error('Erreur lors de la réservation :', error)
    return { success: false, message: 'Impossible d\'enregistrer la réservation.' }
  }
}