import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const ref = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null;
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, ref }),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error);
    router.push("/panel");
  }

  return (
    <>
      <Head><title>Crear cuenta — Lamine Resell</title></Head>
      <Nav />
      <main className="min-h-screen bg-page pb-28 md:pb-10">
        <div className="mx-auto max-w-sm px-5 py-16">
          <h1 className="font-display text-2xl font-700 text-ink">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-mist">Gratis, y con tu propio código de invitación desde el primer minuto.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-none border border-line bg-surface p-6">
            <div>
              <label className="text-xs font-600 uppercase tracking-wide text-mist">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="mt-2 w-full rounded-none border border-line bg-page px-4 py-3 text-sm text-ink outline-none focus:border-ink" />
            </div>
            <div>
              <label className="text-xs font-600 uppercase tracking-wide text-mist">Contraseña (mín. 6)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="mt-2 w-full rounded-none border border-line bg-page px-4 py-3 text-sm text-ink outline-none focus:border-ink" />
            </div>
            {error && <p className="text-xs text-coral">{error}</p>}
            <button type="submit" className="w-full rounded-none bg-ink py-3 text-sm font-600 text-white transition hover:bg-neutral-800">
              Crear cuenta
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
