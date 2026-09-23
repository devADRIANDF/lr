import stripe from "../../../lib/stripe";
import { resolveRefCode } from "../../../lib/referral";

const PRECIOS = { 5: 5000, 10: 9000, 15: 12500, 20: 16000 };
const PRECIO_EXTRA = 900;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, tier, extra, ref: refFromBody } = req.body || {};
  const ref = await resolveRefCode(req, refFromBody);
  const precioTramo = PRECIOS[Number(tier)];
  const extraN = Number(extra) || 0;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Indica un email válido." });
  }
  if (!precioTramo) return res.status(400).json({ error: "Tramo no válido." });
  if (extraN < 0 || !Number.isInteger(extraN)) {
    return res.status(400).json({ error: "Cantidad de reviews extra no válida." });
  }

  const totalReviews = Number(tier) + extraN;
  const amountCents = precioTramo + extraN * PRECIO_EXTRA;
  const origin = req.headers.origin || `https://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: { name: `Cuenta con ${totalReviews} reviews` },
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_type: "cuenta",
      email,
      total_reviews: String(totalReviews),
      amount_cents: String(amountCents),
      ref: ref || "",
    },
    success_url: `${origin}/pedido/confirmado?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/producto`,
  });

  res.status(200).json({ url: session.url });
}
