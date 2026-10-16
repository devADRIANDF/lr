import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Meta from "../components/Meta";
import AuthShell from "../components/AuthShell";
import { MAILTO_URL } from "../lib/empresa";

export default function Login() {
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
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "No se pudo entrar.");
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
      <Meta title="Entrar | Lamine Resell" path="/login" />
      <Nav />
      <AuthShell
        title="Entrar"
        lead="Consulta tus pedidos, tu monedero y tu enlace de invitación."
        pie={
          <div className="space-y-3">
            <p>
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-semibold underline underline-offset-4">Crear cuenta</Link>
            </p>
            <p className="text-ink/75">
              ¿Has olvidado la contraseña?{" "}
              <a
                href={`${MAILTO_URL}?subject=${encodeURIComponent("Restablecer mi contraseña")}`}
                className="font-semibold text-ink underline underline-offset-4"
              >
                Escríbenos por email
              </a>{" "}
              y te la restablecemos.
            </p>
          </div>
        }
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="field" />
          </div>
          {error && (
            <p role="alert" className="border-l-[6px] border-alert pl-3 text-[15px] font-medium text-alert">{error}</p>
          )}
          <button type="submit" disabled={enviando} className="btn btn-ink w-full">
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
