import jwt from "jsonwebtoken";
import cookie from "cookie";

// IMPORTANTE: define ADMIN_SECRET y ADMIN_PASSWORD como variables de entorno
// reales en producción. Los valores de aquí abajo son solo para desarrollo.
const SECRET = process.env.ADMIN_SECRET || "cambia-esto-tambien-en-produccion";
const COOKIE_NAME = "rv_admin";

export function checkAdminPassword(password) {
  const real = process.env.ADMIN_PASSWORD || "2019cuentaslogin2019pc";
  return password === real;
}

export function signAdminSession() {
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
