import { dbGet, dbRun } from "./db";

const COMISION_POR_DEFECTO = 10; // % si el usuario no tiene uno propio asignado

// Único sitio donde se calcula y acredita una comisión de referido.
// affiliateId: id del usuario que cobra la comisión.
export async function acreditarComision({ affiliateId, orderId, amountCents, fromUserId = null, fromEmail = null }) {
  if (!affiliateId) return;
  const afiliado = await dbGet("SELECT commission_rate FROM users WHERE id = ?", [affiliateId]);
  if (!afiliado) return;
  const porcentaje = afiliado.commission_rate != null ? Number(afiliado.commission_rate) : COMISION_POR_DEFECTO;
  const comision = Math.round(amountCents * (porcentaje / 100));
  await dbRun(
    "INSERT INTO referral_earnings (affiliate_id, from_user_id, from_email, order_id, amount_cents) VALUES (?, ?, ?, ?, ?)",
    [affiliateId, fromUserId, fromEmail, orderId, comision]
  );
  await dbRun("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [comision, affiliateId]);
}
