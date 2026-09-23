import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import { ListingLink } from "../components/ListingCard";

const LISTINGS = [
  { n: 5, price: "50 €" },
  { n: 10, price: "90 €" },
  { n: 15, price: "125 €" },
  { n: 20, price: "160 €" },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Lamine Resell — Cuentas con valoraciones, directas del vendedor</title>
      </Head>
      <Nav />
      <main className="min-h-screen bg-page pb-24 md:pb-0">
        {/* HERO — declaración centrada, sin caja ni botón sólido */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-2xl px-5 py-20 text-center md:py-28">
            <p className="text-xs font-600 uppercase tracking-[0.2em] text-mist">Edición actual</p>
            <h1 className="mt-4 font-display text-4xl italic leading-tight text-ink md:text-5xl">
              Cuentas con valoraciones, listas para usar
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-mist">
              Sin crear cuenta, sin esperas de verificación. Eliges, pagas y
              recibes el acceso por email.
            </p>
            <Link
              href="/producto"
              className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 font-display text-base italic text-ink hover:gap-3"
            >
              Ver el catálogo <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* CATÁLOGO — lista, no rejilla */}
        <section className="mx-auto max-w-2xl px-5 py-14">
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <h2 className="font-display text-sm uppercase tracking-widest text-ink">Catálogo</h2>
            <span className="text-xs text-mist">{LISTINGS.length} referencias</span>
          </div>
          {LISTINGS.map((l, i) => (
            <ListingLink key={l.n} n={l.n} price={l.price} href="/producto" index={i + 1} />
          ))}
        </section>

        {/* CÓMO FUNCIONA — dos columnas con numeral grande */}
        <section className="border-y border-line">
          <div className="mx-auto grid max-w-2xl gap-6 px-5 py-14 sm:grid-cols-[auto_1fr] sm:items-start">
            <span className="font-display text-6xl italic text-line">01</span>
            <div>
              <h2 className="font-display text-xl text-ink">Cómo funciona</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">
                Eliges cuántas valoraciones quieres, pagas con tarjeta y
                recibes los datos de acceso de la cuenta directamente en tu
                email. Sin cuenta de usuario obligatoria, sin trámites.
              </p>
            </div>
          </div>
        </section>

        {/* AFILIADOS — banda con contorno, no caja sólida */}
        <section className="mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="text-xs font-600 uppercase tracking-[0.2em] text-mist">Programa de invitados</p>
          <h2 className="mx-auto mt-3 max-w-sm font-display text-2xl italic text-ink">
            Comparte tu enlace, gana el 10% de cada compra
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist">
            Al crear tu cuenta obtienes un enlace propio. Cuando alguien
            compra a través de él, la comisión se acredita en tu monedero.
          </p>
          <Link
            href="/registro"
            className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 font-display text-base italic text-ink hover:gap-3"
          >
            Crear mi cuenta gratis <span aria-hidden>→</span>
          </Link>
        </section>
      </main>
    </>
  );
}
