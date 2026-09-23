import { dbAll } from "../../../lib/db";
import stripe from "../../../lib/stripe";
import { isAdminReq } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  if (!isAdminReq(req)) return res.status(401).json({ error: "No autorizado." });

  if (req.method === "GET") {
    const rows = await dbAll("SELECT * FROM subscriptions ORDER BY created_at DESC");
    return res.status(200).json({ subscriptions: rows });
  }

  if (req.method === "POST") {
    const { stripeSubscriptionId } = req.body || {};
    if (!stripeSubscriptionId) return res.status(400).json({ error: "Falta el ID de suscripción." });
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
