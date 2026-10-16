import bcrypt from "bcryptjs";
import { dbAll, dbGet, dbRun, asegurarEsquemaAdmin, responderErrorBD } from "../../../lib/db";
import { getAdmin } from "../../../lib/adminAuth";
import { crearUsuario, EMAIL_VALIDO, minimoClave, MAXIMO_CLAVE } from "../../../lib/usuarios";

// Comprueba largo de contraseña; devuelve el texto del error o null si está bien
function errorDeClave(clave, esAdmin) {
  const min = minimoClave(esAdmin);
  if (typeof clave !== "string" || clave.length < min) {
    return `La contraseña debe tener al menos ${min} caracteres${esAdmin ? " (es una cuenta de administrador)" : ""}.`;
  }
  if (clave.length > MAXIMO_CLAVE) return `La contraseña no puede pasar de ${MAXIMO_CLAVE} caracteres.`;
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const admin = await getAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: "No autorizado." });
  }

  if (req.method === "GET") {
    try {
      await asegurarEsquemaAdmin();
      const rows = await dbAll(
        `SELECT u.id, u.email, u.wallet_balance, u.referral_code, u.created_at, u.commission_rate, u.is_admin,
                (SELECT COUNT(*)::int FROM users r WHERE r.referred_by = u.id) as referidos,
                (SELECT COALESCE(SUM(amount_cents),0)::int FROM referral_earnings re WHERE re.affiliate_id = u.id) as comisiones_cents
         FROM users u ORDER BY u.created_at DESC`
      );
      return res.status(200).json({ users: rows });
    } catch (error) {
      return responderErrorBD(res, error, "admin/users");
    }
  }

  // Alta de un usuario (con o sin permiso de administrador) desde el panel
  if (req.method === "POST") {
    const { email, password, admin: quiereAdmin } = req.body || {};
    const correo = typeof email === "string" ? email.trim().toLowerCase() : "";
    const esAdmin = quiereAdmin === true;

    if (!EMAIL_VALIDO.test(correo) || correo.length > 254) {
      return res.status(400).json({ error: "Escribe un email válido." });
    }
    const fallo = errorDeClave(password, esAdmin);
    if (fallo) return res.status(400).json({ error: fallo });

    try {
      const existente = await dbGet("SELECT id FROM users WHERE email = ?", [correo]);
      if (existente) {
        return res.status(409).json({
          error: esAdmin
            ? "Ese email ya tiene cuenta. Búscalo en la lista y pulsa «Hacer administrador»."
            : "Ese email ya está registrado.",
        });
      }
      const nuevo = await crearUsuario({ email: correo, password, admin: esAdmin });
      return res.status(201).json({ ok: true, user: { id: nuevo.id, email: correo, is_admin: esAdmin } });
    } catch (error) {
      if (error?.code === "EMAIL_EXISTE") return res.status(409).json({ error: "Ese email ya está registrado." });
      return responderErrorBD(res, error, "admin/users");
    }
  }

  if (req.method === "PATCH") {
    const { id, commission_rate, new_password, admin: rol } = req.body || {};
    const uid = Number(id);
    if (!id || !Number.isInteger(uid) || uid <= 0) return res.status(400).json({ error: "Falta el id del usuario." });

    // Dar o quitar el permiso de administrador
    if (rol !== undefined) {
      if (typeof rol !== "boolean") return res.status(400).json({ error: "Rol no válido." });
      try {
        await asegurarEsquemaAdmin();

        if (rol === false) {
          if (admin.id === uid) {
            return res.status(400).json({ error: "No puedes quitarte el acceso a ti mismo. Pídeselo a otro administrador." });
          }
          const filas = await dbAll("UPDATE users SET is_admin = FALSE WHERE id = ? RETURNING id, email, is_admin", [uid]);
          if (!filas[0]) return res.status(404).json({ error: "Usuario no encontrado." });
          return res.status(200).json({ ok: true, user: filas[0] });
        }

        // Al hacer administrador a alguien se fija una contraseña nueva y larga en el mismo paso
        const fallo = errorDeClave(new_password, true);
        if (fallo) return res.status(400).json({ error: `Para hacerlo administrador hay que fijar una contraseña nueva. ${fallo}` });
        const filas = await dbAll(
          "UPDATE users SET is_admin = TRUE, password_hash = ? WHERE id = ? RETURNING id, email, is_admin",
          [bcrypt.hashSync(new_password, 10), uid]
        );
        if (!filas[0]) return res.status(404).json({ error: "Usuario no encontrado." });
        return res.status(200).json({ ok: true, user: filas[0] });
      } catch (error) {
        return responderErrorBD(res, error, "admin/users");
      }
    }

    // Restablecer contraseña desde el admin
    if (new_password !== undefined) {
      try {
        await asegurarEsquemaAdmin();
        const objetivo = await dbGet("SELECT is_admin FROM users WHERE id = ?", [uid]);
        if (!objetivo) return res.status(404).json({ error: "Usuario no encontrado." });
        const fallo = errorDeClave(new_password, !!objetivo.is_admin);
        if (fallo) return res.status(400).json({ error: fallo });
        await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [bcrypt.hashSync(new_password, 10), uid]);
        return res.status(200).json({ ok: true });
      } catch (error) {
        return responderErrorBD(res, error, "admin/users");
      }
    }

    // null/"" = vuelve a usar el 10% por defecto
    let rate = null;
    if (commission_rate !== null && commission_rate !== "" && commission_rate !== undefined) {
      rate = Number(commission_rate);
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({ error: "El porcentaje debe estar entre 0 y 100." });
      }
    }

    try {
      await dbRun("UPDATE users SET commission_rate = ? WHERE id = ?", [rate, uid]);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return responderErrorBD(res, error, "admin/users");
    }
  }

  res.status(405).end();
}
