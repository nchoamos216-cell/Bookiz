import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServices, getBookings } from '@/actions/service-actions'

export default async function AdminPage() {
  // 1. VÉRIFICATION DE SÉCURITÉ
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  // Si pas de cookie, on envoie la personne sur la page d'accueil publique
  if (!session || session.value !== 'authenticated') {
    redirect('/') 
  }

  // 2. Si le cookie est présent, on affiche le tableau de bord
  const services = await getServices()
  const bookings = await getBookings('ALL')

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Admin</h1>
      {/* ... ton code de tableau de bord ici ... */}
    </main>
  )
}
