import { useState } from "react";
import Nav from "../components/Nav";
import Meta from "../components/Meta";
import { eur } from "../lib/catalogo";

const PRESETS = [10, 25, 50, 100];

export default function Saldo() {
  const [amount, setAmount] = useState(50);
  const [status, setStatus] = useState(null);
  const cargando = status === "cargando";
  const importeValido = Number.isInteger(amount) && amount >= 5 && amount <= 500;

  async function recargar(e) {
    e.preventDefault();
    if (cargando) return;
    if (!importeValido) return setStatus({ error: "Elige un importe entero entre 5 y 500 €." });
    setStatus("cargando");
    try {
      const r = await fetch("/api/stripe/checkout-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountEuros: amount }),
      });
      const data = await r.json();
      if (!r.ok) return setStatus({ error: data.error || "No se pudo iniciar la recarga." });
      window.location.href = data.url;
    } catch {
      setStatus({ error: "No se pudo conectar. Inténtalo de nuevo." });
    }
  }

  return (
    <>
      <Meta title="Monedero | Lamine Resell" path="/saldo" />
      <Nav />
      <main>
        <div className="wrap grid gap-12 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <h1 className="cond text-[length:clamp(4.25rem,8vw,7.5rem)]">Tu monedero</h1>
            <p className="mt-6 max-w-sm text-[19px] leading-snug text-ink/80">
              Recarga una vez y úsalo en tus próximas compras sin repetir el proceso de pago cada vez.
            </p>
          </div>

          <form onSubmit={recargar} className="md:col-span-7">
            <p className="field-label">Cantidad a recargar</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  aria-pressed={amount === p}
                  onClick={() => setAmount(p)}
                  className={`cond border-[3px] border-ink py-5 text-[34px] transition-colors md:py-7 md:text-[48px] ${
                    amount === p ? "bg-ink text-paper" : "hover:bg-bone"
                  }`}
                >
                  {p} €
                </button>
              ))}
            </div>

            <label htmlFor="importe" className="field-label mt-8">O elige otro importe (de 5 a 500 €)</label>
            <input
              id="importe"
              type="number"
              inputMode="numeric"
              min={5}
              max={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="field"
            />

            <button type="submit" disabled={cargando} className="btn btn-ink mt-8 w-full !h-auto min-h-16 !py-3 !text-[26px]">
              {cargando ? "Procesando…" : importeValido ? `Recargar ${eur(amount * 100)}` : "Recargar"}
            </button>
            {status?.error && (
              <p role="alert" className="mt-4 border-l-[6px] border-alert pl-3 text-[15px] font-medium text-alert">{status.error}</p>
            )}
            <p className="mt-5 text-[14px] text-ink/70">Pago seguro con Stripe.</p>
          </form>
        </div>
      </main>
    </>
  );
}
