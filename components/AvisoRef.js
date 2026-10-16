import Link from "next/link";
import { useEffect, useState } from "react";
import { elegir, hayQuePreguntar, suscribir } from "../lib/ref";

// Aviso que sale solo a quien llega con el enlace de invitación de alguien (?ref=...) y aún no ha elegido.
// Las dos respuestas pesan lo mismo. Mientras no se elige, el código solo vive en memoria.
export default function AvisoRef() {
  const [ver, setVer] = useState(false);

  useEffect(() => {
    const actualizar = () => setVer(hayQuePreguntar());
    actualizar();
    return suscribir(actualizar);
  }, []);

  if (!ver) return null;

  return (
    <aside
      role="region"
      aria-label="Código de invitación"
      className="fixed inset-x-0 bottom-0 z-[60] border-t-[3px] border-paper bg-ink text-paper"
    >
      <div className="wrap flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:gap-10 md:py-5">
        <div className="md:max-w-3xl">
          <p className="cond-mid text-[22px] md:text-[26px]">Has llegado con una invitación</p>
          <p className="mt-1 text-[14px] leading-snug text-paper/80 md:text-[15px]">
            ¿Guardamos el código de quien te invitó durante 30 días en este navegador, por si compras más adelante? Así
            recibe su comisión. Si dices que no, solo se usa mientras tengas la página abierta.{" "}
            <Link href="/legal/cookies" className="underline underline-offset-2">
              Más información
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:w-[380px] md:shrink-0 md:gap-3">
          <button type="button" onClick={() => elegir("si")} className="btn btn-paper !h-11 !px-3 !text-[20px] md:!h-12">
            Sí, guardarlo
          </button>
          <button type="button" onClick={() => elegir("no")} className="btn btn-paper !h-11 !px-3 !text-[20px] md:!h-12">
            No, gracias
          </button>
        </div>
      </div>
    </aside>
  );
}
