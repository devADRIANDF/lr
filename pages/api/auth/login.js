import { dbGet } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { signSession, setSessionCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body || {};
  const user = await dbGet("SELECT * FROM users WHERE email = ?", [(email || "").toLowerCase()]);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).json({ error: "Credenciales incorrectas." });
  }
  const token = signSession(user.id);
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
}
