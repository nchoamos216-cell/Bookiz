'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { serviceSchema } from '@/lib/schemas'
import { BookingStatus } from '@prisma/client'

// ID de ton salon par défaut (créé via le seed)
const DEFAULT_BUSINESS_ID = '6c9169b7-4b0b-4906-85a9-3ba4e960d640'

// Récupérer tous les services du salon
export async function getServices() {
  try {
    return await db.service.findMany({
      where: { businessId: DEFAULT_BUSINESS_ID },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des services :', error)
    return []
  }
}

// Récupérer la liste des employés du salon
export async function getEmployees() {
  try {
    return await db.employee.findMany({
      where: { businessId: DEFAULT_BUSINESS_ID },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des employés :', error)
    return []
  }
}

// Créer un service rattaché au salon
export async function createService(formData: FormData) {
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    duration: parseInt(formData.get('duration') as string),
  }

  const validatedFields = serviceSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { 
      success: false, 
      message: 'Données invalides', 
      errors: validatedFields.error.flatten().fieldErrors 
    }
  }

  try {
    await db.service.create({
      data: {
        ...validatedFields.data,
        businessId: DEFAULT_BUSINESS_ID,
      },
    })
    revalidatePath('/')
    return { success: true, message: 'Service créé avec succès !' }
  } catch (error) {
    console.error('Erreur lors de la création du service :', error)
    return { success: false, message: 'Erreur serveur.' }
  }
}

// Mettre à jour un service
export async function updateService(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const duration = parseInt(formData.get('duration') as string)

  if (!id || !title || !description || isNaN(price) || isNaN(duration)) {
    return { success: false, message: 'Informations invalides pour la mise à jour.' }
  }

  try {
    await db.service.update({
      where: { id },
      data: { title, description, price, duration },
    })
    revalidatePath('/')
    return { success: true, message: 'Service mis à jour avec succès !' }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du service :', error)
    return { success: false, message: 'Impossible de mettre à jour le service.' }
  }
}

// Supprimer un service
export async function deleteService(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return { success: false, message: 'ID du service manquant.' }
  }

  try {
    await db.service.delete({
      where: { id },
    })
    revalidatePath('/')
    return { success: true, message: 'Service supprimé avec succès.' }
  } catch (error) {
    console.error('Erreur lors de la suppression du service :', error)
    return { success: false, message: 'Impossible de supprimer le service.' }
  }
}

// Récupérer les réservations pour l'administration du salon
export async function getBookings(statusFilter?: string) {
  try {
    const whereClause: any = {
      businessId: DEFAULT_BUSINESS_ID,
    }

    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter as BookingStatus
    }

    return await db.booking.findMany({
      where: whereClause,
      include: { service: true, invoice: true, employee: true },
      orderBy: { date: 'asc' },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations :', error)
    return []
  }
}

// Récupérer la liste des clients pour le CRM
export async function getClients() {
  try {
    return await db.client.findMany({
      include: {
        bookings: {
          where: { businessId: DEFAULT_BUSINESS_ID },
          include: { service: true, invoice: true, employee: true },
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

// Mettre à jour le statut d'une réservation
export async function updateBookingStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!id || !status) {
    return { success: false, message: 'Informations manquantes.' }
  }

  try {
    await db.booking.update({
      where: { id },
      data: { status: status as BookingStatus },
    })
    revalidatePath('/')
    return { success: true, message: 'Statut mis à jour avec succès !' }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut :', error)
    return { success: false, message: 'Impossible de modifier le statut.' }
  }
}

// Supprimer/Annuler une réservation
export async function deleteBooking(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return { success: false, message: 'ID de la réservation manquant.' }
  }

  try {
    await db.booking.delete({
      where: { id },
    })
    revalidatePath('/')
    return { success: true, message: 'Réservation annulée avec succès.' }
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation :', error)
    return { success: false, message: "Impossible d'annuler la réservation." }
  }
}

// Générer une facture pour une réservation
export async function generateInvoice(bookingId: string, amount: number) {
  try {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        amount,
        bookingId,
      },
    })

    revalidatePath('/')
    return { success: true, invoice }
  } catch (error) {
    console.error('Erreur lors de la génération de la facture :', error)
    return { success: false, error: 'Erreur lors de la génération' }
  }
}