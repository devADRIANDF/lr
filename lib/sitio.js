// Dominio público del sitio para los textos legales. Sale de la URL de producción que da Vercel
// (o de NEXT_PUBLIC_SITE_URL); si todavía no hay ninguna, deja un marcador visible para rellenar.
export function dominioDelSitio() {
  const u = process.env.SITE_URL;
  if (!u) return "[DOMINIO DE LA WEB]";
  try {
    return new URL(u).host;
  } catch {
    return "[DOMINIO DE LA WEB]";
  }
}
