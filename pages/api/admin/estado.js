import { dbAll, bdConfigurada, describirErrorBD } from "../../../lib/db";
import { getAdmin } from "../../../lib/adminAuth";

const TABLAS = ["users", "orders", "subscriptions", "wallet_topups", "referral_earnings", "stripe_events"];

// Comprobación de qué falta por configurar. Solo devuelve sí/no y avisos: nunca el valor de ninguna clave.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (!(await getAdmin(req))) return res.status(401).json({ error: "No autorizado." });

  const checks = [];

  // Base de datos
  const bd = { id: "bd", titulo: "Base de datos", ok: false, mensaje: "", arreglo: "" };
  if (!bdConfigurada()) {
    const d = describirErrorBD(new Error("No hay DATABASE_URL configurada"));
    Object.assign(bd, { mensaje: d.mensaje, arreglo: d.arreglo });
  } else {
    try {
      // La lista son constantes del propio código (no hay datos del usuario en la consulta)
      const lista = TABLAS.map((t) => `'${t}'`).join(", ");
      const filas = await dbAll(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name IN (${lista})`
      );
      const faltan = TABLAS.filter((t) => !filas.some((f) => f.table_name === t));
      if (faltan.length === 0) {
        bd.ok = true;
      } else {
        const d = describirErrorBD({ code: "42P01" });
        Object.assign(bd, { mensaje: `${d.mensaje} Faltan: ${faltan.join(", ")}.`, arreglo: d.arreglo });
      }
    } catch (error) {
      console.error("[admin/estado] base de datos:", error.message);
      const d = describirErrorBD(error);
      Object.assign(bd, { mensaje: d.mensaje, arreglo: d.arreglo });
    }
  }
  checks.push(bd);

  // Inicio de sesión de clientes
  const jwtOk = !!process.env.JWT_SECRET || process.env.NODE_ENV !== "production";
  checks.push({
    id: "sesiones",
    titulo: "Inicio de sesión de clientes",
    ok: jwtOk,
    mensaje: jwtOk ? "" : "Falta la variable JWT_SECRET: nadie puede registrarse ni iniciar sesión.",
    arreglo: jwtOk ? "" : "Vercel → Environment Variables → añade JWT_SECRET con una cadena larga y aleatoria → Redeploy.",
  });

  // Stripe
  const clave = process.env.STRIPE_SECRET_KEY || "";
  const claveOk = /^(sk|rk)_(test|live)_/.test(clave) && !/_x+$|placeholder/i.test(clave);
  const modo = claveOk ? (/_live_/.test(clave) ? "real" : "pruebas") : null;
  checks.push({
    id: "stripe",
    titulo: "Cobros con Stripe",
    ok: claveOk,
    mensaje: claveOk ? "" : "Falta STRIPE_SECRET_KEY (o no tiene el formato sk_test_… / sk_live_…): no se pueden cobrar pedidos.",
    arreglo: claveOk ? "" : "Stripe → Developers → API keys → copia la clave secreta → Vercel → STRIPE_SECRET_KEY → Redeploy.",
    aviso: modo === "pruebas" ? "Stripe está en modo pruebas: los pagos no son reales. Cuando todo funcione, cambia a las claves reales (sk_live_…)." : "",
  });

  const whsec = process.env.STRIPE_WEBHOOK_SECRET || "";
  const webhookOk = /^whsec_/.test(whsec) && !/_x+$/i.test(whsec);
  checks.push({
    id: "webhook",
    titulo: "Aviso de pagos de Stripe (webhook)",
    ok: webhookOk,
    mensaje: webhookOk ? "" : "Falta STRIPE_WEBHOOK_SECRET (empieza por whsec_): los pagos se cobran pero los pedidos no se registran.",
    arreglo: webhookOk ? "" : "Stripe → Developers → Webhooks → tu endpoint → Signing secret → Vercel → STRIPE_WEBHOOK_SECRET → Redeploy.",
  });

  res.status(200).json({ checks, stripe: { modo } });
}
