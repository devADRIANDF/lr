import Stripe from "stripe";

// IMPORTANTE: define STRIPE_SECRET_KEY como variable de entorno real.
// Sin ella, esto no puede crear sesiones de pago.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

export default stripe;
