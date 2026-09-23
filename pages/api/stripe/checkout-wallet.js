import stripe from "../../../lib/stripe";
import { getUserIdFromReq } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const uid = getUserIdFromReq(req);
  if (!uid) return res.status(401).json({ error: "No autenticado." });

  const { amountEuros } = req.body || {};
  const amount = Number(amountEuros);
  if (!amount || amount < 5 || amount > 500) {
    return res.status(400).json({ error: "Importe fuera de rango (5€ - 500€)." });
  }
  const amountCents = Math.round(amount * 100);
  const origin = req.headers.origin || `https://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: { name: `Recarga de monedero — ${amount} €` },
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_type: "wallet",
      user_id: String(uid),
      amount_cents: String(amountCents),
    },
    success_url: `${origin}/pedido/confirmado?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/saldo`,
  });

  res.status(200).json({ url: session.url });
}
