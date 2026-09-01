export class ApiError extends Error {
  status: number
  details?: Record<string, string[]>

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (response.status === 204) return undefined as T

  const body = await response.json()
  if (!response.ok) throw new ApiError(body.error ?? 'Something went wrong', response.status, body.details)
  return body as T
}
