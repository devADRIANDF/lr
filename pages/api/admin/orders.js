import { dbAll, dbRun } from "../../../lib/db";
import { isAdminReq } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  if (!isAdminReq(req)) return res.status(401).json({ error: "No autorizado." });

  if (req.method === "GET") {
    const rows = await dbAll(
      `SELECT o.id, o.type, o.package, o.target_id, o.amount_cents, o.status, o.created_at,
              o.guest_email, o.referred_by_code, u.email as user_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    return res.status(200).json({ orders: rows });
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body || {};
    const validos = ["pendiente", "entregado", "cancelado"];
    if (!id || !validos.includes(status)) {
      return res.status(400).json({ error: "Datos no válidos." });
    }
    await dbRun("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
