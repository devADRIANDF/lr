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
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok) return setError(data.error || "No se pudo entrar.");
      router.push("/admin");
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    }
  }

  return (
    <>
      <Head>
        <title>Acceso admin | Lamine Resell</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-ink px-5">
        <form onSubmit={onSubmit} className="w-full max-w-sm bg-paper p-7">
          <h1 className="cond text-[40px] min-[360px]:text-[48px] sm:text-[56px]">Administración</h1>
          <label htmlFor="pw" className="field-label mt-7">Contraseña</label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            autoComplete="current-password"
            className="field"
          />
          {error && (
            <p role="alert" className="mt-4 border-l-[6px] border-alert pl-3 text-[15px] font-medium text-alert">{error}</p>
          )}
          <button type="submit" className="btn btn-ink mt-6 w-full">Entrar</button>
        </form>
      </main>
    </>
  );
}
