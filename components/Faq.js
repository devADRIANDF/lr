// Lista de preguntas desplegables con <details>: funciona con teclado y sin JavaScript.
export default function Faq({ items }) {
  return (
    <div className="border-t-[3px] border-ink">
      {items.map((p) => (
        <details key={p.q} className="faq border-b-[3px] border-ink">
          <summary className="flex items-center justify-between gap-6 py-5 md:py-6">
            <span className="cond-mid text-[26px] md:text-[34px]">{p.q}</span>
            <span className="faq-plus relative block h-7 w-7 shrink-0" aria-hidden="true">
              <span className="absolute left-0 top-[12px] block h-[3px] w-7 bg-ink" />
              <span className="absolute left-[12px] top-0 block h-7 w-[3px] bg-ink" />
            </span>
          </summary>
          <p className="max-w-[62ch] pb-8 text-[17px] leading-relaxed text-ink/75">{p.a}</p>
        </details>
      ))}
    </div>
  );
}
