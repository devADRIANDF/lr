import { dbAll, dbRun } from "../../../lib/db";
import { isAdminReq } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (!isAdminReq(req)) {
    return res.status(401).json({ error: "No autorizado." });
  }

  if (req.method === "GET") {
    try {
      const rows = await dbAll(
        `SELECT u.id, u.email, u.wallet_balance, u.referral_code, u.created_at, u.commission_rate,
                (SELECT COUNT(*)::int FROM users r WHERE r.referred_by = u.id) as referidos,
                (SELECT COALESCE(SUM(amount_cents),0)::int FROM referral_earnings re WHERE re.affiliate_id = u.id) as comisiones_cents
         FROM users u ORDER BY u.created_at DESC`
      );
      return res.status(200).json({ users: rows });
    } catch (error) {
      console.error("Error en admin/users:", error);
      return res.status(500).json({ error: "Error consultando usuarios." });
    }
  }

  if (req.method === "PATCH") {
    const { id, commission_rate } = req.body || {};
    if (!id) return res.status(400).json({ error: "Falta el id del usuario." });

    // null/"" = vuelve a usar el 10% por defecto
    let rate = null;
    if (commission_rate !== null && commission_rate !== "" && commission_rate !== undefined) {
      rate = Number(commission_rate);
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({ error: "El porcentaje debe estar entre 0 y 100." });
      }
    }

    try {
      await dbRun("UPDATE users SET commission_rate = ? WHERE id = ?", [rate, id]);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error actualizando comisión:", error);
      return res.status(500).json({ error: "Error guardando el porcentaje." });
    }
  }

  res.status(405).end();
}
