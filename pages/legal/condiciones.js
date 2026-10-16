import Link from "next/link";
import Meta from "../../components/Meta";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";
import { Contacto } from "../../components/LegalBits";
import { dominioDelSitio } from "../../lib/sitio";
import { EMPRESA } from "../../lib/empresa";
import { PLAZO_ENTREGA } from "../../lib/catalogo";

export default function Condiciones() {
  return (
    <>
      <Meta title="Condiciones de venta | Lamine Resell" path="/legal/condiciones" />
      <Nav />
      <LegalLayout title="Condiciones de venta">
        <h2>1. Quiénes somos y objeto</h2>
        <p>
          Estas condiciones regulan la compra de cuentas con valoraciones en <strong>{dominioDelSitio()}</strong>,
          sitio que opera <strong>{EMPRESA.nombre}</strong> con la marca {EMPRESA.marca}. Los datos completos de la
          empresa están en el <Link href="/legal/aviso-legal">aviso legal</Link>. Al hacer un pedido aceptas estas
          condiciones.
        </p>

        <h2>2. Precio y pago</h2>
        <p>
          Los precios se muestran en euros y son el importe final que pagas: no se cobra IVA. El pago se hace con
          tarjeta a través de Stripe o, si tienes cuenta, con el saldo de tu monedero en los pedidos de pago único.
          El pedido queda confirmado cuando Stripe certifica que el pago se ha completado (o, si pagas con el
          monedero, cuando se descuenta el saldo).
        </p>

        <h2>3. Entrega</h2>
        <ul>
          <li>
            La entrega es manual: te enviamos los datos de acceso por email a la dirección que indicas al comprar.
            Comprueba que está bien escrita y mira también la carpeta de spam.
          </li>
          <li>
            Plazo máximo de entrega: <strong>{PLAZO_ENTREGA}</strong> desde que se confirma el pago. Las cuentas se
            preparan bajo pedido.
          </li>
          <li>
            Suscripciones: la primera entrega sigue ese mismo plazo; después, las valoraciones de cada mes se
            entregan a lo largo del mes.
          </li>
        </ul>

        <h2>4. Reembolsos</h2>
        <p>
          Si tu pedido no llega dentro del plazo máximo de {PLAZO_ENTREGA}, te devolvemos todo lo que pagaste por él.
          Escríbenos <Contacto /> y hacemos el reembolso al mismo método de pago, como máximo en 14 días naturales
          desde que lo pides; lo que tarde después tu banco en mostrarlo no depende de nosotros. Si pagaste con el
          monedero, el importe vuelve a tu saldo.
        </p>
        <p>
          Una vez entregado el pedido no hacemos reembolsos por cambio de opinión (mira el apartado siguiente). Esto
          no afecta a los derechos que la ley te reconoce si lo entregado no se corresponde con lo que compraste: en
          ese caso, escríbenos y lo revisamos.
        </p>
        <p>En las suscripciones, esta regla se aplica a cada mes.</p>

        <h2>5. Contenido digital y desistimiento</h2>
        <p>
          Lo que vendemos es contenido digital que no se entrega en un soporte material. De acuerdo con el artículo
          103.m del Real Decreto Legislativo 1/2007, el derecho de desistimiento de 14 días no se aplica a este tipo
          de contenido cuando su entrega ha comenzado con tu consentimiento expreso previo y con tu reconocimiento de
          que pierdes ese derecho una vez iniciada.
        </p>
        <p>
          Por eso, antes de pagar te pedimos que marques la casilla en la que aceptas estas condiciones, consientes
          que la entrega comience y reconoces que pierdes el derecho de desistimiento una vez iniciada. Sin ese
          consentimiento no podemos tramitar el pedido.
        </p>

        <h2>6. Suscripciones y cancelación</h2>
        <p>
          Las suscripciones mensuales se renuevan automáticamente cada mes, con cargo a la tarjeta que indicaste,
          hasta que las canceles. Puedes pedir la cancelación en cualquier momento escribiéndonos <Contacto />. Surte
          efecto a partir del siguiente ciclo de facturación: desde entonces no se te cobra más.
        </p>

        <h2>7. Monedero y programa de referidos</h2>
        <p>
          Con una cuenta gratuita tienes un monedero: puedes recargarlo con tarjeta o con las comisiones que ganes y
          gastarlo en pedidos de pago único. Las comisiones por invitar a otras personas y cómo retirar el saldo están
          en las <Link href="/legal/referidos">bases del programa de referidos</Link>.
        </p>

        <h2>8. Incidencias y reclamaciones</h2>
        <p>
          Para cualquier problema con tu pedido, escríbenos <Contacto />. Si no estás conforme con nuestra respuesta,
          como consumidor puedes acudir a los organismos de consumo de tu comunidad autónoma.
        </p>

        <h2>9. Legislación aplicable</h2>
        <p>
          Al estar este sitio dirigido a consumidores de España, la compra se rige por la normativa española de
          protección de consumidores y usuarios (Real Decreto Legislativo 1/2007) en todo aquello que la ley reconoce
          al consumidor con carácter obligatorio, con independencia de dónde esté registrada la sociedad que vende.
        </p>

        <h2>10. Cambios en estas condiciones</h2>
        <p>
          Podemos actualizar estas condiciones. A tu pedido se le aplican las que estaban publicadas el día en que lo
          hiciste.
        </p>
      </LegalLayout>
    </>
  );
}
