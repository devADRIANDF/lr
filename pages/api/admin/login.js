import { checkAdminPassword, signAdminSession, setAdminCookie, adminConfigurado } from "../../../lib/adminAuth";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!adminConfigurado()) {
    return res.status(500).json({ error: "Falta configurar ADMIN_PASSWORD y ADMIN_SECRET en las variables de entorno." });
  }
  const { password } = req.body || {};
  if (!checkAdminPassword(password || "")) {
    return res.status(401).json({ error: "Contraseña incorrecta." });
  }
  setAdminCookie(res, signAdminSession());
  res.status(200).json({ ok: true });
}
