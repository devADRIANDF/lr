import { dbGet, dbRun } from "../../../lib/db";
import { getUserIdFromReq } from "../../../lib/auth";
import { acreditarComision } from "../../../lib/comision";

const PRECIOS = { 5: 5000, 10: 9000, 15: 12500, 20: 16000 };
const PRECIO_EXTRA = 900;

async function registrarComision(orderId, buyerId, amountCents) {
  const buyer = await dbGet("SELECT referred_by FROM users WHERE id = ?", [buyerId]);
  if (!buyer || !buyer.referred_by) return;
  await acreditarComision({ affiliateId: buyer.referred_by, orderId, amountCents, fromUserId: buyerId });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const uid = getUserIdFromReq(req);
  if (!uid) return res.status(401).json({ error: "No autenticado." });

  const { tier, extra } = req.body || {};
  const precioTramo = PRECIOS[Number(tier)];
  const extraN = Number(extra) || 0;
  if (!precioTramo) return res.status(400).json({ error: "Tramo no válido." });
  if (extraN < 0 || !Number.isInteger(extraN)) {
    return res.status(400).json({ error: "Cantidad de reviews extra no válida." });
  }

  const totalReviews = Number(tier) + extraN;
  const precio = precioTramo + extraN * PRECIO_EXTRA;

  const user = await dbGet("SELECT wallet_balance FROM users WHERE id = ?", [uid]);
  if (user.wallet_balance < precio) {
    return res.status(400).json({ error: "Saldo insuficiente. Recarga tu monedero." });
  }

  await dbRun("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?", [precio, uid]);
  const info = await dbRun(
    "INSERT INTO orders (user_id, type, package, amount_cents, status) VALUES (?, 'cuenta', ?, ?, 'pendiente')",
    [uid, totalReviews, precio]
  );
  await registrarComision(info.lastInsertRowid, uid, precio);

  res.status(201).json({ ok: true, orderId: info.lastInsertRowid });
}
