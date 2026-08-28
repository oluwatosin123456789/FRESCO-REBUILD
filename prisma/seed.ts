// Fresco demo seed (PRD §20, Architecture §35, Agents §26)
// Run: pnpm db:seed
// NOTE: demo accounts must also exist in Supabase Auth with the same emails
// (amaka@fresco.demo / david@fresco.demo / wema@fresco.demo).

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role, ProduceStatus, OrderStatus, PaymentStatus, ConsentStatus, OpportunityType, OpportunityStatus } from './../lib/generated/prisma/client'
import { calculateFeap } from '../lib/domain/passport/feap'
import { calculateProfileMaturity } from '../lib/domain/passport/maturity'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }) })

const NAIROBI_NOW = Date.now()
const DAY = 24 * 60 * 60 * 1000
const daysAgo = (d: number) => new Date(NAIROBI_NOW - d * DAY)

async function main() {
  console.log('🌱 Seeding Fresco demo data...')

  // ── Users ────────────────────────────────────────────────────────────
  const amaka = await prisma.user.upsert({
    where: { email: 'amaka@fresco.demo' },
    update: {},
    create: {
      email: 'amaka@fresco.demo',
      name: 'Amaka Okafor',
      phone: '+2348012345678',
      role: Role.FARMER,
    },
  })
  const david = await prisma.user.upsert({
    where: { email: 'david@fresco.demo' },
    update: {},
    create: {
      email: 'david@fresco.demo',
      name: 'David Ade',
      role: Role.CONSUMER,
    },
  })
  await prisma.user.upsert({
    where: { email: 'wema@fresco.demo' },
    update: {},
    create: {
      email: 'wema@fresco.demo',
      name: 'Wema Demo Analyst',
      role: Role.WEMA_ANALYST,
    },
  })

  // ── Farmer profile (Amaka Farms, Ikorodu, tomatoes) ───────────────────
  const farmer = await prisma.farmerProfile.upsert({
    where: { userId: amaka.id },
    update: {},
    create: {
      userId: amaka.id,
      farmName: 'Amaka Farms',
      location: 'Ikorodu',
      latitude: 6.5946,
      longitude: 3.5074,
      primaryProduce: 'Tomatoes',
    },
  })

  // ── Produce + Fresco scans ───────────────────────────────────────────
  const produceSpecs = [
    { name: 'Premium Roma Tomatoes', category: 'Vegetables', quantity: 60, unit: 'crate', price: 18500, days: 30 },
    { name: 'Beefsteak Tomatoes', category: 'Vegetables', quantity: 40, unit: 'crate', price: 21000, days: 22 },
    { name: 'Fresh Cherry Tomatoes', category: 'Vegetables', quantity: 35, unit: 'crate', price: 16500, days: 14 },
    { name: 'Yellow Peppers', category: 'Vegetables', quantity: 25, unit: 'crate', price: 14000, days: 7 },
  ]

  for (const spec of produceSpecs) {
    const scan = await prisma.produceScan.create({
      data: {
        farmerId: farmer.id,
        imageUrl: `/placeholder.svg`,
        detectedProduce: spec.name.toLowerCase(),
        freshnessScore: 88 + ((spec.days % 7) * 2),
        estimatedShelfLifeDays: 4 + (spec.days % 3),
        confidence: 0.9 + ((spec.days % 5) * 0.01),
        qualityLabel: 'Fresh',
        analysisSummary: `Sample analysis for ${spec.name}.`,
        provider: 'mock',
        createdAt: daysAgo(spec.days - 1),
      },
    })
    await prisma.produce.create({
      data: {
        farmerId: farmer.id,
        name: spec.name,
        category: spec.category,
        quantity: spec.quantity,
        unit: spec.unit,
        price: spec.price,
        status: ProduceStatus.LISTED,
        imageUrl: `/placeholder.svg`,
        description: `Fresh ${spec.name.toLowerCase()} from Amaka Farms, Ikorodu. Fresco quality verified.`,
        batchId: `TOM-2026-${String(spec.days).padStart(3, '0')}`,
        frescoScanId: scan.id,
        createdAt: daysAgo(spec.days),
      },
    })
  }

  // ── Historical orders (30-50 completed orders per Architecture §35) ───
  const consumerPool = [
    { user: david, name: 'David Ade' },
  ]
  const produceRows = await prisma.produce.findMany({ orderBy: { createdAt: 'asc' } })
  for (let i = 1; i <= 46; i++) {
    const listing = produceRows[0]
    const quantity = 1 + (i % 5)
    const total = (listing?.price ?? 18500) * quantity
    const isCompleted = i <= 44
    const isPaid = i <= 45
    const created = daysAgo(i * 2)
    const reference = `HVL-ORD-${String(100000 + i)}`

    const order = await prisma.order.create({
      data: {
        reference,
        consumerId: consumerPool[0].user.id,
        farmerId: farmer.id,
        subtotal: total,
        deliveryFee: 1000,
        total: total + 1000,
        paymentStatus: isPaid ? PaymentStatus.SUCCESS : PaymentStatus.PENDING,
        status: isCompleted ? OrderStatus.COMPLETED : isPaid ? OrderStatus.PAID : OrderStatus.PENDING_PAYMENT,
        createdAt: created,
        completedAt: isCompleted ? new Date(created.getTime() + DAY) : null,
        items: {
          create: [
            {
              produceId: listing.id,
              quantity,
              unitPrice: listing.price,
              total,
            },
          ],
        },
        payment: isPaid
          ? {
              create: {
                provider: 'mock',
                reference: `HLPAY-SEED-${i}`,
                amount: total + 1000,
                status: PaymentStatus.SUCCESS,
                createdAt: created,
              },
            }
          : undefined,
      },
    })

    if (isCompleted) {
      await prisma.review.create({
        data: {
          orderId: order.id,
          farmerId: farmer.id,
          consumerId: consumerPool[0].user.id,
          rating: i % 6 === 0 ? 4 : 5,
          comment: i % 6 === 0 ? 'Good quality, delivery a little late.' : 'Very fresh tomatoes. Will buy again.',
          createdAt: new Date(created.getTime() + DAY * 2),
        },
      })
    }
  }

  // ── Financial Passport (derived from records) ────────────────────────
  const scans = await prisma.produceScan.findMany({ where: { farmerId: farmer.id } })
  const reviews = await prisma.review.findMany({ where: { farmerId: farmer.id } })
  const orders = await prisma.order.findMany({ where: { farmerId: farmer.id } })
  const completed = orders.filter((o) => o.status === OrderStatus.COMPLETED)
  const lifetimeRevenue = completed.reduce((sum, o) => sum + o.total, 0)
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const quality = scans.length ? scans.reduce((sum, s) => sum + s.freshnessScore, 0) / scans.length : 0

  const feap = calculateFeap({
    transactionConsistency: Math.min(100, orders.length * 2),
    revenueConsistency: Math.min(100, Math.log10(1 + lifetimeRevenue) * 8),
    fulfillmentReliability: 96,
    customerReputation: avgRating * 20,
    qualityConsistency: quality,
    businessLongevity: 14 * 5,
  })
  const maturity = calculateProfileMaturity({
    identityCompleteness: 100,
    verifiedTransactions: Math.min(100, orders.length * 2),
    activityDuration: 70,
    fulfillmentHistory: 96,
    customerFeedback: avgRating * 20,
    produceQualityHistory: quality,
  })

  await prisma.financialPassport.upsert({
    where: { farmerId: farmer.id },
    update: {},
    create: {
      farmerId: farmer.id,
      lifetimeRevenue,
      recentRevenue: lifetimeRevenue * 0.25,
      transactionCount: orders.length,
      completedOrders: completed.length,
      fulfillmentRate: Math.round((completed.length / orders.length) * 100),
      customerCount: 1,
      repeatCustomerCount: 0,
      averageRating: Math.round(avgRating * 10) / 10,
      qualityConsistency: Math.round(quality * 10) / 10,
      activeMonths: 14,
      feap,
      profileMaturity: maturity,
    },
  })

  // ── Consent (Amaka consents to Wema — this powers the demo journey) ───
  await prisma.consent.upsert({
    where: { id: 'seed-consent-wema' },
    update: {},
    create: {
      id: 'seed-consent-wema',
      farmerId: farmer.id,
      institution: 'Wema Bank',
      scopes: ['TRANSACTION_HISTORY', 'REVENUE_HISTORY', 'FULFILLMENT_HISTORY', 'QUALITY_HISTORY', 'CUSTOMER_REPUTATION', 'FEAP', 'PROFILE_MATURITY'],
      status: ConsentStatus.GRANTED,
      grantedAt: daysAgo(20),
    },
  })

  // ── Wema opportunities (deterministic engine on seeded data) ─────────
  await prisma.wemaOpportunity.createMany({
    data: [
      {
        farmerId: farmer.id,
        type: OpportunityType.WORKING_CAPITAL,
        recommendedAmount: 600000,
        rationale: 'Consistent order volume and high fulfillment indicate a potential working-capital need.',
        triggerMetrics: 'Completed orders: 44 (>= 30); Fulfillment rate: 96% (>= 90%); Recent revenue above threshold',
        status: OpportunityStatus.ACTIVE,
      },
      {
        farmerId: farmer.id,
        type: OpportunityType.BUSINESS_ACCOUNT,
        rationale: 'Established activity profile with 14 months of verified history.',
        triggerMetrics: 'Profile maturity: 84 (>= 70); Active months: 14 (>= 3)',
        status: OpportunityStatus.ACTIVE,
      },
      {
        farmerId: farmer.id,
        type: OpportunityType.PAYMENT_COLLECTION,
        rationale: 'Recurring transaction flow with returning customers.',
        triggerMetrics: 'Transactions: 46 (>= 10)',
        status: OpportunityStatus.ACTIVE,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed complete.')
  console.log('   Demo accounts (create in Supabase Auth, same emails):')
  console.log('   amaka@fresco.demo  → FARMER (Amaka Farms, Ikorodu, Tomatoes)')
  console.log('   david@fresco.demo  → CONSUMER (David Ade, Ikorodu)')
  console.log('   wema@fresco.demo   → WEMA_ANALYST (Wema Demo Analyst)')
  console.log('   FEAP:', feap, '| Maturity:', maturity, '| Orders:', orders.length, '| Revenue: ₦' + lifetimeRevenue.toLocaleString())
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })