import { dbGet, dbAll } from "../../../lib/db";
import { getUserIdFromReq } from "../../../lib/auth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const uid = getUserIdFromReq(req);
  if (!uid) return res.status(401).json({ error: "No autenticado." });

  const user = await dbGet("SELECT email FROM users WHERE id = ?", [uid]);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  // Los pedidos se guardan por email (no hace falta cuenta para comprar),
  // así que buscamos por el email de la cuenta con la que has iniciado sesión.
  const pedidos = await dbAll(
    `SELECT id, type, package, target_id, amount_cents, status, created_at
     FROM orders WHERE guest_email = ? ORDER BY created_at DESC`,
    [user.email]
  );

  res.status(200).json({ pedidos });
}
