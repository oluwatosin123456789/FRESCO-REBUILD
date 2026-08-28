/**
 * Pure quality-control helpers for the 3D runway.
 *
 * These are deliberately side-effect free (no DOM, no three, no timers) so the adaptive
 * resolution + idle policies can be unit tested, matching the pattern of the other pure
 * modules in lib/landing. The scene and the preview harness both consume these.
 */

/** Target per-frame budget in ms for a locked 60fps. */
export const FRAME_BUDGET_60 = 1000 / 60

/** Extra ms of headroom allowed before the watchdog treats a device as "too slow". */
export const SLOW_TOLERANCE_MS = 4

/** Number of frames over which the watchdog averages frame time. */
export const WATCHDOG_WINDOW = 60

/** First (warm-up) watchdog window: respond to an obviously slow device sooner. */
export const WATCHDOG_FIRST_WINDOW = 40

/** Pixel-ratio multipliers the watchdog steps through, high → low. */
export const PIXEL_RATIO_STEPS = [1, 0.9, 0.8, 0.7, 0.6] as const

export interface QualitySettings {
  /** Index into PIXEL_RATIO_STEPS. Higher = lower internal resolution. */
  pixelRatioStep: number
  /** Final fallback lever: drop real-time shadows entirely. */
  shadowsDisabled: boolean
}

export function initialQuality(): QualitySettings {
  return { pixelRatioStep: 0, shadowsDisabled: false }
}

/** The concrete pixel-ratio multiplier for a given step index, clamped. */
export function pixelRatioFor(step: number): number {
  const clamped = Math.max(0, Math.min(PIXEL_RATIO_STEPS.length - 1, Math.round(step)))
  return PIXEL_RATIO_STEPS[clamped]
}

/**
 * Decide the next quality setting from the achieved frame time.
 * Returns the same object identity when no change is needed, so callers can cheaply
 * skip work with a reference check.
 */
export function evaluateQuality(
  settings: QualitySettings,
  avgFrameTimeMs: number,
  budgetMs = FRAME_BUDGET_60,
  toleranceMs = SLOW_TOLERANCE_MS,
): QualitySettings {
  const over = avgFrameTimeMs > budgetMs + toleranceMs
  const under = avgFrameTimeMs < budgetMs - toleranceMs * 2

  if (over) {
    const maxStep = PIXEL_RATIO_STEPS.length - 1
    if (settings.pixelRatioStep < maxStep) {
      return { ...settings, pixelRatioStep: settings.pixelRatioStep + 1 }
    }
    if (!settings.shadowsDisabled) return { ...settings, shadowsDisabled: true }
    return settings
  }

  if (under && settings.shadowsDisabled) return { ...settings, shadowsDisabled: false }
  if (under && settings.pixelRatioStep > 0) {
    return { ...settings, pixelRatioStep: settings.pixelRatioStep - 1 }
  }
  return settings
}

/** How many consecutive frames to skip between renders while the scene is idle. */
export function idleFrameSkip(tier: number): number {
  if (tier <= 0) return 2
  if (tier === 1) return 1
  return 0
}
