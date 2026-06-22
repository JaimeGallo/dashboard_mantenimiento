import { API_URL } from './config.js'

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok) {
    const message = body?.error || res.statusText || 'Error de red'
    return { data: null, error: { message } }
  }

  return { data: body, error: null }
}

export async function fetchMonthDates() {
  return request('/api/registros?action=months')
}

export async function fetchRegistros(start, end) {
  const params = new URLSearchParams({ start, end })
  return request(`/api/registros?${params}`)
}

export async function upsertRegistro(record) {
  return request('/api/registros', {
    method: 'POST',
    body: JSON.stringify(record),
  })
}

export async function softDeleteRegistro(id) {
  return request(`/api/registros?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
  })
}
