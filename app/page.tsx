import { db } from '@/lib/db'
import Link from 'next/link'

export default async function PublicHomePage() {
  const services = await db.service.findMany()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-16">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* En-tête du site */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl shadow-lg">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Bookiz
            </h1>
            <p className="text-xs text-slate-400">Réservez votre prestation en quelques clics</p>
          </div>
          <Link 
            href="/admin" 
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors border border-slate-700 font-medium"
          >
            🔒 Espace Admin
          </Link>
        </div>

        {/* Section de présentation */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Nos Prestations Disponibles
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choisissez le service qui vous correspond, sélectionnez une date et procédez au paiement sécurisé.
          </p>
        </div>

        {/* Liste des services pour les clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-slate-100">{service.title}</h3>
                  <span className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full text-sm border border-blue-500/20">
                    {service.price} €
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{service.description}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500">Durée : {service.duration} min</span>
                <Link 
                  href={`/book?serviceId=${service.id}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                  Réservez →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
