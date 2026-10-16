/** @type {import('next').NextConfig} */

// URL pública del sitio, para las vistas previas de los enlaces (WhatsApp, redes sociales...) y para el
// dominio que aparece en los textos legales. Se toma de NEXT_PUBLIC_SITE_URL si existe; si no, del
// dominio de producción que da Vercel. Vale con o sin "https://" delante.
const crudo = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "";
const SITE_URL = crudo ? (/^https?:\/\//i.test(crudo) ? crudo : `https://${crudo}`).replace(/\/+$/, "") : "";

module.exports = {
  reactStrictMode: true,
  env: { SITE_URL },
};
