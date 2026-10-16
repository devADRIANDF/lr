import Link from "next/link";
import Meta from "../../components/Meta";
import Nav from "../../components/Nav";
import LegalLayout from "../../components/LegalLayout";
import { Contacto, DatosEmpresa } from "../../components/LegalBits";
import { dominioDelSitio } from "../../lib/sitio";
import { EMPRESA } from "../../lib/empresa";

export default function AvisoLegal() {
  const dominio = dominioDelSitio();
  return (
    <>
      <Meta title="Aviso legal | Lamine Resell" path="/legal/aviso-legal" />
      <Nav />
      <LegalLayout title="Aviso legal">
        <h2>1. Quién es el titular</h2>
        <p>
          Este sitio web ({dominio}) pertenece a <strong>{EMPRESA.nombre}</strong>. Estos son los datos de
          identificación que exige la normativa de comercio electrónico (en España, el artículo 10 de la Ley 34/2002,
          LSSI-CE):
        </p>
        <DatosEmpresa
          extra={[
            <>
              Sitio web: <strong>{dominio}</strong>
            </>,
          ]}
        />

        <h2>2. Objeto</h2>
        <p>
          {EMPRESA.marca} es la marca con la que {EMPRESA.nombre} vende cuentas con valoraciones a través de este
          sitio web. Las condiciones de la compra están en las{" "}
          <Link href="/legal/condiciones">condiciones de venta</Link>.
        </p>

        <h2>3. Acceso y uso del sitio</h2>
        <p>
          Acceder al sitio es gratuito (salvo lo que te cueste tu conexión a internet). Al usarlo aceptas este aviso
          legal, la <Link href="/legal/privacidad">política de privacidad</Link> y la{" "}
          <Link href="/legal/cookies">política de cookies</Link>; si compras, también las condiciones de venta.
        </p>
        <p>
          Te comprometes a usar el sitio de forma lícita: no intentar entrar en zonas restringidas, no alterar su
          funcionamiento y no usar datos o cuentas de otras personas.
        </p>

        <h2>4. Propiedad intelectual e industrial</h2>
        <p>
          Los textos, el diseño, el logotipo y el resto de contenidos de este sitio pertenecen a {EMPRESA.nombre} o a
          quien nos ha autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial.
          No puedes copiarlos, distribuirlos ni transformarlos sin nuestro permiso por escrito.
        </p>

        <h2>5. Responsabilidad</h2>
        <p>
          Hacemos lo posible para que el sitio funcione sin interrupciones y con información correcta, pero no
          podemos garantizar que no haya errores, cortes o fallos técnicos. No respondemos de los daños derivados de
          un uso indebido del sitio ni de causas ajenas a nosotros, como la caída de servicios de terceros. Esto no
          limita los derechos que la ley reconoce a los consumidores.
        </p>
        <p>
          El sitio puede enlazar a páginas de terceros (por ejemplo, Stripe). No controlamos sus
          contenidos ni respondemos de ellos.
        </p>

        <h2>6. Legislación y reclamaciones</h2>
        <p>
          Este sitio está dirigido a consumidores de España. Por eso se les aplica en todo caso la normativa española
          de protección de consumidores y usuarios y los derechos que esta les reconoce con carácter imperativo, con
          independencia de dónde esté registrada la sociedad titular.
        </p>
        <p>
          Si tienes algún problema, escríbenos primero <Contacto />. Si no lo resolvemos, puedes acudir a los
          organismos de consumo de tu comunidad autónoma y a los tribunales que te correspondan conforme a la ley.
        </p>
      </LegalLayout>
    </>
  );
}
