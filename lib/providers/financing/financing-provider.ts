// Financing provider abstraction (Architecture §14, §18, Claude §17)
// Prototype ends at SUBMITTED / UNDER_REVIEW. No real underwriting.

export type FinancingRequestInput = {
  farmerId: string
  orderId?: string
  requestedAmount: number
  purpose?: string
}

export type FinancingResponse = {
  status: 'SUBMITTED' | 'UNDER_REVIEW'
  message: string
  provider: string
}

export interface FinancingProvider {
  readonly name: string
  submitFinanceRequest(input: FinancingRequestInput): Promise<FinancingResponse>
}

export class MockFinancingProvider implements FinancingProvider {
  readonly name = 'mock'

  async submitFinanceRequest(input: FinancingRequestInput): Promise<FinancingResponse> {
    return {
      status: 'UNDER_REVIEW',
      message: `Demo financing request for ₦${input.requestedAmount.toLocaleString()} submitted to the Wema demo queue. Final eligibility is determined by the financial institution.`,
      provider: this.name,
    }
  }
}

export function getFinancingProvider(): FinancingProvider {
  return new MockFinancingProvider()
}