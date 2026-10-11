-- Ejecuta esto UNA VEZ en Supabase: Dashboard → tu proyecto → SQL Editor
-- → New query → pega esto → Run.
-- Es seguro ejecutarlo aunque las tablas ya existan (usa IF NOT EXISTS),
-- no borra nada.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  wallet_balance INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by INTEGER,
  commission_rate NUMERIC,            -- % de comisión de referido propio; vacío = 10% por defecto
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Si la tabla users ya existía sin esta columna, la añade (no hace nada si ya está)
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate NUMERIC;

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  target_id TEXT,
  reviews_per_month INTEGER NOT NULL,
  setup_amount_cents INTEGER NOT NULL,
  monthly_amount_cents INTEGER NOT NULL,
  referred_by_code TEXT,
  status TEXT NOT NULL DEFAULT 'activa',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  guest_email TEXT,
  referred_by_code TEXT,
  subscription_id INTEGER REFERENCES subscriptions(id),
  type TEXT NOT NULL,
  package INTEGER NOT NULL,
  target_id TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_topups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completado',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_earnings (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES users(id),
  from_user_id INTEGER,
  from_email TEXT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Eventos de Stripe ya procesados (evita contar dos veces un pago si Stripe reintenta el aviso)
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
