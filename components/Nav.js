import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Nav() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface">
        {/* Fila superior: utilidades */}
        <div className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-2 text-[11px] uppercase tracking-widest text-mist">
            <a href="https://t.me/LAMINE_RESELL" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Telegram
            </a>
            <div className="flex items-center gap-5">
              <Link href="/ayuda" className="hover:text-ink">Ayuda</Link>
              {user ? (
                <Link href="/panel" className="hover:text-ink">
                  {(user.wallet_balance / 100).toFixed(2)} € · Mi cuenta
                </Link>
              ) : (
                <Link href="/login" className="hover:text-ink">Acceder</Link>
              )}
            </div>
          </div>
        </div>

        {/* Masthead: logotipo centrado, a toda anchura */}
        <div className="border-b border-line py-6 text-center">
          <Link href="/" className="font-display text-3xl italic tracking-tight text-ink">
            Lamine <span className="not-italic">Resell</span>
          </Link>
        </div>

        {/* Fila de categorías, centrada */}
        <div className="hidden justify-center gap-10 border-b border-line py-3 text-xs font-600 uppercase tracking-widest text-ink md:flex">
          <Link href="/producto" className="underline-offset-4 hover:underline">Catálogo</Link>
          <Link href="/ayuda" className="underline-offset-4 hover:underline">Preguntas</Link>
        </div>
      </header>

      {/* Barra inferior fija en móvil, solo texto */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-line bg-surface py-3 text-[11px] font-600 uppercase tracking-wide md:hidden">
        <Link href="/" className={router.pathname === "/" ? "text-ink" : "text-mist"}>Inicio</Link>
        <Link href="/producto" className={router.pathname === "/producto" ? "text-ink" : "text-mist"}>Catálogo</Link>
        <Link href="/ayuda" className={router.pathname === "/ayuda" ? "text-ink" : "text-mist"}>Ayuda</Link>
        <Link href={user ? "/panel" : "/login"} className={router.pathname === "/panel" ? "text-ink" : "text-mist"}>
          Cuenta
        </Link>
      </nav>
    </>
  );
}
