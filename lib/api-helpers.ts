import { NextResponse } from 'next/server'
import { AppError, toAppError } from '@/lib/api'
import { logger } from '@/lib/logger'

export function handle<T>(handler: () => Promise<T>) {
  return handler().then(
    (data) => NextResponse.json({ success: true, data }),
    (error: unknown) => {
      const appError = toAppError(error)
      if (!(error instanceof AppError)) {
        logger.error('API_ERROR', { message: appError.message })
      }
      return NextResponse.json(
        { success: false, error: { code: appError.code, message: appError.message, issues: appError.issues } },
        { status: appError.status },
      )
    },
  )
}

export function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ success: false, error: { code: 'AUTH_REQUIRED', message } }, { status: 401 })
}