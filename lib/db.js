import { neon } from '@neondatabase/serverless'

function normalizeDatabaseUrl(raw) {
  if (!raw) throw new Error('DATABASE_URL no configurada')

  let url = raw.trim()
  // Si pegaron el snippet completo de Neon: psql 'postgresql://...'
  url = url.replace(/^psql\s+/i, '')
  url = url.replace(/^['"]|['"]$/g, '')

  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    throw new Error(
      'DATABASE_URL debe ser solo la URL postgresql://... (sin psql ni comillas)'
    )
  }

  return url
}

export function getSql() {
  return neon(normalizeDatabaseUrl(process.env.DATABASE_URL))
}
