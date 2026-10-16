import Link from "next/link";
import Nav from "../components/Nav";
import Meta from "../components/Meta";

// Página que sale cuando el enlace no existe (en lugar de la de error genérica en inglés)
export default function NoEncontrada() {
  return (
    <>
      <Meta title="Página no encontrada | Lamine Resell" />
      <Nav />
      <main>
        <div className="wrap py-16 md:py-24">
          <p className="cond-mid text-[22px] md:text-[26px]">Error 404</p>
          <h1 className="cond mt-4 max-w-[10ch] text-balance text-[length:min(4.25rem,calc((100vw_-_2.5rem)/3.8))] md:text-[length:clamp(4.25rem,9.4vw,9rem)]">
            Esta página no existe.
          </h1>
          <p className="mt-8 max-w-md text-[19px] leading-snug text-ink/80">
            El enlace puede estar mal escrito o la página ya no está. Vuelve al inicio o mira las cuentas disponibles.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="btn btn-ink">Volver al inicio</Link>
            <Link href="/producto" className="btn btn-line">Ver el catálogo</Link>
          </div>
        </div>
      </main>
    </>
  );
}
