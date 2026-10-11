import Link from "next/link";
import { useState } from "react";
import Nav from "../components/Nav";
import Meta from "../components/Meta";
import TierPicker from "../components/TierPicker";
import Faq from "../components/Faq";
import { PREGUNTAS } from "../lib/faq";
import { TIERS, PRECIO_EXTRA, PRECIO_MENSUAL_UNIDAD, PLAZO_ENTREGA, TELEGRAM_URL, eur } from "../lib/catalogo";

const PASOS = [
  {
    t: "Elige el tramo",
    p: `Cuentas con 5, 10, 15 o 20 valoraciones. Si quieres más, añade las que necesites a ${eur(PRECIO_EXTRA)} cada una.`,
  },
  {
    t: "Paga con tarjeta",
    p: "Sin crear cuenta: solo tu email. El pago lo procesa Stripe, nosotros no vemos los datos de tu tarjeta.",
  },
  {
    t: "Recibe el acceso",
    p: `Te enviamos los datos de acceso por email. Las cuentas se preparan bajo pedido, con un plazo máximo de ${PLAZO_ENTREGA}.`,
  },
];

export default function Home() {
  const [n, setN] = useState(15);
  const tier = TIERS.find((t) => t.n === n);

  return (
    <>
      <Meta title="Lamine Resell: cuentas con valoraciones, listas para usar" />
      <Nav />
      <main>
        {/* PORTADA: titular + contador de valoraciones / selector de tramo */}
        <section>
          <div className="wrap pb-10 pt-12 md:pb-14 md:pt-20">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <h1 className="cond text-balance text-[length:clamp(4.25rem,9.4vw,9rem)] md:col-span-8">
                Cuentas con valoraciones, listas para usar.
              </h1>
              <p className="max-w-sm text-[19px] leading-snug text-ink/80 md:col-span-4 md:pb-3">
                Eliges cuántas valoraciones quieres, pagas con tarjeta y recibes el acceso por email. Sin crear cuenta.
              </p>
            </div>
          </div>
        </section>

        <TierPicker value={n} onChange={setN}>
          <div className="mt-10 flex flex-col gap-6 border-t-[3px] border-paper pt-8 md:flex-row md:items-center md:justify-between">
            <p className="max-w-sm text-[15px] text-paper/70">
              La cuenta se prepara bajo pedido y te llega por email en un plazo máximo de {PLAZO_ENTREGA}.
            </p>
            <Link href={`/producto?tier=${tier.n}`} className="btn btn-paper w-full md:w-auto md:min-w-[420px]">
              Comprar la de {tier.n} por {eur(tier.price)}
            </Link>
          </div>
        </TierPicker>

        {/* CÓMO FUNCIONA: una secuencia real, por eso van numerados */}
        <section className="border-b-[3px] border-ink">
          <div className="wrap py-20 md:py-28">
            <h2 className="cond max-w-[13ch] text-balance text-[length:clamp(3rem,7vw,6.5rem)]">Tres pasos y la tienes.</h2>
            <ol className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
              {PASOS.map((p, i) => (
                <li key={p.t} className="border-t-[3px] border-ink pt-5">
                  <span className="cond block text-[88px] leading-[0.8]">{i + 1}</span>
                  <h3 className="cond-mid mt-6 text-[34px]">{p.t}</h3>
                  <p className="mt-3 max-w-xs text-[17px] text-ink/75">{p.p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* SUSCRIPCIÓN */}
        <section className="border-b-[3px] border-ink bg-bone">
          <div className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
            <div className="md:col-span-6">
              <h2 className="cond text-balance text-[length:clamp(3rem,7vw,6.5rem)]">O suscríbete y sigue sumando.</h2>
              <p className="mt-6 max-w-md text-[19px] leading-snug text-ink/80">
                Pagas el tramo la primera vez y, después, {eur(PRECIO_MENSUAL_UNIDAD)} por valoración al mes. Cada mes
                llegan valoraciones nuevas a tu cuenta. Cancelas cuando quieras.
              </p>
              <Link href="/producto?modo=suscripcion" className="btn btn-ink mt-8">Ver las suscripciones</Link>
            </div>
            <div className="md:col-span-6 md:pt-3">
              <div className="border-t-[3px] border-ink">
                {TIERS.map((t) => (
                  <div key={t.n} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-5 border-b-[3px] border-ink py-4 md:gap-x-8 md:py-5">
                    <span className="cond w-[2ch] text-[56px] leading-[0.85] md:text-[72px]">{t.n}</span>
                    <span className="text-[15px] leading-snug text-ink/75 md:text-[17px]">
                      valoraciones al mes
                      <br />
                      alta de {eur(t.price)}
                    </span>
                    <span className="cond text-[34px] md:text-[44px]">{eur(t.n * PRECIO_MENSUAL_UNIDAD)}/mes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* REFERIDOS */}
        <section className="bg-ink text-paper">
          <div className="wrap grid gap-10 py-20 md:grid-cols-12 md:items-end md:py-28">
            <h2 className="cond text-balance text-[length:clamp(3rem,7vw,6.5rem)] md:col-span-8">
              Invita y gana el 10% de cada compra.
            </h2>
            <div className="md:col-span-4 md:pb-2">
              <p className="text-[19px] leading-snug text-paper/80">
                Al crear tu cuenta obtienes un enlace propio. Cuando alguien compra a través de él, la comisión se
                acredita en tu monedero.
              </p>
              <Link href="/registro" className="btn btn-paper mt-8">Crear mi cuenta gratis</Link>
            </div>
          </div>
        </section>

        {/* PREGUNTAS + TELEGRAM */}
        <section>
          <div className="wrap py-20 md:py-28">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-4">
                <h2 className="cond text-[length:clamp(3rem,6vw,5.5rem)]">Preguntas frecuentes</h2>
                <Link href="/ayuda" className="mt-6 inline-block text-[17px] font-semibold underline underline-offset-4">
                  Ver todas las preguntas
                </Link>
              </div>
              <div className="md:col-span-8">
                <Faq items={PREGUNTAS.slice(0, 4)} />
              </div>
            </div>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-16 flex flex-col gap-6 border-[3px] border-ink p-6 transition-colors hover:bg-ink hover:text-paper md:mt-24 md:flex-row md:items-center md:justify-between md:p-10"
            >
              <span>
                <span className="cond block text-[length:clamp(2.25rem,5vw,4.25rem)]">¿Prefieres hablar directamente?</span>
                <span className="mt-3 block text-[17px] opacity-75">Escríbenos por Telegram y te ayudamos con tu pedido.</span>
              </span>
              <span className="btn shrink-0 border-current">Abrir Telegram</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
