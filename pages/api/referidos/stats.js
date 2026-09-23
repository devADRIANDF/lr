import { dbGet, dbAll } from "../../../lib/db";
import { getUserIdFromReq } from "../../../lib/auth";

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

  const historial = await dbAll(
    `SELECT re.amount_cents, re.created_at, COALESCE(u.email, re.from_email) as from_email
     FROM referral_earnings re LEFT JOIN users u ON u.id = re.from_user_id
     WHERE re.affiliate_id = ? ORDER BY re.created_at DESC LIMIT 20`,
    [uid]
  );

  res.status(200).json({
    referral_code: user.referral_code,
    total_referidos: totalReferidos,
    total_ganado_cents: totalGanado,
    historial,
  });
}
