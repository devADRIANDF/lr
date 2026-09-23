import { checkAdminPassword, signAdminSession, setAdminCookie } from "../../../lib/adminAuth";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { password } = req.body || {};
  if (!checkAdminPassword(password || "")) {
    return res.status(401).json({ error: "Contraseña incorrecta." });
  }
  setAdminCookie(res, signAdminSession());
  res.status(200).json({ ok: true });
}
