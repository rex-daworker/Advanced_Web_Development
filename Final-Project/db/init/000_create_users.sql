-- db/init/000_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,

  -- Basic identity data
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,

  -- Used as login identifier
  email VARCHAR(320) NOT NULL,

  -- Store only password hash, never plaintext password
  password_hash TEXT NOT NULL,

  -- Keep roles simple and controlled
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'manager', 'administrator')),

  -- Account lifecycle
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional soft-delete support
  deleted_at TIMESTAMPTZ NULL
);

-- Email must be unique case-insensitively
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_ci
ON users (LOWER(email));

-- Optional helper index for filtering active users
CREATE INDEX IF NOT EXISTS idx_users_is_active
ON users (is_active);
