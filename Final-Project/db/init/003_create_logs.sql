-- db/init/003_create_logs.sql
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,

  -- Activity details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'bike', 'order', 'auth'
  entity_id BIGINT,
  description TEXT,

  -- User who performed the action
  user_id BIGINT REFERENCES users(id),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'error', 'warning'

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for quick queries
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs (user_id);
CREATE INDEX IF NOT EXISTS idx_logs_entity_type ON logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_logs_action ON logs (action);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at);
