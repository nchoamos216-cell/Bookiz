import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  async function login(formData: FormData) {
    'use server'
    const password = formData.get('password')
    // Remplace "TON_MOT_DE_PASSE" par le mot de passe de ton choix
    if (password === 'monmotdepasse123') {
      (await cookies()).set('admin_session', 'authenticated', { httpOnly: true })
      redirect('/admin')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <form action={login} className="bg-slate-900 p-8 rounded-xl border border-slate-800">
        <h2 className="text-white mb-4">Connexion Admin</h2>
        <input name="password" type="password" className="w-full p-2 mb-4 bg-slate-800 text-white rounded" placeholder="Mot de passe" />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Entrer</button>
      </form>
    </div>
  )
}
