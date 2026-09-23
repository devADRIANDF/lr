import stripe from "../../../lib/stripe";
import {
  crearPedidoCuentaPagado, acreditarSaldoPagado,
  crearSuscripcionPagada, registrarRenovacionMensual, marcarEstadoSuscripcion,
} from "../../../lib/orders";

export const config = {
  api: { bodyParser: false },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Firma de webhook inválida:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    try {
      if (meta.order_type === "cuenta") {
        await crearPedidoCuentaPagado({
          email: meta.email,
          totalReviews: Number(meta.total_reviews),
          amountCents: Number(meta.amount_cents),
          refCode: meta.ref,
        });
      } else if (meta.order_type === "wallet") {
        await acreditarSaldoPagado({
          userId: Number(meta.user_id),
          amountCents: Number(meta.amount_cents),
        });
      } else if (session.mode === "subscription" && session.subscription) {
        // El checkout de suscripción guarda sus datos en subscription_data.metadata,
        // que Stripe copia a la propia suscripción, no a la sesión.
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const m = sub.metadata || {};
        await crearSuscripcionPagada({
          stripeSubscriptionId: sub.id,
          email: m.email,
          type: m.sub_type,
          targetId: m.target_id,
          reviewsPerMonth: Number(m.reviews_per_month),
          setupAmountCents: Number(m.setup_cents),
          monthlyAmountCents: Number(m.monthly_cents),
          refCode: m.ref,
        });
      }
    } catch (err) {
      console.error("Error procesando el pago confirmado:", err);
      return res.status(500).json({ error: "Error interno procesando el pedido." });
    }
  }

  // Renovación mensual de una suscripción (mes 2 en adelante; el mes 1 ya
  // se registra en checkout.session.completed como cuota de alta)
  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    if (invoice.billing_reason === "subscription_cycle" && invoice.subscription) {
      try {
        await registrarRenovacionMensual({
          stripeSubscriptionId: invoice.subscription,
          amountCents: invoice.amount_paid,
        });
      } catch (err) {
        console.error("Error registrando renovación mensual:", err);
        return res.status(500).json({ error: "Error interno procesando la renovación." });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    await marcarEstadoSuscripcion({ stripeSubscriptionId: sub.id, status: "cancelada" });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    if (invoice.subscription) {
      await marcarEstadoSuscripcion({ stripeSubscriptionId: invoice.subscription, status: "impago" });
    }
  }

  res.status(200).json({ received: true });
}
