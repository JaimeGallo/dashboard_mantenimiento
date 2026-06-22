import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  fetchMonthDates,
  fetchRegistros,
  upsertRegistro,
  softDeleteRegistro,
} from './lib/registros-service.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/registros', async (req, res) => {
  try {
    if (req.query.action === 'months') {
      const rows = await fetchMonthDates()
      return res.json(rows)
    }

    const { start, end } = req.query
    if (!start || !end) {
      return res.status(400).json({ error: 'Parámetros start y end requeridos' })
    }

    const rows = await fetchRegistros(start, end)
    return res.json(rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Error interno' })
  }
})

app.post('/api/registros', async (req, res) => {
  try {
    const { fecha, linea, exec_min, wait_min, prod_min } = req.body || {}
    if (!fecha || !linea) {
      return res.status(400).json({ error: 'fecha y linea son obligatorios' })
    }

    const row = await upsertRegistro({ fecha, linea, exec_min, wait_min, prod_min })
    return res.json(row)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Error interno' })
  }
})

app.patch('/api/registros', async (req, res) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: 'Parámetro id requerido' })
    }

    const deleted = await softDeleteRegistro(id)
    if (!deleted) {
      return res.status(404).json({ error: 'Registro no encontrado' })
    }

    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Error interno' })
  }
})

app.use(express.static(__dirname))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard escuchando en http://0.0.0.0:${PORT}`)
})
