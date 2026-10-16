import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL;

let sql;
let errorUrl = null;
if (connectionString) {
  try {
    // connect_timeout: si la base de datos no responde, falla pronto con un aviso claro
    // en vez de dejar la petición colgada.
    sql = postgres(connectionString, { ssl: 'require', connect_timeout: 10 });
  } catch (e) {
    // Una DATABASE_URL mal escrita (p. ej. con un @ sin codificar en la contraseña) no debe
    // tumbar todas las rutas al importarse: se guarda el error y se avisa al usarla.
    errorUrl = e;
    console.error("[db] DATABASE_URL no es válida:", e.message);
  }
}

// ¿Hay variable de conexión? (no comprueba que funcione)
export function bdConfigurada() {
  return !!connectionString;
}

function requerirSql() {
  if (sql) return sql;
  if (errorUrl) {
    const e = new Error("DATABASE_URL no es válida");
    e.code = "URL_INVALIDA";
    throw e;
  }
  throw new Error("No hay DATABASE_URL configurada");
}

function replacePlaceholders(query) {
  let count = 1;
  return query.replace(/\?/g, () => `$${count++}`);
}

export async function dbGet(queryText, params = []) {
  const conexion = requerirSql();
  const formattedQuery = replacePlaceholders(queryText);
  const rows = await conexion.unsafe(formattedQuery, params);
  return rows[0] || null;
}

export async function dbAll(queryText, params = []) {
  const conexion = requerirSql();
  const formattedQuery = replacePlaceholders(queryText);
  return await conexion.unsafe(formattedQuery, params);
}

function esInsert(query) {
  return /^\s*insert/i.test(query);
}

export async function dbRun(queryText, params = []) {
  const conexion = requerirSql();
  let formattedQuery = replacePlaceholders(queryText);
  if (esInsert(formattedQuery) && !/returning/i.test(formattedQuery)) {
    formattedQuery += " RETURNING id";
  }
  const rows = await conexion.unsafe(formattedQuery, params);
  return {
    lastInsertRowid: rows[0]?.id !== undefined ? Number(rows[0].id) : undefined,
    changes: rows.count,
    rows,
  };
}

// La columna que marca a los administradores se añade sola si la base de datos es anterior
// a las cuentas de admin: así no hace falta volver a ejecutar schema.sql a mano.
// Una vez hecho, no vuelve a tocar nada hasta el próximo arranque.
let columnaAdmin = null;
export function asegurarEsquemaAdmin() {
  if (!columnaAdmin) {
    columnaAdmin = (async () => {
      const ya = await dbGet(
        "SELECT 1 AS ok FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'is_admin'"
      );
      if (!ya) await dbRun("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE");
    })().catch((e) => {
      columnaAdmin = null; // si falló (sin conexión, sin tablas...), la próxima petición lo reintenta
      throw e;
    });
  }
  return columnaAdmin;
}

// Traduce un fallo de la base de datos a un aviso que entienda quien administra la web
// (los textos mencionan la variable o el paso exacto que hay que tocar).
export function describirErrorBD(e) {
  const msg = String(e?.message || "");
  const code = e?.code;

  if (/No hay DATABASE_URL/.test(msg)) {
    return {
      status: 503,
      code: "SIN_BD",
      mensaje: "La base de datos no está conectada: falta la variable DATABASE_URL en Vercel.",
      arreglo: "Supabase → Connect → Transaction pooler → copia la URI. Vercel → Settings → Environment Variables → añade DATABASE_URL con esa URI → Redeploy.",
    };
  }
  if (code === "URL_INVALIDA") {
    return {
      status: 503,
      code: "BD_URL_INVALIDA",
      mensaje: "La variable DATABASE_URL tiene un formato no válido.",
      arreglo: "Copia otra vez la URI del Transaction pooler de Supabase. Si la contraseña lleva @ # / : ? o %, cámbiala por una solo con letras y números.",
    };
  }
  if (code === "42P01") {
    return {
      status: 503,
      code: "SIN_TABLAS",
      mensaje: "La base de datos está conectada, pero faltan las tablas.",
      arreglo: "Supabase → SQL Editor → New query → pega el contenido de schema.sql → Run.",
    };
  }
  if (code === "42703") {
    return {
      status: 503,
      code: "BD_ESQUEMA",
      mensaje: "A la base de datos le falta alguna columna nueva.",
      arreglo: "Supabase → SQL Editor → pega de nuevo el contenido de schema.sql → Run (es seguro repetirlo).",
    };
  }
  if (code === "28P01" || code === "28000" || /tenant or user not found|password authentication failed/i.test(msg)) {
    return {
      status: 503,
      code: "BD_CREDENCIALES",
      mensaje: "La base de datos rechazó la conexión: el usuario o la contraseña de DATABASE_URL no son correctos.",
      arreglo: "Copia la URI del Transaction pooler de Supabase (el usuario empieza por postgres.) y cambia [YOUR-PASSWORD] por la contraseña real de la base de datos.",
    };
  }
  if (
    ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN", "CONNECT_TIMEOUT", "CONNECTION_CLOSED", "CONNECTION_ENDED", "CONNECTION_DESTROYED"].includes(code)
  ) {
    return {
      status: 503,
      code: "BD_CONEXION",
      mensaje: "No se pudo conectar con la base de datos.",
      arreglo: "Revisa que DATABASE_URL sea la URI del Transaction pooler de Supabase y que el proyecto de Supabase no esté pausado.",
    };
  }
  return { status: 500, code: "BD_ERROR", mensaje: "Error consultando la base de datos.", arreglo: "Mira los registros (Logs) del despliegue en Vercel para ver el detalle." };
}

// Responde con el aviso claro y deja el detalle real en los registros de Vercel
export function responderErrorBD(res, error, contexto = "") {
  const d = describirErrorBD(error);
  console.error(`[bd${contexto ? ":" + contexto : ""}]`, error);
  if (res.headersSent) return;
  return res.status(d.status).json({ error: d.mensaje, code: d.code, arreglo: d.arreglo });
}

const db = {
  prepareAndGet: dbGet,
  prepareAndAll: dbAll,
  prepareAndRun: dbRun,
  get: dbGet,
  all: dbAll,
  run: dbRun
};

export default db;
