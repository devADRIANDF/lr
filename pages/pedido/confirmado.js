import Link from "next/link";
import Nav from "../../components/Nav";
import Meta from "../../components/Meta";
import Tally from "../../components/Tally";

export default function PedidoConfirmado() {
  return (
    <>
      <Meta title="Pedido confirmado | Lamine Resell" path="/pedido/confirmado" />
      <Nav />
      <main>
        <div className="wrap py-14 md:py-24">
          <Tally count={5} capacity={0} perRow={1} ghost={false} className="block h-[120px] w-auto md:h-[190px]" label="Pago confirmado" />
          <h1 className="cond mt-10 text-[length:min(4.25rem,calc((100vw_-_2.5rem)/4.3))] md:text-[length:clamp(4.25rem,10vw,9rem)]">Pago confirmado.</h1>
          <p className="mt-6 max-w-md text-[19px] leading-snug text-ink/80">
            Hemos recibido tu pago. En cuanto se procese te llegará un email con los detalles de tu pedido.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="btn btn-ink">Volver al inicio</Link>
            <Link href="/panel" className="btn btn-line">Ver mis pedidos</Link>
          </div>
        </div>
      </main>
    </>
  );
}
