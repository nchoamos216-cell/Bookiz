import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  getServices, 
  createService, 
  deleteService, 
  updateService, 
  getBookings, 
  deleteBooking, 
  updateBookingStatus,
  getClients,
  generateInvoice 
} from '@/actions/service-actions'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  // PROTECTION : Vérification de la session côté serveur
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated') {
    redirect('/admin/login')
  }

  const resolvedSearchParams = await searchParams
  const currentStatus = resolvedSearchParams.status || 'ALL'
  
  const services = await getServices()
  const bookings = await getBookings(currentStatus)
  const clients = await getClients()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 md:p-24">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Barre de navigation rapide vers le site public */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl shadow-lg">
          <span className="text-sm font-medium text-slate-400">Espace Administrateur</span>
          <a 
            href="/book" 
            target="_blank"
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-600/20 font-medium"
          >
            Voir la page de réservation publique →
          </a>
        </div>
        
        {/* En-tête */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Bookiz - Administration des Services
          </h1>
          <p className="text-slate-400">
            Phase 3 : SaaS Tout-en-Un - Gestion du catalogue, CRM, Paiements Stripe et Facturation.
          </p>
        </div>

        {/* Formulaire d'ajout de service */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-slate-200">Ajouter un nouveau service</h2>
          
          <form action={createService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Titre</label>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="Ex: Consultation web"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Prix (€)</label>
              <input 
                type="number" 
                step="0.01" 
                name="price" 
                required 
                placeholder="Ex: 50"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Durée (minutes)</label>
              <input 
                type="number" 
                name="duration" 
                required 
                placeholder="Ex: 30"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea 
                name="description" 
                required 
                rows={3}
                placeholder="Décris ton service en quelques mots..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
              >
                Créer le service
              </button>
            </div>
          </form>
        </div>

        {/* Liste des services avec options de modification et suppression */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Services enregistrés</h2>
          
          {services.length === 0 ? (
            <p className="text-slate-500 text-center py-8 bg-slate-900/50 rounded-xl border border-slate-900">
              Aucun service pour le moment. Ajoute ton premier service ci-dessus !
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 flex flex-col justify-between">
                  
                  <form action={updateService} className="space-y-3">
                    <input type="hidden" name="id" value={service.id} />
                    
                    <div className="flex justify-between items-start gap-2">
                      <input 
                        type="text" 
                        name="title" 
                        defaultValue={service.title} 
                        required
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-semibold text-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          step="0.01" 
                          name="price" 
                          defaultValue={service.price} 
                          required
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-blue-400 font-semibold text-xs w-20 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-blue-400">€</span>
                      </div>
                    </div>

                    <textarea 
                      name="description" 
                      defaultValue={service.description} 
                      required 
                      rows={2}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-400 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <span>Durée :</span>
                        <input 
                          type="number" 
                          name="duration" 
                          defaultValue={service.duration} 
                          required
                          className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-slate-300 w-14 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span>min</span>
                      </div>

                      <button 
                        type="submit"
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition-colors"
                      >
                        Mettre à jour
                      </button>
                    </div>
                  </form>

                  <div className="pt-3 border-t border-slate-800/60 flex justify-end">
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={service.id} />
                      <button 
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Supprimer le service
                      </button>
                    </form>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section des réservations avec gestion des statuts, paiements, factures et filtres */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-200">Gestion des Réservations, Paiements & Factures</h2>
            
            {/* Boutons de filtres */}
            <div className="flex flex-wrap gap-2">
              <a 
                href="/" 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentStatus === 'ALL' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}
              >
                Toutes
              </a>
              <a 
                href="/?status=PENDING" 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentStatus === 'PENDING' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'}`}
              >
                En attente
              </a>
              <a 
                href="/?status=CONFIRMED" 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentStatus === 'CONFIRMED' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
              >
                Confirmées
              </a>
              <a 
                href="/?status=CANCELLED" 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentStatus === 'CANCELLED' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'}`}
              >
                Annulées
              </a>
            </div>
          </div>
          
          {bookings.length === 0 ? (
            <p className="text-slate-500 text-center py-6 bg-slate-900/50 rounded-xl border border-slate-900">
              Aucune réservation trouvée pour ce filtre.
            </p>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400 whitespace-nowrap">
                <thead className="text-xs uppercase bg-slate-950 text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">Date et heure</th>
                    <th className="px-6 py-3">Paiement</th>
                    <th className="px-6 py-3">Facture</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => {
                    const statusKey = booking.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED'

                    const statusStyles = {
                      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
                    }[statusKey] || 'bg-slate-800 text-slate-300 border-slate-700'

                    const statusLabels = {
                      PENDING: 'En attente',
                      CONFIRMED: 'Confirmée',
                      CANCELLED: 'Annulée',
                    }[statusKey] || booking.status

                    return (
                      <tr key={booking.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-slate-200 font-medium">{booking.clientName}</div>
                          <div className="text-xs text-slate-500">{booking.clientEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-blue-400 font-medium">{booking.service.title}</td>
                        <td className="px-6 py-4 text-slate-300">{new Date(booking.date).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          {booking.isPaid ? (
                            <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Payé (Stripe)
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Non payé
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {booking.invoice ? (
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                              {booking.invoice.invoiceNumber}
                            </span>
                          ) : (
                            <form action={async () => {
                              'use server'
                              await generateInvoice(booking.id, booking.service.price)
                            }}>
                              <button 
                                type="submit"
                                className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded transition-colors"
                              >
                                Générer facture
                              </button>
                            </form>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${statusStyles}`}>
                            {statusLabels}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Formulaire de changement de statut */}
                            <form action={updateBookingStatus} className="flex items-center gap-1">
                              <input type="hidden" name="id" value={booking.id} />
                              <select 
                                name="status" 
                                defaultValue={booking.status}
                                className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="PENDING">En attente</option>
                                <option value="CONFIRMED">Confirmée</option>
                                <option value="CANCELLED">Annulée</option>
                              </select>
                              <button 
                                type="submit"
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition-colors"
                              >
                                Mettre à jour
                              </button>
                            </form>

                            {/* Bouton de suppression définitive */}
                            <form action={deleteBooking}>
                              <input type="hidden" name="id" value={booking.id} />
                              <button 
                                type="submit"
                                className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1 rounded transition-colors"
                              >
                                Supprimer
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section CRM : Gestion des Clients */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-200">Gestion des Clients (CRM)</h2>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg">
              {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
            </span>
          </div>

          {clients.length === 0 ? (
            <p className="text-slate-500 text-center py-6 bg-slate-900/50 rounded-xl border border-slate-900">
              Aucun client enregistré pour le moment.
            </p>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs uppercase bg-slate-950 text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3">Nom</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Réservations</th>
                    <th className="px-6 py-3 text-right">Date d'inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client: any) => (
                    <tr key={client.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-200 font-medium">{client.name}</td>
                      <td className="px-6 py-4 text-slate-400">{client.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {client.bookings.length} réservation(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}