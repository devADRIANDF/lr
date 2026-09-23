import Head from "next/head";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";

export default function PedidoConfirmado() {
  const router = useRouter();

  return (
    <>
      <Head><title>Pedido confirmado — Lamine Resell</title></Head>
      <Nav />
      <main className="min-h-screen bg-page pb-28 md:pb-10">
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-neutral-100 text-ink">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-5 font-display text-2xl font-700 text-ink">Pago confirmado</h1>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            Hemos recibido tu pago. En cuanto se procese te llegará un email
            con los detalles de tu pedido.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-8 rounded-none bg-ink px-6 py-3 text-sm font-600 text-white transition hover:bg-neutral-800"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    </>
  );
}
