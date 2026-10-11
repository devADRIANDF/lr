import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { TELEGRAM_URL, eur } from "../lib/catalogo";

export default function Nav() {
  const [user, setUser] = useState(undefined); // undefined = cargando, null = sin sesión
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, []);

  // Cierra el menú al cambiar de página y con Escape
  useEffect(() => {
    const cerrar = () => setAbierto(false);
    router.events.on("routeChangeStart", cerrar);
    const onKey = (e) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => {
      router.events.off("routeChangeStart", cerrar);
      window.removeEventListener("keydown", onKey);
    };
  }, [router.events]);

  // Bloquea el scroll de la página mientras el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  const enlace = (href) =>
    `border-b-[3px] pb-0.5 transition-colors ${
      router.pathname === href ? "border-ink" : "border-transparent hover:border-ink"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
        <div className="wrap flex h-16 items-center justify-between">
          <Link href="/" aria-label="Lamine Resell, inicio" className="text-ink">
            <Logo />
          </Link>

          {/* Escritorio */}
          <nav className="hidden items-center gap-8 text-[15px] font-semibold md:flex" aria-label="Principal">
            <Link href="/producto" className={enlace("/producto")}>Catálogo</Link>
            <Link href="/ayuda" className={enlace("/ayuda")}>Preguntas</Link>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={enlace("")}>Telegram</a>
            {user === null && <Link href="/login" className={enlace("/login")}>Acceder</Link>}
            {user && (
              <Link href="/panel" className="flex items-center gap-2.5">
                <span className={enlace("/panel")}>Mi cuenta</span>
                <span className="border-[3px] border-ink px-2 py-0.5 text-[13px] leading-5">{eur(user.wallet_balance)}</span>
              </Link>
            )}
            <Link href="/producto" className="btn btn-ink !h-11 !px-5 !text-lg">Comprar</Link>
          </nav>

          {/* Móvil */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/producto" className="btn btn-ink !h-10 !border-2 !px-4 !text-lg">Comprar</Link>
            <button
              type="button"
              onClick={() => setAbierto(true)}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label="Abrir menú"
              className="flex h-10 w-10 flex-col items-center justify-center gap-[6px]"
            >
              <span className="block h-[3px] w-6 bg-ink" />
              <span className="block h-[3px] w-6 bg-ink" />
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil a pantalla completa */}
      {abierto && (
        <div id="menu-movil" role="dialog" aria-modal="true" aria-label="Menú" className="fixed inset-0 z-50 flex flex-col bg-ink text-paper md:hidden">
          <div className="flex h-16 items-center justify-between px-5">
            <Link href="/" aria-label="Lamine Resell, inicio"><Logo /></Link>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar menú" className="relative h-10 w-10">
              <span className="absolute left-2 top-[19px] block h-[3px] w-6 rotate-45 bg-paper" />
              <span className="absolute left-2 top-[19px] block h-[3px] w-6 -rotate-45 bg-paper" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-1 px-5" aria-label="Menú">
            <Link href="/producto" className="cond py-1 text-[22vw] sm:text-8xl">Catálogo</Link>
            <Link href="/ayuda" className="cond py-1 text-[22vw] sm:text-8xl">Preguntas</Link>
            <Link href={user ? "/panel" : "/login"} className="cond py-1 text-[22vw] sm:text-8xl">
              {user ? "Mi cuenta" : "Acceder"}
            </Link>
          </nav>
          <div className="flex items-center justify-between border-t-[3px] border-paper px-5 py-5 text-[15px]">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">Escríbenos por Telegram</a>
            {user && <span className="border-[3px] border-paper px-2 py-0.5 text-[13px]">{eur(user.wallet_balance)}</span>}
          </div>
        </div>
      )}
    </>
  );
}
