import { getAdmin } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  const admin = await getAdmin(req);
  if (!admin) return res.status(200).json({ isAdmin: false });
  res.status(200).json({ isAdmin: true, general: admin.general, id: admin.id, email: admin.email });
}
