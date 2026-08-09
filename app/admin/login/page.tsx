"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin"); // Redirige vers ton admin
    } else {
      setError("Mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Administration Bookiz</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input
          type="password"
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 mb-4 text-white"
          required
        />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold">
          Se connecter
        </button>
      </form>
    </div>
  );
}