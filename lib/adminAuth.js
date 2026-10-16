import jwt from "jsonwebtoken";
import cookie from "cookie";
import crypto from "crypto";
import { dbGet, asegurarEsquemaAdmin } from "./db";

// IMPORTANTE: define ADMIN_SECRET y ADMIN_PASSWORD como variables de entorno reales.
// En producción NO hay valores por defecto: sin ellas, el panel de admin queda cerrado.
//
// Se puede entrar al panel de dos maneras:
//  - Con la clave general (ADMIN_PASSWORD): la del dueño. Funciona aunque la base de datos falle.
//  - Con una cuenta de administrador (email + contraseña): usuarios de la tabla users con is_admin.
const EN_PRODUCCION = process.env.NODE_ENV === "production";
const SECRET = process.env.ADMIN_SECRET || (EN_PRODUCCION ? "" : "secreto-admin-solo-para-desarrollo");
const COOKIE_NAME = "rv_admin";

export function secretoAdminConfigurado() {
  return !!SECRET;
}

export function claveGeneralConfigurada() {
  return !!(process.env.ADMIN_PASSWORD || !EN_PRODUCCION);
}

export function adminConfigurado() {
  return secretoAdminConfigurado() && claveGeneralConfigurada();
}

export function checkAdminPassword(password) {
  const real = process.env.ADMIN_PASSWORD || (EN_PRODUCCION ? "" : "admin-local");
  if (!real || !SECRET) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(real);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// extra = { uid } cuando la sesión es de una cuenta de administrador
export function signAdminSession(extra = {}) {
  if (!SECRET) throw new Error("Falta la variable de entorno ADMIN_SECRET");
  return jwt.sign({ admin: true, ...extra }, SECRET, { expiresIn: "12h" });
}

export function setAdminCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    })
  );
}

export function clearAdminCookie(res) {
  res.setHeader("Set-Cookie", cookie.serialize(COOKIE_NAME, "", { path: "/", maxAge: 0 }));
}

// Devuelve quién está dentro del panel o null:
//   { general: true,  id: null, email: null }  → entró con la clave general
//   { general: false, id, email }              → entró con su cuenta de administrador
// En las sesiones de cuenta se vuelve a comprobar en la base de datos que sigue siendo
// administrador, así que quitar el rol (o borrar la cuenta) corta el acceso al instante.
export async function getAdmin(req) {
  if (!SECRET) return null;
  const token = cookie.parse(req.headers.cookie || "")[COOKIE_NAME];
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
  if (!payload || payload.admin !== true) return null;

  if (payload.uid === undefined) {
    // Si se quita ADMIN_PASSWORD, las sesiones de la clave general dejan de valer
    return claveGeneralConfigurada() ? { general: true, id: null, email: null } : null;
  }

  try {
    await asegurarEsquemaAdmin();
    const u = await dbGet("SELECT id, email, is_admin FROM users WHERE id = ?", [payload.uid]);
    return u && u.is_admin ? { general: false, id: Number(u.id), email: u.email } : null;
  } catch (e) {
    console.error("[admin] no se pudo comprobar la cuenta de administrador:", e.message);
    return null;
  }
}
