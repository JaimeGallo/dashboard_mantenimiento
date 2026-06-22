import { getSql } from './db.js'

export async function fetchMonthDates() {
  const sql = getSql()
  return sql`
    SELECT fecha
    FROM registros_mantenimiento
    WHERE deleted_at IS NULL
    ORDER BY fecha ASC
  `
}

export async function fetchRegistros(start, end) {
  const sql = getSql()
  return sql`
    SELECT *
    FROM registros_mantenimiento
    WHERE deleted_at IS NULL
      AND fecha >= ${start}
      AND fecha <= ${end}
    ORDER BY fecha ASC, linea ASC
  `
}

export async function upsertRegistro({ fecha, linea, exec_min, wait_min, prod_min }) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO registros_mantenimiento (fecha, linea, exec_min, wait_min, prod_min, deleted_at)
    VALUES (
      ${fecha},
      ${linea},
      ${exec_min ?? 0},
      ${wait_min ?? 0},
      ${prod_min ?? 0},
      NULL
    )
    ON CONFLICT (fecha, linea) DO UPDATE SET
      exec_min = EXCLUDED.exec_min,
      wait_min = EXCLUDED.wait_min,
      prod_min = EXCLUDED.prod_min,
      deleted_at = NULL
    RETURNING *
  `
  return rows[0]
}

export async function softDeleteRegistro(id) {
  const sql = getSql()
  const rows = await sql`
    UPDATE registros_mantenimiento
    SET deleted_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `
  return rows.length > 0
}
