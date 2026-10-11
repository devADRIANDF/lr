import Head from "next/head";

// Título, descripción y vista previa al compartir el enlace (Telegram, WhatsApp, etc.)
export default function Meta({ title, description, path = "" }) {
  const base = process.env.SITE_URL || "";
  const desc = description || "Cuentas con 5, 10, 15 o 20 valoraciones. Sin crear cuenta: eliges, pagas con tarjeta y recibes el acceso por email.";
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Lamine Resell" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={`${base}/og.png`} />
      {base && <meta property="og:url" content={`${base}${path}`} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
