// Lightweight client-side API helper. All validation/authorization stays server-side.

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const payload = (await response.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } }
    | null

  if (!response.ok || !payload?.success) {
    const message = payload && 'error' in payload ? payload.error.message : 'Request failed'
    throw new Error(message)
  }
  return payload.data
}

export const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`