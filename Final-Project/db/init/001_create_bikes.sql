-- db/init/001_create_bikes.sql
CREATE TABLE IF NOT EXISTS bikes (
  id BIGSERIAL PRIMARY KEY,

  -- Bike information 
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Pricing
  price_per_day DECIMAL(10, 2) NOT NULL,
  price_per_week DECIMAL(10, 2) NOT NULL,

  -- Bike type (city, mountain, cargo, sport, touring)
  bike_type VARCHAR(50) NOT NULL,

  -- Image URL
  image_url VARCHAR(500),

  -- Availability
  total_units INT NOT NULL DEFAULT 1,
  available_units INT NOT NULL DEFAULT 1,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_bikes_bike_type ON bikes (bike_type);
CREATE INDEX IF NOT EXISTS idx_bikes_is_active ON bikes (is_active);
