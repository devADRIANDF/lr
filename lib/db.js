import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL;

let sql;
if (connectionString) {
  sql = postgres(connectionString, { ssl: 'require' });
}

function replacePlaceholders(query) {
  let count = 1;
  return query.replace(/\?/g, () => `$${count++}`);
}

export async function dbGet(queryText, params = []) {
  if (!sql) throw new Error("No hay DATABASE_URL configurada");
  const formattedQuery = replacePlaceholders(queryText);
  const rows = await sql.unsafe(formattedQuery, params);
  return rows[0] || null;
}

export async function dbAll(queryText, params = []) {
  if (!sql) throw new Error("No hay DATABASE_URL configurada");
  const formattedQuery = replacePlaceholders(queryText);
  return await sql.unsafe(formattedQuery, params);
}

function esInsert(query) {
  return /^\s*insert/i.test(query);
}

export async function dbRun(queryText, params = []) {
  if (!sql) throw new Error("No hay DATABASE_URL configurada");
  let formattedQuery = replacePlaceholders(queryText);
  if (esInsert(formattedQuery) && !/returning/i.test(formattedQuery)) {
    formattedQuery += " RETURNING id";
  }
  const rows = await sql.unsafe(formattedQuery, params);
  return {
    lastInsertRowid: rows[0]?.id !== undefined ? Number(rows[0].id) : undefined,
    changes: rows.count,
    rows,
  };
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