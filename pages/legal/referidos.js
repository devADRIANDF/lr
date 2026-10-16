import Link from "next/link";
import Meta from "../../components/Meta";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";
import { Contacto } from "../../components/LegalBits";
import { EMPRESA } from "../../lib/empresa";
import { COMISION_POR_DEFECTO } from "../../lib/catalogo";

export default function Referidos() {
  return (
    <>
      <Meta title="Programa de referidos | Lamine Resell" path="/legal/referidos" />
      <Nav />
      <LegalLayout title="Programa de referidos">
        <h2>1. En qué consiste</h2>
        <p>
          Si creas una cuenta gratuita, tienes un enlace y un código personales. Cuando alguien compra a través de tu
          enlace, ganas una comisión que se suma al saldo de tu monedero. Estas son las bases del programa, que
          organiza {EMPRESA.nombre}.
        </p>

        <h2>2. Cuánto se gana</h2>
        <ul>
          <li>
            La comisión por defecto es del <strong>{COMISION_POR_DEFECTO}%</strong> del importe que paga la persona
            invitada en cada pedido. Podemos acordar un porcentaje distinto con algunos usuarios; el tuyo aparece en
            tu panel.
          </li>
          <li>
            En las suscripciones, la comisión se aplica a la cuota de alta y a cada mensualidad cobrada mientras la
            suscripción siga activa.
          </li>
          <li>Las recargas del monedero no generan comisión.</li>
          <li>La comisión se calcula sobre lo que se paga de verdad: no sobre descuentos ni importes reembolsados.</li>
        </ul>

        <h2>3. Qué compras cuentan</h2>
        <ul>
          <li>
            Las que se hacen entrando con tu enlace o tu código, tenga o no cuenta quien compra. Si la persona nos
            da permiso, recordamos tu código en su navegador durante 30 días (mira la{" "}
            <Link href="/legal/cookies">política de cookies</Link>).
          </li>
          <li>
            Todas las de quien se registra con tu enlace: esa cuenta queda vinculada a ti y cada compra que haga
            desde su cuenta te da comisión.
          </li>
          <li>No cuentan las compras que haces tú mismo ni las de cuentas creadas solo para generar comisiones.</li>
        </ul>

        <h2>4. Tu saldo</h2>
        <p>
          Las comisiones se acreditan en tu monedero en cuanto se confirma el pago del pedido. El saldo se queda en tu
          monedero; no se envía solo a ninguna parte. Puedes usarlo para pagar pedidos de pago único en la web o
          pedirnos que te lo paguemos.
        </p>
        <p>
          Para retirar tu saldo, escríbenos <Contacto />. Lo tramitamos manualmente y te indicamos cómo recibirlo.
        </p>

        <h2>5. Reglas</h2>
        <ul>
          <li>No se permiten los autorreferidos: comprar con tu propio enlace o con cuentas que controlas.</li>
          <li>No se permite el spam ni decir cosas falsas o engañosas sobre la tienda para conseguir compras.</li>
          <li>
            Si un pedido se reembolsa o se cancela, la comisión que generó se descuenta de tu saldo.
          </li>
          <li>
            Si detectamos fraude o un uso contrario a estas bases, podemos anular las comisiones afectadas y cerrar la
            cuenta.
          </li>
        </ul>

        <h2>6. Impuestos</h2>
        <p>
          Eres responsable de declarar y pagar los impuestos que correspondan por las comisiones que recibas.
        </p>

        <h2>7. Datos personales</h2>
        <p>
          En tu panel solo aparece una versión parcial del email de quien compra con tu enlace (por ejemplo,
          «ju***@g***.com»), la fecha y tu comisión; y quien compra no ve tus datos. Cómo tratamos los datos de todos
          está en la <Link href="/legal/privacidad">política de privacidad</Link>.
        </p>

        <h2>8. Cambios en el programa</h2>
        <p>
          Podemos modificar o terminar el programa avisando en esta página. Los cambios no afectan a las comisiones
          que ya estén acreditadas en tu monedero.
        </p>
      </LegalLayout>
    </>
  );
}
