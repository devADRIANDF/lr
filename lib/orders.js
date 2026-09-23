import { dbGet, dbRun } from "./db";
import { acreditarComision } from "./comision";

// Toda esta lógica se ejecuta SOLO desde el webhook de Stripe, una vez
// confirmado el pago. No se llama nunca directamente desde el navegador.

async function registrarComisionSiAplica(orderId, email, refCode, amountCents) {
  if (!refCode) return;
  const afiliado = await dbGet("SELECT id FROM users WHERE referral_code = ?", [refCode]);
  if (!afiliado) return;
  await acreditarComision({ affiliateId: afiliado.id, orderId, amountCents, fromEmail: email });
}

export async function crearPedidoCuentaPagado({ email, totalReviews, amountCents, refCode }) {
  const info = await dbRun(
    "INSERT INTO orders (user_id, guest_email, referred_by_code, type, package, amount_cents, status) VALUES (NULL, ?, ?, 'cuenta', ?, ?, 'pendiente')",
    [email, refCode || null, totalReviews, amountCents]
  );
  await registrarComisionSiAplica(info.lastInsertRowid, email, refCode, amountCents);
  return info.lastInsertRowid;
}

export async function acreditarSaldoPagado({ userId, amountCents }) {
  await dbRun("INSERT INTO wallet_topups (user_id, amount_cents, status) VALUES (?, ?, 'completado')", [userId, amountCents]);
  await dbRun("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amountCents, userId]);
}

// --- Suscripciones (reviews recurrentes) ---

export async function crearSuscripcionPagada({
  stripeSubscriptionId, email, type, targetId, reviewsPerMonth,
  setupAmountCents, monthlyAmountCents, refCode,
}) {
  const info = await dbRun(
    `INSERT INTO subscriptions
     (stripe_subscription_id, email, type, target_id, reviews_per_month, setup_amount_cents, monthly_amount_cents, referred_by_code, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activa')`,
    [stripeSubscriptionId, email, type, targetId || null, reviewsPerMonth, setupAmountCents, monthlyAmountCents, refCode || null]
  );
  const subscriptionId = info.lastInsertRowid;

  const orderInfo = await dbRun(
    `INSERT INTO orders (user_id, guest_email, referred_by_code, subscription_id, type, package, target_id, amount_cents, status)
     VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [email, refCode || null, subscriptionId, type, reviewsPerMonth, targetId || null, setupAmountCents]
  );
  await registrarComisionSiAplica(orderInfo.lastInsertRowid, email, refCode, setupAmountCents);

  return subscriptionId;
}

export async function registrarRenovacionMensual({ stripeSubscriptionId, amountCents }) {
  const sub = await dbGet("SELECT * FROM subscriptions WHERE stripe_subscription_id = ?", [stripeSubscriptionId]);
  if (!sub) return null;

  const orderInfo = await dbRun(
    `INSERT INTO orders (user_id, guest_email, referred_by_code, subscription_id, type, package, target_id, amount_cents, status)
     VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [sub.email, sub.referred_by_code, sub.id, sub.type, sub.reviews_per_month, sub.target_id, amountCents]
  );
  await registrarComisionSiAplica(orderInfo.lastInsertRowid, sub.email, sub.referred_by_code, amountCents);
  return orderInfo.lastInsertRowid;
}

export async function marcarEstadoSuscripcion({ stripeSubscriptionId, status }) {
  await dbRun("UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?", [status, stripeSubscriptionId]);
}
