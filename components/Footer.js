import Link from "next/link";
import { EMPRESA, MAILTO_URL } from "../lib/empresa";
import { DOCS_LEGALES } from "./LegalLayout";
import { Wordmark } from "./Logo";

// Enlaces del pie: la zona de toque mide al menos 44 px en el móvil
const ENLACE = "inline-flex min-h-11 items-center underline-offset-4 hover:underline md:min-h-9";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="wrap pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <p className="max-w-xs text-[17px] leading-snug md:col-span-5">
            Cuentas con valoraciones, vendidas directamente y listas para usar.
          </p>
          <div className="md:col-span-3 md:col-start-7">
            <p className="text-sm text-paper/60">Tienda</p>
            <ul className="mt-2 text-[17px] font-medium">
              <li><Link href="/producto" className={ENLACE}>Catálogo</Link></li>
              <li><Link href="/ayuda" className={ENLACE}>Preguntas frecuentes</Link></li>
              <li><a href={MAILTO_URL} className={ENLACE}>Contacto por email</a></li>
              <li><Link href="/login" className={ENLACE}>Mi cuenta</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-paper/60">Legal</p>
            <ul className="mt-2 text-[17px] font-medium">
              {DOCS_LEGALES.map((d) => (
                <li key={d.href}><Link href={d.href} className={ENLACE}>{d.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-1 border-t-[3px] border-paper py-5 text-[13px] text-paper/60 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} {EMPRESA.nombre} · {EMPRESA.marca}</span>
          <span>Pagos procesados por Stripe</span>
        </div>

        {/* Nombre de la marca a todo el ancho: es un dibujo, no texto, así que ocupa justo el ancho de la columna en cualquier pantalla */}
        <div aria-hidden="true" className="select-none pb-5 pt-6 md:pb-8 md:pt-8">
          <Wordmark className="block h-auto w-full" />
        </div>
      </div>
    </footer>
  );
}
