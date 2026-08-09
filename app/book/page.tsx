'use client'

import { useState, useEffect } from 'react'
import { getPublicServices } from '@/actions/booking-actions'
import { getEmployees } from '@/actions/service-actions'
import { createCheckoutSession } from '@/actions/payment-actions'

type Service = {
  id: string
  title: string
  price: number
  duration: number
}

type Employee = {
  id: string
  name: string
  role: string | null
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Charger les services et les employés en même temps
    Promise.all([
      getPublicServices(),
      getEmployees()
    ]).then(([servicesData, employeesData]) => {
      setServices(servicesData)
      setEmployees(employeesData)
    })
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const result = await createCheckoutSession(formData)

    // Si une erreur est retournée (car si le paiement réussit, Next.js redirige directement)
    if (result && !result.success) {
      setLoading(false)
      setMessage({ success: false, text: result.message })
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 md:p-24">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Barre de navigation rapide vers l'administration */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl shadow-lg">
          <span className="text-sm font-medium text-slate-400">Espace Client (Public)</span>
          <a 
            href="/" 
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20 font-medium"
          >
            ← Retour à l'Administration
          </a>
        </div>

        {/* En-tête */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Bookiz - Espace Réservation
          </h1>
          <p className="text-slate-400">
            Choisissez un service, un prestataire et procédez au paiement sécurisé pour valider votre créneau.
          </p>
        </div>

        {/* Formulaire de réservation */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-slate-200">Réserver une prestation</h2>
          
          {message && (
            <div className={`p-4 mb-6 rounded-lg text-sm border ${
              message.success 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sélection du service */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Sélectionner un service</label>
              <select 
                name="serviceId" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choisissez un service --</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title} ({service.price} € - {service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection de l'employé */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Sélectionner un prestataire (Optionnel)</label>
              <select 
                name="employeeId" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Sans préférence / Premier disponible --</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.role ? `(${employee.role})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Votre Nom</label>
                <input 
                  type="text" 
                  name="clientName" 
                  required 
                  placeholder="Ex: Jean Dupont"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Votre Email</label>
                <input 
                  type="email" 
                  name="clientEmail" 
                  required 
                  placeholder="Ex: jean@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date et heure du rendez-vous</label>
              <input 
                type="datetime-local" 
                name="date" 
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-600/20 mt-4 disabled:opacity-50"
            >
              {loading ? 'Redirection vers le paiement...' : 'Procéder au paiement'}
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}