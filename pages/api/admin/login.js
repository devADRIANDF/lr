import bcrypt from "bcryptjs";
import { dbGet, asegurarEsquemaAdmin, describirErrorBD } from "../../../lib/db";
import {
  checkAdminPassword,
  signAdminSession,
  setAdminCookie,
  secretoAdminConfigurado,
  claveGeneralConfigurada,
} from "../../../lib/adminAuth";
import { ipDe, demasiadosIntentos, anotarFallo, olvidarFallos } from "../../../lib/limite";

// Se compara contra esto cuando el email no existe, para que tardar lo mismo no delate qué emails tienen cuenta
const HASH_FALSO = bcrypt.hashSync("una-clave-que-nadie-usa", 10);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") return res.status(405).end();

  if (!secretoAdminConfigurado()) {
    return res.status(500).json({ error: "Falta configurar ADMIN_SECRET en las variables de entorno de Vercel." });
  }

  const { email, password } = req.body || {};
  const correo = typeof email === "string" ? email.trim().toLowerCase() : "";
  const clave = typeof password === "string" ? password : "";

  // Sin email se entra con la clave general: si falta ADMIN_PASSWORD se dice exactamente qué falta
  if (!correo && !claveGeneralConfigurada()) {
    return res.status(500).json({ error: "Falta configurar ADMIN_PASSWORD en las variables de entorno de Vercel." });
  }

  const ip = ipDe(req);
  if (demasiadosIntentos(ip)) {
    return res.status(429).json({ error: "Demasiados intentos fallidos. Espera unos minutos y vuelve a probar." });
  }

  // 1) Cuenta de administrador: email + contraseña
  let errorBD = null;
  if (correo) {
    try {
      await asegurarEsquemaAdmin();
      const u = await dbGet("SELECT id, password_hash, is_admin FROM users WHERE email = ?", [correo]);
      const coincide = bcrypt.compareSync(clave, u ? u.password_hash : HASH_FALSO);
      if (u && coincide && u.is_admin) {
        olvidarFallos(ip);
        setAdminCookie(res, signAdminSession({ uid: Number(u.id) }));
        return res.status(200).json({ ok: true });
      }
    } catch (error) {
      console.error("[admin/login] no se pudo consultar la cuenta:", error.message);
      errorBD = error;
    }
  }

  // 2) Clave general. Vale aunque se haya escrito un email (un gestor de contraseñas puede rellenarlo solo)
  if (clave && claveGeneralConfigurada() && checkAdminPassword(clave)) {
    olvidarFallos(ip);
    setAdminCookie(res, signAdminSession());
    return res.status(200).json({ ok: true });
  }

  // Si no entró y la base de datos falló, el problema real es ese, no la contraseña
  if (errorBD) {
    const d = describirErrorBD(errorBD);
    return res.status(d.status).json({ error: d.mensaje, code: d.code, arreglo: d.arreglo });
  }

  anotarFallo(ip);
  return res.status(401).json({
    error: correo
      ? "Email o contraseña incorrectos."
      : "Contraseña incorrecta. Si entras con una cuenta de administrador, escribe también tu email.",
  });
}
