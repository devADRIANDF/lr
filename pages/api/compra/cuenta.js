import { dbGet, dbRun } from "../../../lib/db";
import { getUserIdFromReq } from "../../../lib/auth";
import { acreditarComision } from "../../../lib/comision";
import { seguro } from "../../../lib/seguro";
import { EMPRESA } from "../../../lib/empresa";

const PRECIOS = { 5: 5000, 10: 9000, 15: 12500, 20: 16000 };
const PRECIO_EXTRA = 900;

async function registrarComision(orderId, buyerId, amountCents) {
  const buyer = await dbGet("SELECT referred_by FROM users WHERE id = ?", [buyerId]);
  if (!buyer || !buyer.referred_by) return;
  await acreditarComision({ affiliateId: buyer.referred_by, orderId, amountCents, fromUserId: buyerId });
}

// Compra de una cuenta pagando con el saldo del monedero.
async function handler(req, res) {
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

  // El saldo se descuenta en una sola operación y solo si alcanza: así dos peticiones a la vez
  // no pueden gastar el mismo saldo dos veces.
  const descuento = await dbRun(
    "UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ? AND wallet_balance >= ?",
    [precio, uid, precio]
  );
  if (!descuento.changes) {
    return res.status(400).json({ error: "Saldo insuficiente. Recarga tu monedero." });
  }

  let info;
  try {
    info = await dbRun(
      "INSERT INTO orders (user_id, type, package, amount_cents, status) VALUES (?, 'cuenta', ?, ?, 'pendiente')",
      [uid, totalReviews, precio]
    );
  } catch (e) {
    // Si el pedido no se pudo guardar, el saldo vuelve al monedero.
    await dbRun("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [precio, uid]);
    throw e;
  }

  // El pedido ya está hecho; si falla la comisión del referido no se deshace la compra (queda en los logs).
  try {
    await registrarComision(info.lastInsertRowid, uid, precio);
  } catch (e) {
    console.error("[compra-cuenta] No se pudo acreditar la comisión del pedido", info.lastInsertRowid, e && e.message ? e.message : e);
  }

  res.status(201).json({ ok: true, orderId: info.lastInsertRowid });
}

export default seguro("compra-cuenta", handler, `No se pudo completar la compra. Revisa tu saldo e inténtalo de nuevo, o escríbenos a ${EMPRESA.email}.`);
