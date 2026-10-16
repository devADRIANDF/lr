import { dbGet } from "../../../lib/db";
import { crearUsuario } from "../../../lib/usuarios";
import { signSession, setSessionCookie, sesionesConfiguradas } from "../../../lib/auth";
import { EMPRESA } from "../../../lib/empresa";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!sesionesConfiguradas()) {
    console.error("[register] Falta la variable de entorno JWT_SECRET: no se pueden crear sesiones.");
    return res.status(500).json({ error: `El acceso no está disponible ahora mismo. Escríbenos a ${EMPRESA.email}.` });
  }
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

  let nuevo;
  try {
    nuevo = await crearUsuario({ email: email.toLowerCase(), password, referidoPor: referredBy });
  } catch (error) {
    if (error?.code === "EMAIL_EXISTE") return res.status(409).json({ error: "Ese email ya está registrado." });
    throw error;
  }

  const token = signSession(nuevo.id);
  setSessionCookie(res, token);
  res.status(201).json({ ok: true });
}
