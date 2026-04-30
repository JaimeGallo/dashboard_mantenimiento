-- =============================================================
-- Dashboard Mantenimiento Industrial — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- Tabla principal de registros
CREATE TABLE IF NOT EXISTS registros_mantenimiento (
  id          BIGSERIAL PRIMARY KEY,
  fecha       DATE NOT NULL,
  linea       TEXT NOT NULL,
  exec_min    NUMERIC DEFAULT 0,
  wait_min    NUMERIC DEFAULT 0,
  prod_min    NUMERIC DEFAULT 0,
  pct_mto     NUMERIC GENERATED ALWAYS AS (
                CASE WHEN prod_min > 0
                THEN (exec_min + wait_min) / prod_min * 100
                ELSE NULL END
              ) STORED,
  creado_en   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fecha, linea)
);

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_registros_fecha
  ON registros_mantenimiento (fecha);

-- Índice para consultas por línea
CREATE INDEX IF NOT EXISTS idx_registros_linea
  ON registros_mantenimiento (linea);

-- =============================================================
-- Row Level Security
-- Acceso público con anon key (sin autenticación de usuario)
-- =============================================================

ALTER TABLE registros_mantenimiento ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT público (anon key)
CREATE POLICY "public_select"
  ON registros_mantenimiento
  FOR SELECT
  TO anon
  USING (true);

-- Permitir INSERT público
CREATE POLICY "public_insert"
  ON registros_mantenimiento
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permitir UPDATE público (necesario para UPSERT)
CREATE POLICY "public_update"
  ON registros_mantenimiento
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
