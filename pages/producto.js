import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Meta from "../components/Meta";
import TierPicker from "../components/TierPicker";
import Tally from "../components/Tally";
import {
  TIERS,
  PRECIO_EXTRA,
  PRECIO_MENSUAL_UNIDAD,
  PLAZO_ENTREGA,
  TELEGRAM_URL,
  eur,
  eurExacto,
} from "../lib/catalogo";

export default function Producto() {
  const [modo, setModo] = useState("unico"); // 'unico' | 'suscripcion'
  const [selected, setSelected] = useState(15);
  const [extra, setExtra] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [acepto, setAcepto] = useState(false);
  const [user, setUser] = useState(null); // sesión, si la hay: permite pagar con el monedero
  const [barra, setBarra] = useState(false); // barra de pago fija en móvil
  const router = useRouter();
  const formRef = useRef(null);

  const tier = TIERS.find((t) => t.n === selected);
  const totalUnico = tier.price + extra * PRECIO_EXTRA;
  const totalMensual = selected * PRECIO_MENSUAL_UNIDAD;
  const hoy = modo === "unico" ? totalUnico : tier.price;
  const cargando = status === "cargando";

  // Tramo y modo que llegan desde la portada (?tier=15&modo=suscripcion)
  useEffect(() => {
    if (!router.isReady) return;
    const t = Number(router.query.tier);
    if (TIERS.some((x) => x.n === t)) setSelected(t);
    if (router.query.modo === "suscripcion") setModo("suscripcion");
  }, [router.isReady, router.query.tier, router.query.modo]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setEmail(d.user.email);
          setUser(d.user);
        }
      })
      .catch(() => {});
  }, []);

  // La barra de pago fija solo aparece mientras el formulario está en pantalla
  useEffect(() => {
    if (!formRef.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setBarra(e.isIntersecting), { threshold: 0.05 });
    io.observe(formRef.current);
    return () => io.disconnect();
  }, []);

  async function comprar(e) {
    e.preventDefault();
    if (cargando) return;
    if (!email.trim()) return setStatus({ error: "Indica tu email para recibir el pedido." });
    if (!acepto) return setStatus({ error: "Marca la casilla para aceptar las condiciones de venta." });
    setStatus("cargando");
    const ref = router.query.ref || (typeof window !== "undefined" ? localStorage.getItem("rv_ref") : null);

    const endpoint = modo === "unico" ? "/api/stripe/checkout-cuenta" : "/api/stripe/checkout-suscripcion";
    const body =
      modo === "unico"
        ? { email, tier: selected, extra, ref }
        : { email, type: "cuenta", reviewsPerMonth: selected, ref };

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) return setStatus({ error: data.error || "No se pudo iniciar el pago." });
      window.location.href = data.url;
    } catch {
      setStatus({ error: "No se pudo conectar. Inténtalo de nuevo." });
    }
  }

  // Pago con el saldo del monedero (solo con sesión iniciada y en pago único)
  const saldo = Number(user?.wallet_balance) || 0;
  const conMonedero = modo === "unico" && !!user;
  const saldoSuficiente = saldo >= totalUnico;

  async function pagarConMonedero() {
    if (cargando) return;
    if (!acepto) return setStatus({ error: "Marca la casilla para aceptar las condiciones de venta." });
    setStatus("cargando");
    try {
      const r = await fetch("/api/compra/cuenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selected, extra }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return setStatus({ error: data.error || "No se pudo completar la compra." });
      router.push("/pedido/confirmado");
    } catch {
      setStatus({ error: "No se pudo conectar. Inténtalo de nuevo." });
    }
  }

  const etiquetaPago =
    modo === "unico"
      ? `Pagar ${eurExacto(totalUnico)}`
      : `Empezar por ${eurExacto(tier.price)} y ${eurExacto(totalMensual)} al mes`;

  return (
    <>
      <Meta title="Elige tu cuenta | Lamine Resell" path="/producto" />
      <Nav />
      <main className={barra ? "pb-24 md:pb-0" : ""}>
        <div className="wrap pb-10 pt-12 md:pb-14 md:pt-20">
          <h1 className="cond text-[length:clamp(4.25rem,9.4vw,9rem)]">Elige tu cuenta.</h1>
        </div>

        <TierPicker value={selected} onChange={setSelected} compact />

        <div className="wrap grid gap-14 py-14 md:grid-cols-12 md:gap-12 md:py-20">
          {/* PEDIDO */}
          <form id="pedido" ref={formRef} onSubmit={comprar} className="md:col-span-7" noValidate>
            <div className="border-[3px] border-ink">
              <div className="flex items-center justify-between gap-4 p-5 md:p-7">
                <div>
                  <h2 className="cond text-[44px] md:text-[56px]">Tu pedido</h2>
                  <p className="mt-2 text-[15px] text-ink/75">
                    Cuenta de {tier.n} valoraciones{modo === "unico" && extra > 0 ? ` y ${extra} extra` : ""}
                  </p>
                </div>
                <Tally
                  count={Math.min(60, tier.n + (modo === "unico" ? extra : 0))}
                  capacity={0}
                  perRow={8}
                  ghost={false}
                  className="h-9 w-auto max-w-[45%] shrink-0 md:h-11"
                />
              </div>

              <div className="grid grid-cols-2 border-t-[3px] border-ink" role="group" aria-label="Forma de pago">
                {[
                  ["unico", "Pago único"],
                  ["suscripcion", "Suscripción mensual"],
                ].map(([k, t]) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={modo === k}
                    onClick={() => setModo(k)}
                    className={`cond-mid px-3 py-4 text-[22px] transition-colors md:text-[26px] ${
                      modo === k ? "bg-ink text-paper" : "hover:bg-bone"
                    } ${k === "unico" ? "border-r-[3px] border-ink" : ""}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-7 border-t-[3px] border-dashed border-ink p-5 md:p-7">
                {modo === "unico" ? (
                  <div>
                    <p className="field-label !mb-1">¿Valoraciones de más?</p>
                    <p className="text-[15px] text-ink/75">Cada una extra cuesta {eur(PRECIO_EXTRA)}.</p>
                    <div className="mt-4 flex items-center">
                      <button
                        type="button"
                        aria-label="Quitar una valoración extra"
                        onClick={() => setExtra((x) => Math.max(0, x - 1))}
                        className="cond grid h-14 w-14 place-items-center border-[3px] border-ink text-[36px] transition-colors hover:bg-ink hover:text-paper"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={extra}
                        aria-label="Valoraciones extra"
                        onChange={(e) => setExtra(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                        className="field !w-24 border-x-0 text-center text-xl font-semibold"
                      />
                      <button
                        type="button"
                        aria-label="Añadir una valoración extra"
                        onClick={() => setExtra((x) => x + 1)}
                        className="cond grid h-14 w-14 place-items-center border-[3px] border-ink text-[36px] transition-colors hover:bg-ink hover:text-paper"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[17px] leading-snug text-ink/80">
                    Cada mes recibirás {selected} valoraciones más en tu cuenta, repartidas a lo largo del mes.
                    Cancelas cuando quieras.
                  </p>
                )}

                <div>
                  <label htmlFor="email" className="field-label">Email para el pedido</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="field"
                  />
                </div>
              </div>

              <div className="border-t-[3px] border-dashed border-ink p-5 md:p-7">
                {modo === "unico" ? (
                  <dl className="space-y-2 text-[17px]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/75">Cuenta con {tier.n} valoraciones</dt>
                      <dd className="font-medium">{eur(tier.price)}</dd>
                    </div>
                    {extra > 0 && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink/75">{extra} {extra === 1 ? "valoración extra" : "valoraciones extra"} × {eur(PRECIO_EXTRA)}</dt>
                        <dd className="font-medium">{eurExacto(extra * PRECIO_EXTRA)}</dd>
                      </div>
                    )}
                    <div className="flex items-end justify-between gap-4 border-t-[3px] border-ink pt-4">
                      <dt className="cond-mid text-[28px]">Total hoy</dt>
                      <dd className="cond text-[56px] leading-[0.8]">{eurExacto(totalUnico)}</dd>
                    </div>
                  </dl>
                ) : (
                  <dl className="space-y-2 text-[17px]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/75">Alta de la cuenta (primer mes)</dt>
                      <dd className="font-medium">{eurExacto(tier.price)}</dd>
                    </div>
                    <div className="flex items-end justify-between gap-4 border-t-[3px] border-ink pt-4">
                      <dt className="cond-mid text-[28px]">Después, cada mes</dt>
                      <dd className="cond text-[56px] leading-[0.8]">{eurExacto(totalMensual)}</dd>
                    </div>
                  </dl>
                )}

                <label className="mt-7 flex cursor-pointer items-start gap-3 text-[15px] leading-snug">
                  <input
                    type="checkbox"
                    checked={acepto}
                    onChange={(e) => setAcepto(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="mt-px grid h-6 w-6 shrink-0 place-items-center border-[3px] border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-checked:[&>svg]:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    Acepto las{" "}
                    <Link href="/legal/condiciones" target="_blank" className="font-semibold underline underline-offset-2">
                      condiciones de venta
                    </Link>{" "}
                    y que, al ser contenido digital, pierdo el derecho de desistimiento una vez iniciada la entrega.
                  </span>
                </label>

                <button type="submit" disabled={cargando} className="btn btn-ink mt-6 w-full !h-16 !text-[26px]">
                  {cargando ? "Procesando…" : etiquetaPago}
                </button>
                {status?.error && (
                  <p role="alert" className="mt-4 border-l-[6px] border-alert pl-3 text-[15px] font-medium text-alert">
                    {status.error}
                  </p>
                )}
                {conMonedero && (
                  <div className="mt-6 border-t-[3px] border-dashed border-ink pt-6">
                    <div className="flex items-end justify-between gap-4">
                      <p className="text-[15px] text-ink/75">Saldo de tu monedero</p>
                      <p className="cond text-[40px] leading-[0.85]">{eurExacto(saldo)}</p>
                    </div>
                    {saldoSuficiente ? (
                      <button type="button" onClick={pagarConMonedero} disabled={cargando} className="btn btn-line mt-4 w-full">
                        {cargando ? "Procesando…" : `Pagar ${eurExacto(totalUnico)} con el monedero`}
                      </button>
                    ) : (
                      <p className="mt-3 text-[15px] leading-snug text-ink/75">
                        Te faltan {eurExacto(totalUnico - saldo)} para pagar con el monedero.{" "}
                        <Link href="/saldo" className="font-semibold text-ink underline underline-offset-4">Recargar saldo</Link>
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-5 text-center text-[14px] text-ink/70">
                  {user ? "Pago seguro con Stripe." : "No hace falta crear cuenta para comprar. Pago seguro con Stripe."}
                </p>
              </div>
            </div>
          </form>

          {/* QUÉ INCLUYE */}
          <aside className="md:col-span-5">
            <h2 className="cond text-[44px] md:text-[56px]">Qué recibes</h2>
            <ul className="mt-6 border-t-[3px] border-ink">
              {[
                `Una cuenta lista para usar con las valoraciones del tramo que elijas.`,
                `Los datos de acceso, por email.`,
                `Se prepara bajo pedido: entrega en un plazo máximo de ${PLAZO_ENTREGA}.`,
                `Soporte por Telegram si tienes cualquier duda.`,
              ].map((t) => (
                <li key={t} className="border-b-[3px] border-ink py-4 text-[17px] leading-snug">{t}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[17px] font-semibold">
              <Link href="/ayuda" className="underline underline-offset-4">Preguntas frecuentes</Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Escribir por Telegram</a>
            </div>
          </aside>
        </div>
      </main>

      {/* Barra de pago fija, solo en móvil y mientras se rellena el pedido */}
      {barra && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-ink bg-paper md:hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div>
              <p className="text-[12px] leading-none text-ink/70">{modo === "unico" ? "Total hoy" : "Hoy pagas"}</p>
              <p className="cond mt-1 text-[34px] leading-[0.9]">{eurExacto(hoy)}</p>
            </div>
            <button type="submit" form="pedido" disabled={cargando} className="btn btn-ink !h-12 flex-1 !text-[22px] sm:max-w-[240px]">
              {cargando ? "Procesando…" : "Pagar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
