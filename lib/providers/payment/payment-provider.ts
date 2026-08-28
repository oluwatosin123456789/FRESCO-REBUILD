// Payment provider abstraction (Architecture §18, Claude §16)
// PAYMENT_PROVIDER=mock|wema

export type PaymentInput = {
  orderId: string
  amount: number
  consumerEmail: string
}

export type PaymentInitialization = {
  reference: string
  status: 'INITIATED' | 'PENDING'
  provider: string
  message: string
}

export type PaymentVerification = {
  reference: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  provider: string
}

export interface PaymentProvider {
  readonly name: string
  initializePayment(input: PaymentInput): Promise<PaymentInitialization>
  verifyPayment(reference: string): Promise<PaymentVerification>
}

const PAYMENT_REFERENCE_PREFIX = 'HLPAY'

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock'

  async initializePayment(input: PaymentInput): Promise<PaymentInitialization> {
    const reference = `${PAYMENT_REFERENCE_PREFIX}-${input.orderId.slice(0, 8).toUpperCase()}-${Date.now()}`
    return {
      reference,
      status: 'INITIATED',
      provider: this.name,
      message: 'Demo payment initialized. Verification is simulated by the demo provider.',
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    if (!reference.startsWith(PAYMENT_REFERENCE_PREFIX)) {
      return { reference, status: 'FAILED', provider: this.name }
    }
    return { reference, status: 'SUCCESS', provider: this.name }
  }
}

export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? 'mock'
  if (configured === 'wema') {
    // Real Wema integration would plug in here (Architecture ADR-005).
    return new MockPaymentProvider()
  }
  return new MockPaymentProvider()
}