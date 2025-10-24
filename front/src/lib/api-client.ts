const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "")

export function buildApiUrl(path = ""): string {
  if (!path) {
    return API_BASE_URL
  }

  const normalizedPath = path.replace(/^\/+/, "")
  return `${API_BASE_URL}/${normalizedPath}`
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith("http://") || path.startsWith("https://") ? path : buildApiUrl(path)
  return fetch(url, options)
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith("http://") || path.startsWith("https://") ? path : buildApiUrl(path)

  // Obtém o token do localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  // Adiciona o token aos headers se existir
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

export { API_BASE_URL }
