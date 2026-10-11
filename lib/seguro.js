// Envuelve un handler de API: si algo falla (Stripe caído, clave mal puesta, base de datos...)
// responde JSON en vez de una página de error, y deja el error real en los logs de Vercel.
export function seguro(nombre, fn, mensaje) {
  return async function handler(req, res) {
    try {
      return await fn(req, res);
    } catch (e) {
      console.error(`[${nombre}]`, e && e.message ? e.message : e);
      if (!res.headersSent) {
        res.status(502).json({
          error: mensaje || "No se pudo completar la operación. Inténtalo de nuevo o escríbenos por Telegram.",
        });
      }
    }
  };
}
