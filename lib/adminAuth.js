import jwt from "jsonwebtoken";
import cookie from "cookie";
import crypto from "crypto";

// IMPORTANTE: define ADMIN_SECRET y ADMIN_PASSWORD como variables de entorno reales.
// En producción NO hay valores por defecto: sin ellas, el panel de admin queda cerrado.
const EN_PRODUCCION = process.env.NODE_ENV === "production";
const SECRET = process.env.ADMIN_SECRET || (EN_PRODUCCION ? "" : "secreto-admin-solo-para-desarrollo");
const COOKIE_NAME = "rv_admin";

export function adminConfigurado() {
  return !!SECRET && !!(process.env.ADMIN_PASSWORD || !EN_PRODUCCION);
}

export function checkAdminPassword(password) {
  const real = process.env.ADMIN_PASSWORD || (EN_PRODUCCION ? "" : "admin-local");
  if (!real || !SECRET) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(real);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function signAdminSession() {
  if (!SECRET) throw new Error("Falta la variable de entorno ADMIN_SECRET");
  return jwt.sign({ admin: true }, SECRET, { expiresIn: "12h" });
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

export function isAdminReq(req) {
  if (!SECRET) return false;
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  try {
    const payload = jwt.verify(token, SECRET);
    return !!payload.admin;
  } catch {
    return false;
  }
}
