import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Meta from "../components/Meta";
import AuthShell from "../components/AuthShell";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    if (enviando) return;
    setError(null);
    setEnviando(true);
    const ref = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null;
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ref }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "No se pudo crear la cuenta.");
        setEnviando(false);
        return;
      }
      router.push("/panel");
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <>
      <Meta title="Crear cuenta | Lamine Resell" path="/registro" />
      <Nav />
      <AuthShell
        title="Crea tu cuenta"
        lead="Es gratis y no hace falta para comprar. Te da un enlace propio para invitar y ganar comisión en tu monedero."
        pie={
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold underline underline-offset-4">Entrar</Link>
          </p>
        }
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Contraseña (mínimo 6 caracteres)</label>
            <input id="password" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required className="field" />
          </div>
          {error && (
            <p role="alert" className="border-l-[6px] border-alert pl-3 text-[15px] font-medium text-alert">{error}</p>
          )}
          <button type="submit" disabled={enviando} className="btn btn-ink w-full">
            {enviando ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
