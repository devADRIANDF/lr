import { dbGet, dbRun } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { signSession, setSessionCookie } from "../../../lib/auth";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 7);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password, ref } = req.body || {};

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email o contraseña inválidos (mínimo 6 caracteres)." });
  }

  const existing = await dbGet("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
  if (existing) return res.status(409).json({ error: "Ese email ya está registrado." });

  let referredBy = null;
  if (ref) {
    const refUser = await dbGet("SELECT id FROM users WHERE referral_code = ?", [ref]);
    if (refUser) referredBy = refUser.id;
  }

  const hash = bcrypt.hashSync(password, 10);
  let code = genCode();
  while (await dbGet("SELECT id FROM users WHERE referral_code = ?", [code])) code = genCode();

  const info = await dbRun(
    "INSERT INTO users (email, password_hash, wallet_balance, referral_code, referred_by) VALUES (?, ?, 0, ?, ?)",
    [email.toLowerCase(), hash, code, referredBy]
  );

  const token = signSession(info.lastInsertRowid);
  setSessionCookie(res, token);
  res.status(201).json({ ok: true });
}
