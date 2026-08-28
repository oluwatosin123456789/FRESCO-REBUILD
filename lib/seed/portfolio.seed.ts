// Seeded demo data for the Wema portfolio · the exact figures the design
// calls for, so the surface is deterministic on stage and in the preview.
//
// Swap this module for a real query layer later: the service only reads the
// shapes below, so nothing else in the app knows (or cares) where they come
// from.

export const HOUR = 3_600_000
export const DAY = 24 * HOUR

export type SeedConsent = 'ACTIVE' | 'PARTIAL' | 'REVOKED'

export type SeedRow = {
  farmerId: string
  name: string
  farmName: string
  location: string
  crops: string
  feap: number
  volume: number
  completedOrders: number
  acceptedOrders: number
  fulfillmentRate: number
  consent: SeedConsent
  consentVersion: string
  withheldCount: number
  activeMonths: number
  agoMs: number
}

export const SEED_ROWS: SeedRow[] = [
  {
    farmerId: 'f-okafor',
    name: 'Amaka Okafor',
    farmName: 'Okafor Family Farm',
    location: 'Ikorodu, Lagos',
    crops: 'Tomatoes, Pepper',
    feap: 79,
    volume: 1_850_000,
    completedOrders: 127,
    acceptedOrders: 135,
    fulfillmentRate: 94,
    consent: 'ACTIVE',
    consentVersion: '1.2',
    withheldCount: 0,
    activeMonths: 8,
    agoMs: 2 * HOUR,
  },
  {
    farmerId: 'f-eze',
    name: 'Chidi Eze',
    farmName: 'Greenfield Produce',
    location: 'Epe, Lagos',
    crops: 'Cucumber',
    feap: 58,
    volume: 340_000,
    completedOrders: 31,
    acceptedOrders: 34,
    fulfillmentRate: 91,
    consent: 'ACTIVE',
    consentVersion: '1.0',
    withheldCount: 0,
    activeMonths: 5,
    agoMs: 1 * DAY,
  },
  {
    farmerId: 'f-adeyemi',
    name: 'Ngozi Adeyemi',
    farmName: 'Adeyemi Farms',
    location: 'Badagry, Lagos',
    crops: 'Tomatoes, Pepper, Cucumber',
    feap: 84,
    volume: 3_100_000,
    completedOrders: 209,
    acceptedOrders: 218,
    fulfillmentRate: 96,
    consent: 'ACTIVE',
    consentVersion: '1.1',
    withheldCount: 0,
    activeMonths: 11,
    agoMs: 4 * HOUR,
  },
  {
    farmerId: 'f-bakare',
    name: 'Tunde Bakare',
    farmName: 'Bakare Agro',
    location: 'Ikorodu, Lagos',
    crops: 'Maize',
    feap: 41,
    volume: 186_000,
    completedOrders: 18,
    acceptedOrders: 22,
    fulfillmentRate: 83,
    consent: 'PARTIAL',
    consentVersion: '1.0',
    withheldCount: 2,
    activeMonths: 4,
    agoMs: 3 * DAY,
  },
  {
    farmerId: 'f-yusuf',
    name: 'Fatima Yusuf',
    farmName: 'Yusuf Gardens',
    location: 'Ojo, Lagos',
    crops: 'Green vegetables',
    feap: 67,
    volume: 620_000,
    completedOrders: 54,
    acceptedOrders: 61,
    fulfillmentRate: 89,
    consent: 'ACTIVE',
    consentVersion: '1.2',
    withheldCount: 0,
    activeMonths: 6,
    agoMs: 6 * HOUR,
  },
  {
    farmerId: 'f-obi',
    name: 'Emeka Obi',
    farmName: 'Obi Fresh',
    location: 'Epe, Lagos',
    crops: 'Pepper',
    feap: 72,
    volume: 940_000,
    completedOrders: 78,
    acceptedOrders: 85,
    fulfillmentRate: 92,
    consent: 'REVOKED',
    consentVersion: '1.0',
    withheldCount: 0,
    activeMonths: 9,
    agoMs: 12 * DAY,
  },
]

export const SEED_METRICS = {
  registeredFarmers: 342,
  activeThisMonth: 218,
  transactions: 4187,
  transactionVolume: 68_400_000,
  consentedProfiles: 214,
  awaitingReview: 12,
}

// Six months of completed-order volume, oldest first. In naira.
export const SEED_VOLUME_NAIRA = [
  7_200_000,
  8_100_000,
  9_600_000,
  11_400_000,
  14_200_000,
  17_900_000,
]

export const SEED_BANDS = [
  { band: 'Emerging', count: 61 },
  { band: 'Building', count: 74 },
  { band: 'Developing', count: 89 },
  { band: 'Established', count: 87 },
  { band: 'Strong', count: 31 },
]

export const SEED_SCREENING = {
  key: 'WEMA-AGRI-01',
  version: '1.0',
  illustrative: true,
} as const