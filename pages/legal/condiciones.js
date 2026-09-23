import Head from "next/head";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";

export default function Condiciones() {
  return (
    <>
      <Head><title>Condiciones de venta — Lamine Resell</title></Head>
      <Nav />
      <LegalLayout title="Condiciones de venta">
        
        <h2>1. Objeto</h2>
        <p>
          Estas condiciones regulan la compra de cuentas con reviews y de
          paquetes de reviews aplicados a cuentas propias, a través de
          <strong> laminerresell.com</strong>, operado por{" "}
          <strong>[NOMBRE O RAZÓN SOCIAL DE LAMINE RESELL]</strong>.
        </p>

        <h2>2. Precio y pago</h2>
        <p>
          Los precios se muestran en euros. El pago se procesa a través de
          Stripe mediante tarjeta. El pedido se confirma únicamente cuando
          Stripe certifica que el pago se ha completado correctamente.
        </p>

        <h2>3. Plazos de entrega</h2>
        <ul>
          <li>Cuentas ya montadas: se preparan bajo pedido, con un plazo de entrega de hasta 4 semanas</li>
          <li>Reviews sobre tu propia cuenta: recibirás instrucciones por email, normalmente en menos de 24 horas</li>
          <li>Suscripciones: la primera entrega sigue los plazos anteriores; las renovaciones mensuales se gestionan a lo largo de cada mes</li>
        </ul>

        <h2>4. Naturaleza del contenido</h2>
        <p>
          El producto vendido es contenido digital no suministrado en un
          soporte material.
        </p>

        <h2>5. Derecho de desistimiento</h2>
        <p>
          De acuerdo con el artículo 103.m del Real Decreto Legislativo
          1/2007, el derecho de desistimiento de 14 días no aplica a
          contenido digital cuya ejecución haya comenzado con tu
          consentimiento expreso previo, aceptando que pierdes tu derecho de
          desistimiento una vez iniciada la entrega.
        </p>
        <p className="rounded-none bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Pendiente técnico: para que esta cláusula sea válida de verdad,
          el checkout debe pedir que el comprador marque expresamente esta
          casilla antes de pagar. Ahora mismo el formulario no la tiene —
          hay que añadirla antes de confiar en esta cláusula.
        </p>

        <h2>6. Suscripciones y cancelación</h2>
        <p>
          Las suscripciones mensuales se renuevan automáticamente hasta que
          el cliente solicite su cancelación, que puede pedir en cualquier
          momento contactando por Telegram o email. La cancelación surte
          efecto a partir del siguiente ciclo de facturación.
        </p>

        <h2>7. Reclamaciones</h2>
        <p>
          Para cualquier incidencia con tu pedido, contacta por Telegram a{" "}
          <strong>t.me/LAMINE_RESELL</strong>. Como consumidor,
          también dispones de las hojas de reclamaciones oficiales y de la
          plataforma europea de resolución de litigios en línea
          (ec.europa.eu/consumers/odr).
        </p>

        <h2>8. Legislación aplicable</h2>
        <p>
          Estas condiciones se rigen por la legislación española, en
          particular el Real Decreto Legislativo 1/2007 de defensa de
          consumidores y usuarios.
        </p>
      </LegalLayout>
    </>
  );
}
