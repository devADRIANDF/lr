import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface pb-24 pt-14 md:pb-14">
      <div className="mx-auto max-w-5xl px-5">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl italic text-ink">Lamine Resell</p>
            <p className="mt-2 text-xs leading-relaxed text-mist">
              Cuentas con valoraciones, vendidas directamente.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-600 uppercase tracking-widest text-mist">Tienda</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink">
              <Link href="/producto" className="hover:underline">Catálogo</Link>
              <Link href="/ayuda" className="hover:underline">Preguntas frecuentes</Link>
              <a href="https://t.me/LAMINE_RESELL" target="_blank" rel="noopener noreferrer" className="hover:underline">Telegram</a>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-600 uppercase tracking-widest text-mist">Legal</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink">
              <Link href="/legal/aviso-legal" className="hover:underline">Aviso legal</Link>
              <Link href="/legal/privacidad" className="hover:underline">Privacidad</Link>
              <Link href="/legal/condiciones" className="hover:underline">Condiciones de venta</Link>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-line pt-6 text-[11px] text-mist">
          © {new Date().getFullYear()} Lamine Resell
        </p>
      </div>
    </footer>
  );
}
