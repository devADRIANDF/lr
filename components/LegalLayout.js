import Link from "next/link";
import { useRouter } from "next/router";
import { TELEGRAM_URL } from "../lib/catalogo";

const DOCS = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/condiciones", label: "Condiciones de venta" },
];

export default function LegalLayout({ title, children }) {
  const { pathname } = useRouter();
  return (
    <main>
      <div className="wrap py-14 md:py-20">
        <h1 className="cond max-w-[14ch] text-[64px] md:text-[112px]">{title}</h1>
        <div className="mt-10 grid gap-14 md:mt-14 md:grid-cols-12">
          <div className="prose-legal text-[17px] md:col-span-7">{children}</div>

          <aside className="md:col-span-4 md:col-start-9">
            <div className="md:sticky md:top-8">
              <p className="field-label">Documentos legales</p>
              <ul className="border-t-[3px] border-ink">
                {DOCS.map((d) => {
                  const activo = pathname === d.href;
                  return (
                    <li key={d.href} className="border-b border-rule">
                      <Link
                        href={d.href}
                        aria-current={activo ? "page" : undefined}
                        className={`block px-3 py-3 text-[17px] ${
                          activo ? "bg-ink font-semibold text-paper" : "text-ink/80 hover:bg-bone hover:text-ink"
                        }`}
                      >
                        {d.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 bg-ink p-6 text-paper">
                <p className="cond-mid text-[30px]">¿Alguna duda?</p>
                <p className="mt-2 text-[15px] text-paper/75">Escríbenos por Telegram y te respondemos.</p>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-paper mt-5 w-full">
                  Abrir Telegram
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
