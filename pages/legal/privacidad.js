import Link from "next/link";
import Meta from "../../components/Meta";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";
import { Contacto, DatosEmpresa } from "../../components/LegalBits";

export default function Privacidad() {
  return (
    <>
      <Meta title="Política de privacidad | Lamine Resell" path="/legal/privacidad" />
      <Nav />
      <LegalLayout title="Política de privacidad">
        <h2>1. Quién es el responsable</h2>
        <p>El responsable del tratamiento de tus datos personales es:</p>
        <DatosEmpresa />
        <p>
          Para cualquier asunto de privacidad, escríbenos <Contacto />.
        </p>

        <h2>2. Qué datos tratamos</h2>
        <p>Según cómo uses el sitio:</p>
        <ul>
          <li>Si compras: tu email, lo que has comprado, el importe y el estado del pedido.</li>
          <li>
            Si creas una cuenta: tu email, tu contraseña (la guardamos cifrada, nunca en claro), el saldo de tu
            monedero, tu historial de pedidos y, si te registraste con el enlace de alguien, quién te invitó.
          </li>
          <li>Si invitas a otras personas: las comisiones que generas.</li>
          <li>
            Pagos: los datos de tu tarjeta los trata Stripe directamente. Nosotros no vemos ni guardamos el número de
            tu tarjeta; solo recibimos la confirmación del pago.
          </li>
          <li>Si nos escribes: tu email y lo que nos cuentes en el mensaje.</li>
          <li>
            Datos técnicos: al visitar el sitio, nuestro proveedor de alojamiento registra datos de conexión (como la
            dirección IP, el navegador y la hora) por motivos de seguridad y de funcionamiento.
          </li>
        </ul>

        <h2>3. Para qué los usamos y con qué base legal</h2>
        <ul>
          <li>
            Gestionar y entregar tu pedido y atender cualquier incidencia: ejecución del contrato (art. 6.1.b RGPD).
          </li>
          <li>Crear y mantener tu cuenta y tu monedero: ejecución del contrato (art. 6.1.b).</li>
          <li>
            Calcular y registrar las comisiones del programa de referidos: ejecución del contrato con quien se
            registra e interés legítimo en atribuir la comisión a quien invitó (art. 6.1.f).
          </li>
          <li>Cumplir obligaciones legales, como las fiscales y contables: obligación legal (art. 6.1.c).</li>
          <li>Mantener la seguridad del sitio y prevenir el fraude: interés legítimo (art. 6.1.f).</li>
          <li>
            Guardar en tu navegador el código de quien te invitó: tu consentimiento (art. 6.1.a), que puedes retirar
            cuando quieras.
          </li>
        </ul>
        <p>
          No tomamos decisiones automatizadas ni hacemos perfiles sobre ti, y no usamos tu email para enviarte
          publicidad.
        </p>

        <h2>4. Cuánto tiempo los conservamos</h2>
        <ul>
          <li>Pedidos y pagos: el tiempo que exijan las obligaciones fiscales y contables.</li>
          <li>Cuenta y monedero: hasta que pidas borrarlos, salvo lo que la ley nos obligue a conservar.</li>
          <li>Mensajes de atención al cliente: el tiempo necesario para resolver tu consulta y atender posibles reclamaciones.</li>
          <li>Código de invitación guardado en tu navegador: 30 días como máximo.</li>
        </ul>

        <h2>5. Quién más puede ver tus datos</h2>
        <p>
          No vendemos tus datos ni los cedemos con fines publicitarios. Para prestar el servicio usamos estos
          proveedores, que tratan datos por nuestra cuenta:
        </p>
        <ul>
          <li>Stripe, para procesar los pagos.</li>
          <li>Supabase, donde se guardan las cuentas y los pedidos (base de datos).</li>
          <li>Vercel, que aloja el sitio web.</li>
          <li>Gmail (de Google), para enviarte el pedido y atender tus consultas por email.</li>
        </ul>
        <p>
          También podemos comunicar datos a las administraciones y autoridades cuando la ley lo exija.
        </p>
        <p>
          Quien te invita no ve tus datos personales: en su panel solo aparece una versión parcial de tu email (por
          ejemplo, «ju***@g***.com»), la fecha y su comisión.
        </p>

        <h2>6. Transferencias fuera del Espacio Económico Europeo</h2>
        <p>
          Algunos de estos proveedores tratan datos fuera del Espacio Económico Europeo (por ejemplo, en Estados
          Unidos). Cuando ocurre, lo hacen con las garantías que prevé el RGPD, como las cláusulas contractuales tipo
          de la Comisión Europea o decisiones de adecuación como el Marco de Privacidad de Datos UE-EE. UU.
        </p>

        <h2>7. Tus derechos</h2>
        <p>
          Puedes pedirnos acceder a tus datos, rectificarlos, borrarlos, limitar su tratamiento, oponerte a él,
          recibirlos en un formato portable y retirar tu consentimiento cuando lo hayas dado. Escríbenos <Contacto />{" "}
          indicando el email de tu cuenta o de tu pedido; te respondemos en un mes como máximo.
        </p>
        <p>
          Si crees que no tratamos bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>) o ante la autoridad de
          protección de datos de tu país.
        </p>

        <h2>8. Seguridad</h2>
        <p>
          Las contraseñas se guardan cifradas, el sitio usa conexión segura (HTTPS) y solo accede a los datos quien
          los necesita para gestionar los pedidos.
        </p>

        <h2>9. Cookies y almacenamiento en tu navegador</h2>
        <p>
          Qué guardamos en tu dispositivo y para qué lo explicamos en la{" "}
          <Link href="/legal/cookies">política de cookies</Link>.
        </p>
      </LegalLayout>
    </>
  );
}
