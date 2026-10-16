import { useEffect, useState } from "react";
import { elegir, estado, olvidar, suscribir } from "../lib/ref";

// Bloque de la página de cookies para ver y cambiar lo que se guarda del código de referido.
export default function PreferenciasRef() {
  const [e, setE] = useState(null);

  useEffect(() => {
    const actualizar = () => setE(estado());
    actualizar();
    return suscribir(actualizar);
  }, []);

  if (!e) return null;

  return (
    <div className="mt-6 border-[3px] border-ink p-5">
      <p className="text-[17px] font-semibold text-ink">Tu elección sobre el código de referido</p>
      <p className="mt-2 text-[16px]">
        {e.guardado
          ? "Ahora mismo hay un código de invitación guardado en este navegador."
          : e.eleccion === "no"
          ? "Has elegido que no se guarde nada. No hay ningún código guardado en este navegador."
          : e.eleccion === "si"
          ? "Has permitido guardar el código, pero ahora no hay ninguno guardado."
          : "No hay nada guardado en este navegador. Si llegas con el enlace de alguien, te preguntaremos."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {(e.guardado || e.eleccion === "si") && (
          <button type="button" onClick={olvidar} className="btn btn-line !h-12 !text-[20px]">
            Borrarlo y no guardar más
          </button>
        )}
        {e.eleccion === "no" && (
          <button type="button" onClick={() => elegir("si")} className="btn btn-line !h-12 !text-[20px]">
            Permitir que se guarde
          </button>
        )}
      </div>
    </div>
  );
}
