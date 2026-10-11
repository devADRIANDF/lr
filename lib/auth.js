import jwt from "jsonwebtoken";
import cookie from "cookie";

// IMPORTANTE: define JWT_SECRET como variable de entorno real en producción.
// En producción NO hay valor por defecto: sin JWT_SECRET no se crean ni se aceptan sesiones
// (un secreto conocido permitiría falsificar la sesión de cualquier usuario).
const SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "secreto-solo-para-desarrollo");
const COOKIE_NAME = "rv_session";

// false si falta JWT_SECRET en producción: los endpoints de acceso lo comprueban antes de tocar la base de datos.
export function sesionesConfiguradas() {
  return !!SECRET;
}

export function signSession(userId) {
  if (!SECRET) throw new Error("Falta la variable de entorno JWT_SECRET");
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", { path: "/", maxAge: 0 })
  );
}

export function getUserIdFromReq(req) {
  if (!SECRET) return null;
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    return payload.uid;
  } catch {
    return null;
  }
}
