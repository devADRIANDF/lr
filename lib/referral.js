import { dbGet } from "./db";
import { getUserIdFromReq } from "./auth";

// Decide qué código de afiliado aplicar a una compra:
// 1) Si el comprador tiene sesión iniciada y su cuenta ya quedó vinculada
//    a un referidor en el momento de registrarse, usamos ESE (es la fuente
//    de verdad, no depende de si el navegador aún recuerda el ?ref= del
//    enlace que abrió hace días).
// 2) Si no está logueado, usamos el ref que venga del formulario (capturado
//    de la URL o del localStorage en el navegador).
export async function resolveRefCode(req, refFromBody) {
  const uid = getUserIdFromReq(req);
  if (uid) {
    const user = await dbGet("SELECT referred_by FROM users WHERE id = ?", [uid]);
    if (user?.referred_by) {
      const referrer = await dbGet("SELECT referral_code FROM users WHERE id = ?", [user.referred_by]);
      if (referrer?.referral_code) return referrer.referral_code;
    }
  }
  return refFromBody || null;
}
