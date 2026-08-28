type LogLevel = 'info' | 'warn' | 'error'

function write(level: LogLevel, event: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    event,
    ts: new Date().toISOString(),
    ...meta,
  })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => write('info', event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => write('warn', event, meta),
  error: (event: string, meta?: Record<string, unknown>) => write('error', event, meta),
}