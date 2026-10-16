import { dbGet, dbAll } from "../../../lib/db";
import { getUserIdFromReq } from "../../../lib/auth";

// Quien invita no debe ver el email completo de quien compra con su enlace: solo una versión parcial
// ("ju***@g***.com"), suficiente para reconocer la comisión sin exponer datos personales de un tercero.
function ocultarEmail(email) {
  const e = String(email || "");
  const at = e.lastIndexOf("@");
  if (at < 1) return "Usuario invitado";
  const usuario = e.slice(0, at);
  const [host, ...resto] = e.slice(at + 1).split(".");
  return `${usuario.slice(0, 2)}***@${host.slice(0, 1)}***${resto.length ? "." + resto.join(".") : ""}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = getUserIdFromReq(req);
  if (!uid) return res.status(401).json({ error: "No autenticado." });

  const user = await dbGet("SELECT referral_code FROM users WHERE id = ?", [uid]);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const totalReferidos = (await dbGet(
    "SELECT COUNT(*)::int as n FROM users WHERE referred_by = ?", [uid]
  )).n;

  const totalGanado = (await dbGet(
    "SELECT COALESCE(SUM(amount_cents),0)::int as total FROM referral_earnings WHERE affiliate_id = ?", [uid]
  )).total;

  const filas = await dbAll(
    `SELECT re.amount_cents, re.created_at, COALESCE(u.email, re.from_email) as from_email
     FROM referral_earnings re LEFT JOIN users u ON u.id = re.from_user_id
     WHERE re.affiliate_id = ? ORDER BY re.created_at DESC LIMIT 20`,
    [uid]
  );
  const historial = filas.map((f) => ({ ...f, from_email: ocultarEmail(f.from_email) }));

  // % de comisión propio del usuario (el admin puede personalizarlo); 10 por defecto
  let comisionPct = 10;
  try {
    const c = await dbGet("SELECT commission_rate FROM users WHERE id = ?", [uid]);
    if (c && c.commission_rate !== null && c.commission_rate !== undefined) comisionPct = Number(c.commission_rate);
  } catch {
    // columna aún sin crear: se usa el valor por defecto
  }

  res.status(200).json({
    referral_code: user.referral_code,
    comision_pct: comisionPct,
    total_referidos: totalReferidos,
    total_ganado_cents: totalGanado,
    historial,
  });
}
