import Head from "next/head";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";

export default function Privacidad() {
  return (
    <>
      <Head><title>Política de privacidad — Lamine Resell</title></Head>
      <Nav />
      <LegalLayout title="Política de privacidad">
   

        <h2>1. Responsable del tratamiento</h2>
        <ul>
          <li>Responsable: <strong>[NOMBRE O RAZÓN SOCIAL DE LAMINE RESELL]</strong></li>
          <li>NIF/CIF: <strong>[CIF O NIF]</strong></li>
          <li>Contacto (Telegram): <strong>t.me/LAMINE_RESELL</strong></li>
        </ul>

        <h2>2. Datos que recogemos</h2>
        <p>Dependiendo de cómo uses el sitio, podemos tratar:</p>
        <ul>
          <li>Email, para gestionar tu pedido y contactarte</li>
          <li>ID de tu cuenta en el juego, si compras el producto de reviews a tu propio ID</li>
          <li>Si creas una cuenta: email y contraseña (cifrada)</li>
          <li>Datos de pago: los procesa directamente Stripe, nosotros nunca almacenamos el número de tu tarjeta</li>
        </ul>

        <h2>3. Finalidad</h2>
        <p>
          Usamos tus datos para gestionar tu pedido, comunicarnos contigo
          sobre su estado, y —si nos das tu consentimiento— para gestionar
          el programa de afiliados.
        </p>

        <h2>4. Base legal</h2>
        <p>
          Ejecución del contrato de compraventa (art. 6.1.b RGPD) y, en su
          caso, tu consentimiento expreso.
        </p>

        <h2>5. Conservación</h2>
        <p>
          Conservamos tus datos mientras exista una relación contractual
          contigo y, después, durante los plazos legalmente exigidos
          (por ejemplo, obligaciones fiscales).
        </p>

        <h2>6. Destinatarios</h2>
        <p>
          Compartimos datos de pago con Stripe (encargado del tratamiento
          para el procesamiento de pagos), que puede transferir datos fuera
          del Espacio Económico Europeo con garantías adecuadas conforme al
          RGPD. No vendemos ni cedemos tus datos a terceros con fines
          publicitarios.
        </p>

        <h2>7. Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión,
          oposición, limitación y portabilidad escribiéndonos por Telegram a{" "}
          <strong>t.me/LAMINE_RESELL</strong>. También puedes reclamar ante la
          Agencia Española de Protección de Datos (aepd.es).
        </p>

        <h2>8. Cookies</h2>
        <p>
          Este sitio usa una cookie técnica para recordar el código de
          referido de quien te invitó, necesaria para el funcionamiento del
          programa de afiliados.
        </p>
      </LegalLayout>
    </>
  );
}
