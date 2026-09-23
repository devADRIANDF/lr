import { isAdminReq } from "../../../lib/adminAuth";

export default function handler(req, res) {
  res.status(200).json({ isAdmin: isAdminReq(req) });
}
