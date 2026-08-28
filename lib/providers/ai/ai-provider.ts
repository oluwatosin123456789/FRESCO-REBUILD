// AI provider abstraction (Architecture §17, Claude §14)
// AI explains and recommends; it never approves or rejects financing.
// AI_PROVIDER=openai|fallback · every AI call has a deterministic fallback.

export type FarmerInsightInput = {
  farmerName: string
  farmName: string
  revenue: number
  recentRevenue: number
  salesTrend: string
  orderCount: number
  fulfillmentRate: number
  repeatCustomerCount: number
  qualityConsistency: number
  produceCategories: string[]
}

export type FarmerInsight = {
  summary: string
  recommendations: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }>
  provider: string
  isFallback: boolean
}

export interface AIProvider {
  readonly name: string
  generateFarmerInsights(input: FarmerInsightInput): Promise<FarmerInsight>
}

export class FallbackAIProvider implements AIProvider {
  readonly name = 'fallback'

  async generateFarmerInsights(input: FarmerInsightInput): Promise<FarmerInsight> {
    const recommendations: FarmerInsight['recommendations'] = []

    if (input.fulfillmentRate >= 90 && input.orderCount >= 20) {
      recommendations.push({
        title: 'Increase inventory before peak demand',
        description: `Your fulfillment rate is strong (${input.fulfillmentRate.toFixed(0)}%). Consider increasing available quantity before peak periods to convert more demand into completed orders.`,
        priority: 'high',
      })
    }
    if (input.repeatCustomerCount >= 5) {
      recommendations.push({
        title: 'Reward repeat customers',
        description: `${input.repeatCustomerCount} customers have ordered more than once. A loyalty approach can raise repeat purchase frequency.`,
        priority: 'medium',
      })
    }
    if (input.qualityConsistency >= 85) {
      recommendations.push({
        title: 'Highlight Fresco quality history',
        description: `Quality consistency is ${input.qualityConsistency.toFixed(0)}%. Surface this in your listings to strengthen buyer trust.`,
        priority: 'medium',
      })
    }
    if (input.recentRevenue < input.revenue * 0.2) {
      recommendations.push({
        title: 'Revisit pricing and availability',
        description: 'Recent revenue is below your lifetime pace. Review listing quantity and price positioning for the current week.',
        priority: 'low',
      })
    }
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Keep listings fresh',
        description: 'Regular Fresco scans and updated quantities keep your marketplace presence credible.',
        priority: 'low',
      })
    }

    return {
      summary: `${input.farmName} shows ${input.orderCount} orders with a ${input.fulfillmentRate.toFixed(0)}% fulfillment rate and ${input.qualityConsistency.toFixed(0)}% quality consistency.`,
      recommendations,
      provider: this.name,
      isFallback: true,
    }
  }
}

export class OpenAIAIProvider implements AIProvider {
  readonly name = 'openai'

  async generateFarmerInsights(input: FarmerInsightInput): Promise<FarmerInsight> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

    const prompt = `You are the Fresco farmer coach. Using ONLY the structured facts below, write a brief farmer business summary and 2-3 practical recommendations.
Facts:
- Farmer: ${input.farmerName} (${input.farmName})
- Lifetime revenue: ₦${input.revenue.toLocaleString()}
- Recent revenue: ₦${input.recentRevenue.toLocaleString()} (trend: ${input.salesTrend})
- Orders: ${input.orderCount}, fulfillment: ${input.fulfillmentRate.toFixed(1)}%
- Repeat customers: ${input.repeatCustomerCount}
- Quality consistency: ${input.qualityConsistency.toFixed(1)}%
- Produce categories: ${input.produceCategories.join(', ') || 'n/a'}

Rules: never claim loan approval, guaranteed financing, or creditworthiness. Do not invent numbers.
Respond with strict JSON: {"summary": "...", "recommendations": [{"title": "...", "description": "...", "priority": "high|medium|low"}]}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`)
    const payload = (await response.json()) as {
      choices: Array<{ message: { content: string } }>
    }
    const parsed = JSON.parse(payload.choices[0]?.message?.content ?? '{}') as FarmerInsight
    return {
      summary: parsed.summary ?? '',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      provider: this.name,
      isFallback: false,
    }
  }
}

export function getAIProvider(): AIProvider {
  return process.env.AI_PROVIDER === 'openai' ? new OpenAIAIProvider() : new FallbackAIProvider()
}