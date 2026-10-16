import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return setError(data.error || "No se pudo entrar.");
      router.push("/admin");
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Acceso admin | Lamine Resell</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-sm bg-paper p-7">
          <h1 className="cond text-[40px] min-[360px]:text-[48px] sm:text-[56px]">Administración</h1>

          <label htmlFor="email" className="field-label mt-7">
            Email <span className="font-normal text-ash">(solo si tienes cuenta de administrador)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="tu@email.com"
            className="field"
          />

          <label htmlFor="pw" className="field-label mt-5">Contraseña</label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="field"
          />
          <p className="mt-2 text-[13px] leading-snug text-ash">Sin email, se entra con la clave general.</p>

          {error && (
            <p role="alert" className="mt-4 border-l-[6px] border-alert pl-3 text-[15px] font-medium text-alert">{error}</p>
          )}
          <button type="submit" disabled={enviando} className="btn btn-ink mt-6 w-full">
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </main>
    </>
  );
}
