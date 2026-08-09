import { z } from 'zod'

// Schéma pour la création/modification d'un service
export const serviceSchema = z.object({
  title: z.string().min(2, "Le titre doit faire au moins 2 caractères"),
  description: z.string().min(5, "La description doit faire au moins 5 caractères"),
  price: z.number().positive("Le prix doit être supérieur à 0"),
  duration: z.number().int().positive("La durée doit être un nombre entier positif"),
})

// Schéma pour la création d'une réservation
export const bookingSchema = z.object({
  clientName: z.string().min(2, "Le nom est trop court"),
  clientEmail: z.string().email("Email invalide"),
  date: z.string().min(1, "La date est requise"),
  serviceId: z.string().uuid("Service invalide"),
})