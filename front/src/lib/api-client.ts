const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

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

/**
 * Fetch autenticado que usa cookies HttpOnly gerenciados pelo backend.
 * O navegador envia os cookies automaticamente via `credentials: 'include'`.
 * Não adiciona o header Authorization manualmente.
 */
export async function authFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith("http://") || path.startsWith("https://") ? path : buildApiUrl(path)

  return fetch(url, {
    ...options,
    credentials: 'include',
  })
}

export { API_BASE_URL }
