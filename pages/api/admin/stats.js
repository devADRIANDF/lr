import { dbGet } from "../../../lib/db";
import { isAdminReq } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  if (!isAdminReq(req)) return res.status(401).json({ error: "No autorizado." });

  const totalPedidos = (await dbGet("SELECT COUNT(*) as n FROM orders")).n;
  const pendientes = (await dbGet("SELECT COUNT(*) as n FROM orders WHERE status = 'pendiente'")).n;
  const facturado = (await dbGet("SELECT COALESCE(SUM(amount_cents),0) as total FROM orders WHERE status != 'cancelado'")).total;
  const totalUsuarios = (await dbGet("SELECT COUNT(*) as n FROM users")).n;
  const comisionesPagadas = (await dbGet("SELECT COALESCE(SUM(amount_cents),0) as total FROM referral_earnings")).total;

  res.status(200).json({
    totalPedidos,
    pendientes,
    facturado_cents: facturado,
    totalUsuarios,
    comisiones_cents: comisionesPagadas,
  });
}
