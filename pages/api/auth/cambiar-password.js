import { dbGet, dbRun } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { getUserIdFromReq } from "../../../lib/auth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).end();
  const uid = getUserIdFromReq(req);
  if (!uid) return res.status(401).json({ error: "No autenticado." });

  const { current_password, new_password } = req.body || {};
  if (typeof new_password !== "string" || new_password.length < 6) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
  }
  const user = await dbGet("SELECT id, password_hash FROM users WHERE id = ?", [uid]);
  if (!user || !bcrypt.compareSync(current_password || "", user.password_hash)) {
    return res.status(401).json({ error: "La contraseña actual no es correcta." });
  }
  await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [bcrypt.hashSync(new_password, 10), uid]);
  res.status(200).json({ ok: true });
}
