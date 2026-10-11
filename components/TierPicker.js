import Tally from "./Tally";
import { TIERS, eur, porValoracion } from "../lib/catalogo";

// Banda negra con el contador de valoraciones y el selector de tramo.
// Se usa en la portada (con botón de compra en `children`) y en la página de producto.
export default function TierPicker({ value, onChange, children, compact = false }) {
  const tier = TIERS.find((t) => t.n === value) || TIERS[2];
  const barato = Math.min(...TIERS.map(porValoracion));
  const caro = Math.max(...TIERS.map(porValoracion));

  return (
    <section className="bg-ink text-paper" aria-label="Elige cuántas valoraciones">
      <div className={`wrap ${compact ? "py-10 md:py-12" : "py-12 md:py-16"}`}>
        <Tally
          count={tier.n}
          capacity={20}
          perRow={4}
          className={`block w-full ${compact ? "max-h-[150px] md:max-h-[190px]" : "max-h-[170px] md:max-h-[250px]"}`}
        />

        <div className="mt-8 flex items-end justify-between gap-6 md:mt-10">
          <div aria-live="polite">
            <p className="cond text-[112px] leading-[0.78] md:text-[176px]">{tier.n}</p>
            <p className="mt-4 text-[17px] font-medium">valoraciones</p>
          </div>
          <div className="text-right" aria-live="polite">
            <p className="cond text-[68px] leading-[0.8] md:text-[104px]">{eur(tier.price)}</p>
            <p className="mt-4 text-[15px] text-paper/70">{eur(porValoracion(tier))} cada una</p>
          </div>
        </div>

        <fieldset className="mt-8 md:mt-10">
          <legend className="sr-only">Número de valoraciones de la cuenta</legend>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {TIERS.map((t) => {
              const sel = t.n === tier.n;
              return (
                <label key={t.n} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="tramo"
                    value={t.n}
                    checked={sel}
                    onChange={() => onChange(t.n)}
                    className="peer sr-only"
                  />
                  <span className="flex h-[84px] flex-col items-start justify-between border-[3px] border-paper p-3 transition-colors hover:bg-paper/15 peer-checked:bg-paper peer-checked:text-ink peer-checked:hover:bg-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-4 peer-focus-visible:outline-paper md:h-24 md:p-4">
                    <span className="cond text-[40px] md:text-[48px]">{t.n}</span>
                    <span className="text-[13px] font-semibold leading-none md:text-[15px]">{eur(t.price)}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-4 text-[14px] text-paper/70">
            Cuanto más grande es la cuenta, menos pagas por valoración: de {eur(caro)} a {eur(barato)}.
          </p>
        </fieldset>

        {children}
      </div>
    </section>
  );
}
