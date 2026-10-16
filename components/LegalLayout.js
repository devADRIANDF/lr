import Link from "next/link";
import { useRouter } from "next/router";
import { EMPRESA, MAILTO_URL } from "../lib/empresa";

export const DOCS_LEGALES = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/condiciones", label: "Condiciones de venta" },
  { href: "/legal/referidos", label: "Programa de referidos" },
];

export default function LegalLayout({ title, children }) {
  const { pathname } = useRouter();
  return (
    <main>
      <div className="wrap py-14 md:py-20">
        <h1 className="cond max-w-[14ch] text-[64px] md:text-[112px]">{title}</h1>
        <div className="mt-10 grid gap-14 md:mt-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-sm text-ink/60">Última actualización: {EMPRESA.actualizado}</p>
            <div className="prose-legal text-[17px]">{children}</div>
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <div className="md:sticky md:top-8">
              <p className="field-label">Documentos legales</p>
              <ul className="border-t-[3px] border-ink">
                {DOCS_LEGALES.map((d) => {
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
                <p className="mt-2 text-[15px] text-paper/75">Escríbenos por email y te respondemos.</p>
                <a href={MAILTO_URL} className="btn btn-paper mt-5 w-full">
                  Escribir un email
                </a>
                <p className="mt-3 break-all text-center text-[14px] text-paper/70">{EMPRESA.email}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
