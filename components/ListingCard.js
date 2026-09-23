import Link from "next/link";

function Fila({ n, price, index }) {
  return (
    <div className="flex items-center gap-4 py-5">
      <span className="w-8 shrink-0 font-display text-sm italic text-mist">
        {String(index).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg text-ink">Cuenta · {n} reviews</p>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-mist">Vendido por Lamine Resell</p>
      </div>
      <span className="shrink-0 font-display text-lg text-ink">{price}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-ink transition group-hover:translate-x-1">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

// Variante enlace: fila de catálogo que lleva a otra página (home)
export function ListingLink({ n, price, href, index = 1 }) {
  return (
    <Link href={href} className="group block border-b border-line first:border-t hover:bg-neutral-50">
      <div className="px-1">
        <Fila n={n} price={price} index={index} />
      </div>
    </Link>
  );
}

// Variante seleccionable: fila que se marca al elegir un paquete (producto)
export default function ListingCard({ n, price, selected, onClick, index = 1 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group block w-full border-b border-line px-1 text-left first:border-t ${
        selected ? "bg-neutral-50" : "hover:bg-neutral-50"
      }`}
    >
      <div className="flex items-center gap-4 py-5">
        <span className="w-8 shrink-0 font-display text-sm italic text-mist">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg text-ink">Cuenta · {n} reviews</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-mist">Vendido por Lamine Resell</p>
        </div>
        <span className="shrink-0 font-display text-lg text-ink">{price}</span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center border ${
            selected ? "border-ink bg-ink text-white" : "border-line text-transparent"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
        </span>
      </div>
    </button>
  );
}
