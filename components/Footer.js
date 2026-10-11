import Link from "next/link";
import { TELEGRAM_URL } from "../lib/catalogo";

export default function Footer() {
  return (
    <footer className="overflow-hidden bg-ink text-paper">
      <div className="wrap pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <p className="max-w-xs text-[17px] leading-snug md:col-span-5">
            Cuentas con valoraciones, vendidas directamente y listas para usar.
          </p>
          <div className="md:col-span-3 md:col-start-7">
            <p className="text-sm text-paper/60">Tienda</p>
            <ul className="mt-4 space-y-3 text-[17px] font-medium">
              <li><Link href="/producto" className="underline-offset-4 hover:underline">Catálogo</Link></li>
              <li><Link href="/ayuda" className="underline-offset-4 hover:underline">Preguntas frecuentes</Link></li>
              <li><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">Telegram</a></li>
              <li><Link href="/login" className="underline-offset-4 hover:underline">Mi cuenta</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-paper/60">Legal</p>
            <ul className="mt-4 space-y-3 text-[17px] font-medium">
              <li><Link href="/legal/aviso-legal" className="underline-offset-4 hover:underline">Aviso legal</Link></li>
              <li><Link href="/legal/privacidad" className="underline-offset-4 hover:underline">Privacidad</Link></li>
              <li><Link href="/legal/condiciones" className="underline-offset-4 hover:underline">Condiciones de venta</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-1 border-t-[3px] border-paper py-5 text-[13px] text-paper/60 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} Lamine Resell</span>
          <span>Pagos procesados por Stripe</span>
        </div>

        {/* Nombre de la marca a todo el ancho */}
        <p
          aria-hidden="true"
          className="cond select-none whitespace-nowrap pb-6 pt-3 text-center text-[length:min(18.6vw,15.2rem)] leading-[0.8]"
        >
          Lamine Resell
        </p>
      </div>
    </footer>
  );
}
