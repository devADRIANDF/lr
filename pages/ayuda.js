import Head from "next/head";
import Nav from "../components/Nav";

const PREGUNTAS = [
  {
    q: "¿Cómo se calcula el precio de una cuenta?",
    a: "Cada cuenta tiene un precio fijo según su tramo: 5 reviews (50 €), 10 (90 €), 15 (125 €) o 20 (160 €). Si quieres más reviews de las del tramo elegido, cada una extra cuesta 9 €.",
  },
  {
    q: "¿Necesito crear una cuenta para comprar?",
    a: "No. Solo necesitas tu email y el pago. La cuenta es opcional y sirve para guardar tu historial de pedidos y, si quieres, obtener tu propio enlace de referido.",
  },
  {
    q: "¿Cuánto tarda la entrega?",
    a: "Las cuentas se preparan bajo pedido: la entrega puede tardar hasta 2 semanas.",
  },
  {
    q: "¿Qué es el programa de referidos?",
    a: "Si te registras, obtienes un enlace propio. Cualquier compra hecha a través de ese enlace —tenga o no cuenta quien compra— te da una comisión del 10% en tu monedero.",
  },
  {
    q: "¿Es seguro pagar en la web?",
    a: "Sí. El pago lo procesa Stripe, una de las pasarelas de pago más usadas del mundo — nosotros nunca vemos ni guardamos los datos de tu tarjeta.",
  },
  {
    q: "Tengo una suscripción mensual, ¿puedo cancelarla?",
    a: "Sí, cuando quieras. Escríbenos por Telegram y la cancelamos al momento; dejarás de recibir cobros a partir de la siguiente fecha de renovación.",
  },
];

export default function Ayuda() {
  return (
    <>
      <Head><title>Ayuda — Lamine Resell</title></Head>
      <Nav />
      <main className="min-h-screen bg-page pb-28 md:pb-10">
        <div className="mx-auto max-w-2xl px-5 py-8">
          <h1 className="font-display text-2xl font-700 text-ink">Preguntas frecuentes</h1>

          <a
            href="https://t.me/LAMINE_RESELL"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-none border border-line bg-surface p-5 transition hover:border-ink"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-neutral-100 text-ink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 2L2 10.5l6 2 2 6.5 3-4 5 4z" /></svg>
            </span>
            <div>
              <p className="font-display text-sm font-600 text-ink">¿Prefieres hablar directamente?</p>
              <p className="text-xs text-mist">Escríbenos por Telegram, respondemos rápido</p>
            </div>
          </a>

          <div className="mt-6 space-y-4">
            {PREGUNTAS.map((p) => (
              <div key={p.q} className="rounded-none border border-line bg-surface p-5">
                <p className="font-display text-sm font-600 text-ink">{p.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-mist">{p.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
