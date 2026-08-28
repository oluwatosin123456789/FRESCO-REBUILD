// The one screening profile Wema runs against Fresco activity today.
// Thresholds are Wema's to configure; Fresco only assembles the evidence.

export const WEMA_AGRI_01 = {
  key: 'WEMA-AGRI-01',
  version: '1.0',
  illustrative: true,
} as const

export type ScreeningProfile = typeof WEMA_AGRI_01