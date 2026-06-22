-- =============================================================
-- Dashboard Mantenimiento Industrial — Schema Neon
-- Ejecutar en: Neon Console → SQL Editor
-- =============================================================

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
  deleted_at  TIMESTAMPTZ NULL,
  UNIQUE(fecha, linea)
);

CREATE INDEX IF NOT EXISTS idx_registros_fecha
  ON registros_mantenimiento (fecha);

CREATE INDEX IF NOT EXISTS idx_registros_linea
  ON registros_mantenimiento (linea);

CREATE INDEX IF NOT EXISTS idx_registros_deleted_at
  ON registros_mantenimiento (deleted_at)
  WHERE deleted_at IS NULL;
