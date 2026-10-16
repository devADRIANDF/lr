import { dbGet } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { signSession, setSessionCookie, sesionesConfiguradas } from "../../../lib/auth";
import { EMPRESA } from "../../../lib/empresa";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!sesionesConfiguradas()) {
    console.error("[login] Falta la variable de entorno JWT_SECRET: no se pueden crear sesiones.");
    return res.status(500).json({ error: `El acceso no está disponible ahora mismo. Escríbenos a ${EMPRESA.email}.` });
  }
  const { email, password } = req.body || {};
  const user = await dbGet("SELECT * FROM users WHERE email = ?", [(email || "").toLowerCase()]);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).json({ error: "Credenciales incorrectas." });
  }
  const token = signSession(user.id);
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
}
