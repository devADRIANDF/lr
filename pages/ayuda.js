import Nav from "../components/Nav";
import Meta from "../components/Meta";
import Faq from "../components/Faq";
import { PREGUNTAS } from "../lib/faq";
import { EMPRESA, MAILTO_URL } from "../lib/empresa";

export default function Ayuda() {
  return (
    <>
      <Meta title="Preguntas frecuentes | Lamine Resell" path="/ayuda" />
      <Nav />
      <main>
        <div className="wrap py-14 md:py-20">
          <h1 className="cond max-w-[9ch] text-balance text-[length:clamp(4.25rem,9.4vw,9rem)]">Preguntas frecuentes</h1>

          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-8">
              <Faq items={PREGUNTAS} />
            </div>

            <aside className="md:col-span-4">
              <div className="bg-ink p-7 text-paper md:sticky md:top-24 md:p-8">
                <p className="cond text-[44px] md:text-[52px]">¿Tu duda no está aquí?</p>
                <p className="mt-4 text-[17px] leading-snug text-paper/80">
                  Escríbenos por email y te ayudamos con tu pedido.
                </p>
                <a href={MAILTO_URL} className="btn btn-paper mt-7 w-full">
                  Escribir un email
                </a>
                <p className="mt-3 break-all text-center text-[15px] text-paper/70">{EMPRESA.email}</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
