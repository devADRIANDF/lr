import { dbGet, dbAll } from "../../../lib/db";
import { getUserIdFromReq } from "../../../lib/auth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const uid = getUserIdFromReq(req);
  if (!uid) return res.status(401).json({ error: "No autenticado." });

  const user = await dbGet("SELECT email FROM users WHERE id = ?", [uid]);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  // Los pedidos pagados con tarjeta se guardan por email (no hace falta cuenta para comprar) y los
  // pagados con el monedero, por usuario: buscamos por las dos cosas.
  const pedidos = await dbAll(
    `SELECT id, type, package, target_id, amount_cents, status, created_at
     FROM orders WHERE user_id = ? OR LOWER(guest_email) = LOWER(?) ORDER BY created_at DESC`,
    [uid, user.email]
  );

  res.status(200).json({ pedidos });
}
