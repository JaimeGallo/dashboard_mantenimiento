#!/usr/bin/env node
/**
 * Exporta registros_mantenimiento desde Supabase a neon/export-import.sql
 * Uso:
 *   npm run export:supabase
 *   npm run export:supabase -- --import   (importa directo a Neon si DATABASE_URL está en .env)
 */

import { writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PAGE_SIZE = 1000

async function loadSupabaseConfig() {
  const fromEnv = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
  }
  if (fromEnv.url && fromEnv.key) return fromEnv

  const configPath = resolve(ROOT, 'supabase-export.config.js')
  if (!existsSync(configPath)) {
    throw new Error(
      'Falta configuración. Crea supabase-export.config.js desde supabase-export.config.example.js ' +
      'o define SUPABASE_URL y SUPABASE_ANON_KEY en .env'
    )
  }

  const mod = await import(`file://${configPath.replace(/\\/g, '/')}`)
  return {
    url: mod.SUPABASE_URL,
    key: mod.SUPABASE_ANON_KEY,
  }
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function rowToValues(row) {
  const fecha = typeof row.fecha === 'string' ? row.fecha.split('T')[0] : row.fecha
  return `(${sqlLiteral(fecha)}, ${sqlLiteral(row.linea)}, ${row.exec_min ?? 0}, ${row.wait_min ?? 0}, ${row.prod_min ?? 0})`
}

async function fetchAllRows(url, key) {
  const rows = []
  let from = 0

  while (true) {
    const to = from + PAGE_SIZE - 1
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/registros_mantenimiento?select=fecha,linea,exec_min,wait_min,prod_min&order=fecha.asc,linea.asc`

    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${from}-${to}`,
        Prefer: 'count=exact',
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Supabase respondió ${res.status}: ${body}`)
    }

    const batch = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break

    rows.push(...batch)
    if (batch.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return rows
}

function buildSql(rows) {
  const header = `-- Exportado desde Supabase el ${new Date().toISOString()}
-- Registros activos (RLS oculta filas con deleted_at). Total: ${rows.length}
-- Ejecutar en Neon SQL Editor DESPUÉS de neon/schema.sql

`

  if (rows.length === 0) {
    return header + '-- Sin registros para importar.\n'
  }

  const chunks = []
  for (let i = 0; i < rows.length; i += 100) {
    const slice = rows.slice(i, i + 100)
    const values = slice.map(rowToValues).join(',\n  ')
    chunks.push(
      `INSERT INTO registros_mantenimiento (fecha, linea, exec_min, wait_min, prod_min)\nVALUES\n  ${values}\nON CONFLICT (fecha, linea) DO UPDATE SET\n  exec_min = EXCLUDED.exec_min,\n  wait_min = EXCLUDED.wait_min,\n  prod_min = EXCLUDED.prod_min,\n  deleted_at = NULL;`
    )
  }

  return header + chunks.join('\n\n') + '\n'
}

async function importToNeon(rows) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL no definida en .env')

  const sql = neon(databaseUrl)
  let imported = 0

  for (const row of rows) {
    const fecha = typeof row.fecha === 'string' ? row.fecha.split('T')[0] : row.fecha
    await sql`
      INSERT INTO registros_mantenimiento (fecha, linea, exec_min, wait_min, prod_min, deleted_at)
      VALUES (
        ${fecha},
        ${row.linea},
        ${row.exec_min ?? 0},
        ${row.wait_min ?? 0},
        ${row.prod_min ?? 0},
        NULL
      )
      ON CONFLICT (fecha, linea) DO UPDATE SET
        exec_min = EXCLUDED.exec_min,
        wait_min = EXCLUDED.wait_min,
        prod_min = EXCLUDED.prod_min,
        deleted_at = NULL
    `
    imported++
  }

  return imported
}

async function main() {
  const doImport = process.argv.includes('--import')
  const { url, key } = await loadSupabaseConfig()

  if (!url || !key || url.includes('xxxxxxxx')) {
    throw new Error('Configura SUPABASE_URL y SUPABASE_ANON_KEY antes de exportar')
  }

  console.log('Conectando a Supabase...')
  const rows = await fetchAllRows(url, key)
  console.log(`Registros obtenidos: ${rows.length}`)

  const outPath = resolve(ROOT, 'neon/export-import.sql')
  const sql = buildSql(rows)
  writeFileSync(outPath, sql, 'utf8')
  console.log(`SQL generado: ${outPath}`)

  if (doImport) {
    console.log('Importando en Neon...')
    const count = await importToNeon(rows)
    console.log(`Importados en Neon: ${count}`)
  } else {
    console.log('\nSiguiente paso:')
    console.log('  1. Abre Neon → SQL Editor')
    console.log('  2. Ejecuta neon/schema.sql (si aún no lo hiciste)')
    console.log('  3. Ejecuta neon/export-import.sql')
    console.log('\nO importa directo: npm run export:supabase -- --import')
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
