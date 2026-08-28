export type ApiError = {
  code: string
  message: string
  issues?: unknown[]
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public issues?: unknown[],
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function fail(code: string, message: string, issues?: unknown[]): ApiResponse<never> {
  return { success: false, error: { code, message, issues } }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  const message = error instanceof Error ? error.message : 'Unexpected error'
  return new AppError('INTERNAL_ERROR', message, 500)
}