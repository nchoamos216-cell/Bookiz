import { db } from '@/lib/db'
import { sendBookingConfirmation } from '@/lib/mail'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking_id?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const bookingId = resolvedSearchParams.booking_id

  if (!bookingId) {
    redirect('/book')
  }

  // Récupérer la réservation et le service associé
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  })

  if (!booking) {
    redirect('/book')
  }

  // Si ce n'est pas encore marqué comme payé, on met à jour et on envoie l'e-mail
  if (!booking.isPaid) {
    await db.booking.update({
      where: { id: bookingId },
      data: { 
        isPaid: true,
        status: 'CONFIRMED' // Passe automatiquement en confirmé après paiement
      },
    })

    // Envoi de l'e-mail de confirmation
    await sendBookingConfirmation(
      booking.clientEmail,
      booking.clientName,
      booking.service.title,
      booking.date
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-100">Paiement réussi !</h1>
          <p className="text-sm text-slate-400">
            Votre réservation pour <span className="text-emerald-400 font-semibold">{booking.service.title}</span> a été confirmée avec succès.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left space-y-2 text-xs text-slate-400">
          <div><strong className="text-slate-300">Client :</strong> {booking.clientName}</div>
          <div><strong className="text-slate-300">Email :</strong> {booking.clientEmail}</div>
          <div><strong className="text-slate-300">Date :</strong> {new Date(booking.date).toLocaleString('fr-FR')}</div>
          <div><strong className="text-slate-300">Montant :</strong> {booking.service.price} €</div>
        </div>

        <p className="text-xs text-slate-500">
          Un e-mail de confirmation vient de vous être envoyé.
        </p>

        <Link 
          href="/book"
          className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          Effectuer une autre réservation
        </Link>

      </div>
    </main>
  )
}