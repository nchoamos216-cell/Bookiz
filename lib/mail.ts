import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(email: string, clientName: string, serviceTitle: string, date: Date) {
  try {
    await resend.emails.send({
      from: 'Bookiz <onboarding@resend.dev>',
      to: email,
      subject: 'Confirmation de votre réservation - Bookiz',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #4F46E5;">Réservation confirmée !</h2>
          <p>Bonjour <strong>${clientName}</strong>,</p>
          <p>Nous vous confirmons votre réservation pour le service suivant :</p>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Prestation :</strong> ${serviceTitle}</p>
            <p style="margin: 5px 0;"><strong>Date et heure :</strong> ${new Date(date).toLocaleString('fr-FR')}</p>
          </div>
          <p>Merci d'avoir choisi Bookiz !</p>
        </div>
      `,
    })
    console.log('E-mail de confirmation envoyé avec succès !')
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error)
  }
}