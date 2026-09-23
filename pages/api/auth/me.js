import { dbGet } from "../../../lib/db";
import { getUserIdFromReq } from "../../../lib/auth";

export default async function handler(req, res) {
  const uid = getUserIdFromReq(req);
  if (!uid) return res.status(200).json({ user: null });
  const user = await dbGet(
    "SELECT id, email, wallet_balance, referral_code FROM users WHERE id = ?", [uid]
  );
  res.status(200).json({ user: user || null });
}
