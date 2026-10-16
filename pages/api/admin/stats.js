import { dbGet, responderErrorBD } from "../../../lib/db";
import { getAdmin } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (!(await getAdmin(req))) return res.status(401).json({ error: "No autorizado." });

  try {
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
  } catch (error) {
    return responderErrorBD(res, error, "admin/stats");
  }
}
