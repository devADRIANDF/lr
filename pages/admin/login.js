import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error);
    router.push("/admin");
  }

  return (
    <>
      <Head><title>Acceso admin — Lamine Resell</title></Head>
      <main className="flex min-h-screen items-center justify-center bg-page px-5">
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-none border border-line bg-surface p-6">
          <h1 className="font-display text-xl font-700 text-ink">Panel de administración</h1>
          <label className="mt-6 block text-xs font-600 uppercase tracking-wide text-mist">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="mt-2 w-full rounded-none border border-line bg-page px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
          {error && <p className="mt-3 text-xs text-coral">{error}</p>}
          <button type="submit" className="mt-5 w-full rounded-none bg-ink py-3 text-sm font-600 text-white hover:bg-ink/90">
            Entrar
          </button>
        </form>
      </main>
    </>
  );
}
