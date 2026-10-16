import Link from "next/link";
import Meta from "../../components/Meta";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";
import PreferenciasRef from "../../components/PreferenciasRef";
import { Contacto } from "../../components/LegalBits";

// Si cambias lo que se guarda en el navegador (lib/auth.js, lib/ref.js), actualiza esta tabla.
const FILAS = [
  {
    nombre: "rv_session",
    tipo: "Cookie propia",
    para: "Mantener tu sesión abierta cuando inicias sesión en tu cuenta.",
    dura: "Hasta 30 días",
    permiso: "No hace falta: es imprescindible para que funcione tu cuenta.",
  },
  {
    nombre: "rv_ref",
    tipo: "Almacenamiento local del navegador",
    para: "Recordar el código de quien te invitó, para que reciba su comisión si compras más adelante.",
    dura: "30 días",
    permiso: "Sí. Solo se guarda si lo aceptas en el aviso que te mostramos.",
  },
  {
    nombre: "rv_ref_ok",
    tipo: "Almacenamiento local del navegador",
    para: "Recordar si has aceptado o rechazado lo anterior, para no volver a preguntarte.",
    dura: "12 meses",
    permiso: "No hace falta: solo guarda tu elección.",
  },
];

export default function Cookies() {
  return (
    <>
      <Meta title="Política de cookies | Lamine Resell" path="/legal/cookies" />
      <Nav />
      <LegalLayout title="Política de cookies">
        <h2>1. Qué son</h2>
        <p>
          Las cookies y tecnologías parecidas (como el almacenamiento local) son pequeños datos que una web guarda en
          tu navegador. Algunos son imprescindibles para que el sitio funcione; otros necesitan que tú lo permitas.
        </p>
        <p>
          Este sitio <strong>no usa cookies publicitarias ni de análisis o estadísticas</strong>, y no hay herramientas
          de seguimiento de terceros. Las tipografías se sirven desde nuestro propio dominio.
        </p>

        <h2>2. Qué guardamos en tu navegador</h2>
        <div className="mt-4 space-y-4">
          {FILAS.map((f) => (
            <div key={f.nombre} className="border-[3px] border-ink p-5">
              <p className="cond-mid text-[28px]">{f.nombre}</p>
              <dl className="mt-3 space-y-2 text-[16px]">
                <div>
                  <dt className="inline font-semibold text-ink">Tipo: </dt>
                  <dd className="inline">{f.tipo}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">Para qué: </dt>
                  <dd className="inline">{f.para}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">Cuánto dura: </dt>
                  <dd className="inline">{f.dura}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">¿Necesita tu permiso? </dt>
                  <dd className="inline">{f.permiso}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <p>
          Solo las personas que gestionan la tienda usan además una cookie de sesión propia para entrar al panel de
          administración.
        </p>

        <h2>3. El código de invitación</h2>
        <p>
          Si llegas al sitio con el enlace de otra persona, usamos su código mientras tengas la página abierta para
          que reciba su comisión. Solo lo guardamos en tu navegador si nos das permiso, y por un máximo de 30 días.
          Si dices que no, no se guarda nada y el código se pierde al recargar o cerrar la página.
        </p>
        <p>
          Cuando te registras con un enlace de invitación, quedan vinculados tu cuenta y quien te invitó; eso se
          explica en la <Link href="/legal/privacidad">política de privacidad</Link>.
        </p>
        <PreferenciasRef />

        <h2>4. Pagos con Stripe</h2>
        <p>
          Cuando pagas, te llevamos a la página de pago de Stripe. Esa página no es nuestra: Stripe puede usar sus
          propias cookies, por ejemplo para seguridad y prevención del fraude. Puedes consultarlas en la información
          de privacidad de Stripe (
          <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer">stripe.com/es/privacy</a>
          ).
        </p>

        <h2>5. Cómo borrarlas o bloquearlas</h2>
        <p>
          Puedes borrar o bloquear las cookies y el almacenamiento local desde los ajustes de tu navegador. Si
          bloqueas la cookie de sesión no podrás iniciar sesión en tu cuenta, pero sí comprar sin cuenta.
        </p>

        <h2>6. Dudas</h2>
        <p>
          Si tienes alguna pregunta, escríbenos <Contacto />.
        </p>
      </LegalLayout>
    </>
  );
}
