import {
  fetchMonthDates,
  fetchRegistros,
  upsertRegistro,
  softDeleteRegistro,
} from '../lib/registros-service.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(res, status, body) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v))
  res.setHeader('Content-Type', 'application/json')
  res.status(status).json(body)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v))
    return res.status(204).end()
  }

  try {
    if (req.method === 'GET') {
      if (req.query.action === 'months') {
        const rows = await fetchMonthDates()
        return json(res, 200, rows)
      }

      const { start, end } = req.query
      if (!start || !end) {
        return json(res, 400, { error: 'Parámetros start y end requeridos' })
      }

      const rows = await fetchRegistros(start, end)
      return json(res, 200, rows)
    }

    if (req.method === 'POST') {
      const { fecha, linea, exec_min, wait_min, prod_min } = req.body || {}
      if (!fecha || !linea) {
        return json(res, 400, { error: 'fecha y linea son obligatorios' })
      }

      const row = await upsertRegistro({ fecha, linea, exec_min, wait_min, prod_min })
      return json(res, 200, row)
    }

    if (req.method === 'PATCH') {
      const id = req.query.id
      if (!id) {
        return json(res, 400, { error: 'Parámetro id requerido' })
      }

      const deleted = await softDeleteRegistro(id)
      if (!deleted) {
        return json(res, 404, { error: 'Registro no encontrado' })
      }

      return json(res, 200, { ok: true })
    }

    return json(res, 405, { error: 'Método no permitido' })
  } catch (err) {
    console.error(err)
    return json(res, 500, { error: err.message || 'Error interno' })
  }
}
