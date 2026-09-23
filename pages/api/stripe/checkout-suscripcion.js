import stripe from "../../../lib/stripe";
import { resolveRefCode } from "../../../lib/referral";

const PRECIOS_CUENTA = { 5: 5000, 10: 9000, 15: 12500, 20: 16000 };
const PRECIO_EXTRA_CUENTA = 900; // 9 € por review por encima del tramo (cuota de alta)
const PRECIO_MENSUAL_UNIDAD = 600; // 6 € por review al mes
const MINIMO = 5;

function calcularAltaCuenta(n) {
  // Usa el tramo igual o inferior más cercano, y cobra el resto como extra
  const tramos = [20, 15, 10, 5];
  const tramo = tramos.find((t) => t <= n) || 5;
  const extra = n - tramo;
  return PRECIOS_CUENTA[tramo] + extra * PRECIO_EXTRA_CUENTA;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, type, reviewsPerMonth, ref: refFromBody } = req.body || {};
  const ref = await resolveRefCode(req, refFromBody);
  const n = Number(reviewsPerMonth);

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Indica un email válido." });
  }
  if (type !== "cuenta") {
    return res.status(400).json({ error: "Tipo no válido." });
  }
  if (!Number.isInteger(n) || n < MINIMO) {
    return res.status(400).json({ error: `El mínimo es ${MINIMO} reviews al mes.` });
  }

  const setupCents = calcularAltaCuenta(n);
  const monthlyCents = n * PRECIO_MENSUAL_UNIDAD;
  const origin = req.headers.origin || `https://${req.headers.host}`;
  const nombreProducto = `Cuenta con ${n} reviews/mes`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    allow_promotion_codes: true,
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: setupCents,
          product_data: { name: `${nombreProducto} — cuota de alta` },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "eur",
          unit_amount: monthlyCents,
          recurring: { interval: "month" },
          product_data: { name: `${nombreProducto} — mensualidad` },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        sub_type: "cuenta",
        email,
        target_id: "",
        reviews_per_month: String(n),
        setup_cents: String(setupCents),
        monthly_cents: String(monthlyCents),
        ref: ref || "",
      },
    },
    success_url: `${origin}/pedido/confirmado?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/producto`,
  });

  res.status(200).json({ url: session.url });
}
