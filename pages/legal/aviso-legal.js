import Head from "next/head";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";

export default function AvisoLegal() {
  return (
    <>
      <Head><title>Aviso legal — Lamine Resell</title></Head>
      <Nav />
      <LegalLayout title="Aviso legal">
      

        <h2>1. Datos del titular</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de
          la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se
          informa de los siguientes datos:
        </p>
        <ul>
          <li>Titular: <strong>[NOMBRE O RAZÓN SOCIAL DE LAMINE RESELL]</strong></li>
          <li>CIF: <strong>[CIF O NIF]</strong></li>
          <li>Domicilio: <strong>[DIRECCIÓN FISCAL]</strong></li>
          <li>Contacto (Telegram): <strong>t.me/LAMINE_RESELL</strong></li>
          <li>Sitio web: <strong>laminerresell.com</strong></li>
        </ul>

        <h2>2. Objeto</h2>
        <p>
          Lamine Resell es una plataforma de venta de cuentas con reviews y de
          adición de reviews a cuentas propias, operada por el titular
          indicado en el punto anterior.
        </p>

        <h2>3. Condiciones de acceso y uso</h2>
        <p>
          El acceso a este sitio web es gratuito. El uso del sitio atribuye
          la condición de usuario e implica la aceptación de este aviso
          legal, la política de privacidad y las condiciones de venta.
        </p>

        <h2>4. Propiedad intelectual e industrial</h2>
        <p>
          Los contenidos de este sitio web (textos, diseño, logotipos) son
          titularidad de <strong>[NOMBRE O RAZÓN SOCIAL DE LAMINE RESELL]</strong> o de
          terceros que han autorizado su uso, y están protegidos por la
          normativa de propiedad intelectual e industrial.
        </p>

        <h2>5. Responsabilidad</h2>
        <p>
          El titular no se hace responsable de los daños derivados de un uso
          inadecuado del sitio web, ni de interrupciones, errores o fallos
          técnicos que puedan producirse durante su funcionamiento.
        </p>

        <h2>6. Legislación aplicable</h2>
        <p>
          Este aviso legal se rige por la legislación española. Para
          cualquier controversia, las partes se someten a los juzgados y
          tribunales que correspondan según la normativa de protección de
          consumidores y usuarios aplicable.
        </p>
      </LegalLayout>
    </>
  );
}
