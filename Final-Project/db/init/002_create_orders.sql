-- db/init/002_create_orders.sql
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,

  -- Foreign keys
  user_id BIGINT NOT NULL REFERENCES users(id),
  bike_id BIGINT NOT NULL REFERENCES bikes(id),

  -- Order details
  quantity INT NOT NULL DEFAULT 1,
  rental_duration_days INT NOT NULL,

  -- Pricing
  total_price DECIMAL(10, 2) NOT NULL,

  -- Rental period
  rental_start_date DATE NOT NULL,
  rental_end_date DATE NOT NULL,

  -- Order status (pending, confirmed, active, completed, cancelled)
  status VARCHAR(50) NOT NULL DEFAULT 'pending',

  -- Special notes/requests
  special_requests TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_bike_id ON orders (bike_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_rental_dates ON orders (rental_start_date, rental_end_date);
