import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { dbGet, dbRun, asegurarEsquemaAdmin } from "./db";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 7);

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mínimo de caracteres de la contraseña. Los administradores necesitan una más larga porque
// desde el panel se pueden restablecer contraseñas y tocar pedidos y suscripciones.
export const minimoClave = (esAdmin) => (esAdmin ? 10 : 6);

// bcrypt solo mira los 72 primeros bytes: una contraseña más larga se recortaría sin avisar.
export const MAXIMO_CLAVE = 72;

// Crea la cuenta con su código de referido. Lanza un error con code "EMAIL_EXISTE" si el email ya está.
export async function crearUsuario({ email, password, admin = false, referidoPor = null }) {
  const hash = bcrypt.hashSync(password, 10);
  let code = genCode();
  while (await dbGet("SELECT id FROM users WHERE referral_code = ?", [code])) code = genCode();

  try {
    let info;
    if (admin) {
      await asegurarEsquemaAdmin();
      info = await dbRun(
        "INSERT INTO users (email, password_hash, wallet_balance, referral_code, referred_by, is_admin) VALUES (?, ?, 0, ?, ?, TRUE)",
        [email, hash, code, referidoPor]
      );
    } else {
      info = await dbRun(
        "INSERT INTO users (email, password_hash, wallet_balance, referral_code, referred_by) VALUES (?, ?, 0, ?, ?)",
        [email, hash, code, referidoPor]
      );
    }
    return { id: info.lastInsertRowid, referral_code: code };
  } catch (e) {
    // 23505 = clave única repetida. Si es la del email, dos altas simultáneas con el mismo correo
    if (e?.code === "23505" && /email/i.test(`${e.constraint_name || ""} ${e.detail || ""}`)) {
      const err = new Error("EMAIL_EXISTE");
      err.code = "EMAIL_EXISTE";
      throw err;
    }
    throw e;
  }
}
