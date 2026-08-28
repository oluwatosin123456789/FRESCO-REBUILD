// Fresco provider abstraction (Architecture §16, Claude §15)
// FRESCO_PROVIDER=mock|real
// Fresco contributes quality intelligence · never financial decisions.

export type FrescoAnalyzeInput = {
  imageUrl: string
  hint?: string
}

export type FrescoAnalysis = {
  produceType: string
  freshnessScore: number
  estimatedShelfLifeDays: number
  confidence: number
  qualityLabel: string
  analysisSummary?: string
  provider: string
  isFallback: boolean
}

export interface FrescoProvider {
  readonly name: string
  analyze(input: FrescoAnalyzeInput): Promise<FrescoAnalysis>
}

const FALLBACK_RESULTS: Array<Omit<FrescoAnalysis, 'provider' | 'isFallback'>> = [
  {
    produceType: 'tomato',
    freshnessScore: 91,
    estimatedShelfLifeDays: 4,
    confidence: 0.94,
    qualityLabel: 'Fresh',
    analysisSummary: 'Firm texture, vibrant color, low blemish count. Suitable for same-week dispatch.',
  },
  {
    produceType: 'leafy green',
    freshnessScore: 84,
    estimatedShelfLifeDays: 3,
    confidence: 0.88,
    qualityLabel: 'Good',
    analysisSummary: 'Good visual quality. Physical inspection recommended before dispatch.',
  },
  {
    produceType: 'root vegetable',
    freshnessScore: 88,
    estimatedShelfLifeDays: 7,
    confidence: 0.9,
    qualityLabel: 'Fresh',
    analysisSummary: 'Dense texture with minimal surface defects. Strong shelf-life estimate.',
  },
]

export class MockFrescoProvider implements FrescoProvider {
  readonly name = 'mock'

  async analyze(input: FrescoAnalyzeInput): Promise<FrescoAnalysis> {
    const hint = (input.hint ?? '').toLowerCase()
    const base =
      FALLBACK_RESULTS.find((r) => r.produceType.split(' ')[0].includes(hint) || hint.includes(r.produceType.split(' ')[0])) ??
      FALLBACK_RESULTS[Math.floor(Math.random() * FALLBACK_RESULTS.length)]
    return {
      ...base,
      provider: this.name,
      isFallback: true,
    }
  }
}

export class RealFrescoProvider implements FrescoProvider {
  readonly name = 'real'

  async analyze(input: FrescoAnalyzeInput): Promise<FrescoAnalysis> {
    const baseUrl = process.env.FRESCO_BASE_URL
    if (!baseUrl) throw new Error('FRESCO_BASE_URL is not configured')
    const response = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.FRESCO_API_KEY ? { Authorization: `Bearer ${process.env.FRESCO_API_KEY}` } : {}),
      },
      body: JSON.stringify({ imageUrl: input.imageUrl, hint: input.hint }),
    })
    if (!response.ok) throw new Error(`Fresco service returned ${response.status}`)
    const result = (await response.json()) as {
      produceType: string
      freshnessScore: number
      estimatedShelfLifeDays: number
      confidence: number
      qualityLabel?: string
      analysisSummary?: string
    }
    return {
      produceType: result.produceType,
      freshnessScore: result.freshnessScore,
      estimatedShelfLifeDays: result.estimatedShelfLifeDays,
      confidence: result.confidence,
      qualityLabel: result.qualityLabel ?? 'Fresh',
      analysisSummary: result.analysisSummary,
      provider: this.name,
      isFallback: false,
    }
  }
}

export function getFrescoProvider(): FrescoProvider {
  const configured = process.env.FRESCO_PROVIDER ?? 'mock'
  return configured === 'real' ? new RealFrescoProvider() : new MockFrescoProvider()
}