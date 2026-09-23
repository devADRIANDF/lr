import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import ListingCard from "../components/ListingCard";

const TIERS = [
  { n: 5, price: 5000, label: "50 €" },
  { n: 10, price: 9000, label: "90 €" },
  { n: 15, price: 12500, label: "125 €" },
  { n: 20, price: 16000, label: "160 €" },
];
const PRECIO_EXTRA = 900;       // 9 € por review adicional al tramo (pago único)
const PRECIO_MENSUAL_UNIDAD = 600; // 6 € por review al mes (suscripción)

export default function Producto() {
  const [modo, setModo] = useState("unico"); // 'unico' | 'suscripcion'
  const [selected, setSelected] = useState(15);
  const [extra, setExtra] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const router = useRouter();

  const tier = TIERS.find((t) => t.n === selected);
  const totalUnico = tier.price + extra * PRECIO_EXTRA;
  const totalMensual = selected * PRECIO_MENSUAL_UNIDAD;

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setEmail(d.user.email);
    });
  }, []);

  async function comprar(e) {
    e.preventDefault();
    if (!email.trim()) return setStatus({ error: "Indica tu email para recibir el pedido." });
    setStatus("cargando");
    const ref = router.query.ref || (typeof window !== "undefined" ? localStorage.getItem("rv_ref") : null);

    const endpoint = modo === "unico" ? "/api/stripe/checkout-cuenta" : "/api/stripe/checkout-suscripcion";
    const body = modo === "unico"
      ? { email, tier: selected, extra, ref }
      : { email, type: "cuenta", reviewsPerMonth: selected, ref };

    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) return setStatus({ error: data.error });
    window.location.href = data.url;
  }

  return (
    <>
      <Head><title>Cuentas en venta — Lamine Resell</title></Head>
      <Nav />
      <main className="min-h-screen bg-page pb-28 md:pb-16">
        <div className="mx-auto max-w-2xl px-5 py-10">
          <p className="text-xs font-600 uppercase tracking-[0.2em] text-mist">Catálogo</p>
          <h1 className="mt-2 font-display text-3xl italic text-ink">Cuentas disponibles</h1>

          <div className="mt-8 border-t border-line">
            {TIERS.map((t, i) => (
              <ListingCard
                key={t.n}
                n={t.n}
                price={t.label}
                selected={selected === t.n}
                onClick={() => setSelected(t.n)}
                index={i + 1}
              />
            ))}
          </div>

          {/* Resguardo de pedido, a modo de recibo */}
          <form onSubmit={comprar} className="mt-14 border-t-2 border-ink pt-6">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-xl italic text-ink">Cuenta · {tier.n} reviews</p>
              <span className="text-xs text-mist">Ref. {String(TIERS.findIndex((t) => t.n === selected) + 1).padStart(2, "0")}</span>
            </div>
            <p className="mt-1 text-xs text-mist">Entrega en un plazo máximo de 4 semanas</p>

            <div className="mt-6 flex gap-6 border-y border-line py-3 text-xs font-600 uppercase tracking-widest">
              <button type="button" onClick={() => setModo("unico")}
                className={`border-b pb-1 transition ${modo === "unico" ? "border-ink text-ink" : "border-transparent text-mist"}`}>
                Pago único
              </button>
              <button type="button" onClick={() => setModo("suscripcion")}
                className={`border-b pb-1 transition ${modo === "suscripcion" ? "border-ink text-ink" : "border-transparent text-mist"}`}>
                Suscripción mensual
              </button>
            </div>

            {modo === "unico" ? (
              <div className="mt-5">
                <label className="text-xs font-600 uppercase tracking-wide text-mist">
                  ¿Reviews de más? (9 € cada una)
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" onClick={() => setExtra((e) => Math.max(0, e - 1))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-lg text-ink hover:border-ink">−</button>
                  <input type="number" min={0} value={extra}
                    onChange={(e) => setExtra(Math.max(0, Number(e.target.value) || 0))}
                    className="w-16 border border-line bg-page px-2 py-1.5 text-center font-display text-base text-ink outline-none focus:border-ink" />
                  <button type="button" onClick={() => setExtra((e) => e + 1)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-lg text-ink hover:border-ink">+</button>
                  <span className="text-xs text-mist">extra</span>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-mist">
                Cada mes recibirás {selected} reviews más en tu cuenta,
                repartidas a lo largo del mes. Cancela cuando quieras.
              </p>
            )}

            <label className="mt-6 block text-xs font-600 uppercase tracking-wide text-mist">
              Email para el pedido
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm text-ink outline-none focus:border-ink" />

            {modo === "unico" ? (
              <div className="mt-6 space-y-1 text-sm">
                <div className="flex justify-between text-mist">
                  <span>Cuenta con {tier.n} reviews</span>
                  <span>{tier.label}</span>
                </div>
                {extra > 0 && (
                  <div className="flex justify-between text-mist">
                    <span>{extra} reviews extra × 9 €</span>
                    <span>{(extra * PRECIO_EXTRA / 100).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2 font-display text-xl italic text-ink">
                  <span>Total hoy</span>
                  <span>{(totalUnico / 100).toFixed(2)} €</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-1 text-sm">
                <div className="flex justify-between text-mist">
                  <span>Cuota de alta (mes 1)</span>
                  <span>{(tier.price / 100).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 font-display text-xl italic text-ink">
                  <span>Después, al mes</span>
                  <span>{(totalMensual / 100).toFixed(2)} €/mes</span>
                </div>
              </div>
            )}

            <button type="submit"
              className="mt-6 w-full bg-ink py-3 text-sm font-600 uppercase tracking-widest text-white transition hover:bg-neutral-800">
              {modo === "unico"
                ? `Pagar ${(totalUnico / 100).toFixed(2)} €`
                : `Empezar por ${(tier.price / 100).toFixed(2)} € + ${(totalMensual / 100).toFixed(2)} €/mes`}
            </button>
            <p className="mt-3 border border-line px-3 py-2 text-center text-xs text-mist">
              Esta cuenta se prepara bajo pedido.
            </p>
            <p className="mt-3 text-center text-xs text-mist">No hace falta crear cuenta para comprar</p>
            {status === "cargando" && <p className="mt-3 text-center text-xs text-mist">Procesando…</p>}
            {status?.error && <p className="mt-3 text-center text-xs text-coral">{status.error}</p>}
          </form>
        </div>
      </main>
    </>
  );
}
