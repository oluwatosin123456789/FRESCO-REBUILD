export type World = 'warm' | 'deep'

export interface NavItem {
  label: string
  id?: string
  href?: string
}

export interface RunwayStage {
  index: string
  name: string
  eyebrow: string
  headline: [string, string]
  copy: string
  world: World
  cta?: string
}

export interface Product {
  name: string
  unit: string
  price: string
  freshness: number
  shelfLife: string
  label: string
  batch: string
}

export interface HowItWorksStep {
  index: string
  name: string
  description: string
}

export interface MethodologyFactor {
  factor: string
  weight: number
  contribution: number
  hint: string
}

export interface FeapSimulation {
  label: string
  from: string
  to: string
  simulatedScore: number
}

export interface Story {
  quote: string
  name: string
  role: string
  proof: string
  initials: string
  portrait?: string
}

export interface TrustLayer {
  layer: string
  meaning: string
}

export interface OpportunityStackCard {
  step: string
  eyebrow: string
  value: string
  label: string
  caption: string
  reasons: readonly string[]
}

export const navigation: readonly NavItem[] = [
  { label: 'How It Works', id: 'how' },
  { label: 'The Team', href: '/team' },
  { label: 'Stories', id: 'stories' },
]

export const stages: readonly RunwayStage[] = [
  {
    index: '01',
    name: 'THE FIELD',
    eyebrow: 'Amaka Farms · Ikorodu, Lagos',
    headline: ['From Harvest', 'to Opportunity'],
    copy: 'Fresh harvest turns into verified economic records.',
    world: 'warm',
    cta: 'Follow the harvest',
  },
  {
    index: '02',
    name: 'THE SCAN',
    eyebrow: 'Fresco Quality AI',
    headline: ['The Tomato', 'Knows Its Worth'],
    copy: 'Instant scan reads freshness, shelf life, and grade.',
    world: 'warm',
  },
  {
    index: '03',
    name: 'THE MARKET',
    eyebrow: 'The Marketplace',
    headline: ['Every Sale', 'Is a Signal'],
    copy: 'Verified order placed and recorded on-chain.',
    world: 'warm',
  },
  {
    index: '04',
    name: 'THE DELIVERY',
    eyebrow: 'Fresco Logistics',
    headline: ['The Harvest', 'Arrives Certain'],
    copy: 'Order collected, in transit, payout settled.',
    world: 'deep',
  },
]

export const systemEvents = [
  'Fresco verified · Tomatoes · 92% freshness',
  'Order confirmed · HVL-ORD-100047',
  'Passport updated · FEAP 78',
  'Consent granted · Wema · 3 scopes',
  'Opportunity surfaced · Working Capital · Verified',
] as const

export const products: readonly Product[] = [
  { name: 'Premium Tomatoes', unit: 'crate', price: 'N12,500', freshness: 92, shelfLife: '5 days', label: 'Premium', batch: 'TOM-2026-030' },
  { name: 'Sun-Ripened Tomatoes', unit: 'crate', price: 'N13,800', freshness: 95, shelfLife: '6 days', label: 'Premium', batch: 'TOM-2026-034' },
  { name: 'Heirloom Tomatoes', unit: 'crate', price: 'N15,200', freshness: 91, shelfLife: '4 days', label: 'Select', batch: 'TOM-2026-036' },
  { name: 'Beefsteak Tomatoes', unit: 'crate', price: 'N14,600', freshness: 89, shelfLife: '5 days', label: 'Select', batch: 'TOM-2026-039' },
  { name: 'Fresh Peppers', unit: 'basket', price: 'N8,200', freshness: 88, shelfLife: '7 days', label: 'Excellent', batch: 'PEP-2026-014' },
  { name: 'Sweet Bell Peppers', unit: 'basket', price: 'N9,400', freshness: 93, shelfLife: '8 days', label: 'Premium', batch: 'PEP-2026-017' },
  { name: 'Scotch Bonnet Peppers', unit: 'basket', price: 'N6,800', freshness: 90, shelfLife: '6 days', label: 'Excellent', batch: 'PEP-2026-019' },
  { name: 'Garden Greens', unit: 'bunch', price: 'N3,400', freshness: 90, shelfLife: '3 days', label: 'Premium', batch: 'GRN-2026-021' },
  { name: 'Ugu Leaves', unit: 'bunch', price: 'N2,900', freshness: 94, shelfLife: '2 days', label: 'Excellent', batch: 'GRN-2026-024' },
  { name: 'Fresh Spinach', unit: 'bunch', price: 'N3,100', freshness: 92, shelfLife: '3 days', label: 'Select', batch: 'GRN-2026-027' },
  { name: 'Sweet Onions', unit: 'bunch', price: 'N5,600', freshness: 89, shelfLife: '14 days', label: 'Premium', batch: 'ONI-2026-011' },
  { name: 'Red Onions', unit: 'bunch', price: 'N6,200', freshness: 91, shelfLife: '12 days', label: 'Select', batch: 'ONI-2026-013' },
  { name: 'White Yams', unit: 'tubers', price: 'N15,900', freshness: 94, shelfLife: '21 days', label: 'Premium', batch: 'YAM-2026-008' },
  { name: 'Water Yam', unit: 'tubers', price: 'N13,400', freshness: 92, shelfLife: '18 days', label: 'Select', batch: 'YAM-2026-012' },
  { name: 'Ripe Plantains', unit: 'bunch', price: 'N7,800', freshness: 88, shelfLife: '5 days', label: 'Excellent', batch: 'PLA-2026-015' },
  { name: 'Green Plantains', unit: 'bunch', price: 'N7,100', freshness: 86, shelfLife: '7 days', label: 'Select', batch: 'PLA-2026-018' },
]

export const howItWorksSteps: readonly HowItWorksStep[] = [
  { index: '01', name: 'Scan', description: 'Photograph produce. Fresco returns freshness, shelf life and quality.' },
  { index: '02', name: 'Sell', description: 'List verified produce. Buyers see evidence and order.' },
  { index: '03', name: 'Grow', description: 'Fulfilled transactions strengthen the Financial Passport, FEAP and Profile Maturity.' },
  { index: '04', name: 'Finance', description: 'With consent, Wema sees the verified record and can surface order-linked working capital.' },
]

export const passport = {
  score: 78,
  maturity: 85,
  maturityTier: 'Established',
  metrics: [
    '46 verified orders',
    'N2.1M+ lifetime revenue',
    '96% fulfillment',
    '4.8/5 reputation',
    '29 repeat customers',
    '14 active months',
  ] as const,
  timeline: ['First order', '10th order', 'First repeat customer', 'N1M revenue reached', 'FEAP 78'] as const,
  consent: 'Shared with Wema Bank · 3 scopes',
}

export const methodology: readonly MethodologyFactor[] = [
  { factor: 'Transaction consistency', weight: 30, contribution: 24, hint: 'Consistent verified order volume' },
  { factor: 'Revenue consistency', weight: 20, contribution: 16, hint: 'Steady verified revenue growth' },
  { factor: 'Fulfillment reliability', weight: 15, contribution: 14, hint: 'Completed orders without disputes' },
  { factor: 'Customer reputation', weight: 15, contribution: 11, hint: 'Buyer ratings and repeat demand' },
  { factor: 'Quality consistency', weight: 10, contribution: 7, hint: 'Fresco-verified quality levels' },
  { factor: 'Business longevity', weight: 10, contribution: 6, hint: 'Active verified trading months' },
]

export type PassportStageTone = 'warm' | 'green'

export interface PassportStage {
  label: string
  title: string
  copy: string
  tone: PassportStageTone
  artifact: string
  value: string
}

export const passportStages: readonly PassportStage[] = [
  {
    label: 'The Score',
    title: 'A deterministic financial identity.',
    copy: 'FEAP · Farmer Economic Activity Profile · is a transparent 0–100 score computed from verified business records. No opaque model. No hidden weights.',
    tone: 'warm',
    artifact: 'FEAP SCORE',
    value: '78 / 100',
  },
  {
    label: 'Transactions',
    title: 'Every verified order counts.',
    copy: 'Consistent order volume is the strongest signal. 46 verified orders build a foundation of economic activity that financiers can read.',
    tone: 'warm',
    artifact: '46 ORDERS',
    value: '+24 POINTS',
  },
  {
    label: 'Revenue',
    title: 'Steady growth, clearly measured.',
    copy: 'Revenue consistency rewards sustained economic output. N2.1M+ lifetime revenue demonstrates a business that compounds over time.',
    tone: 'warm',
    artifact: 'N2.1M+',
    value: '+16 POINTS',
  },
  {
    label: 'Fulfillment',
    title: 'Delivered means delivered.',
    copy: 'Completed orders without disputes prove reliability. 96% fulfillment is the difference between a promise and a record.',
    tone: 'green',
    artifact: '96% FULFILLMENT',
    value: '+14 POINTS',
  },
  {
    label: 'Reputation',
    title: 'Trust is earned, then counted.',
    copy: 'Buyer ratings and repeat demand form a reputation layer. 4.8/5 average rating and 29 repeat customers signal real market confidence.',
    tone: 'green',
    artifact: '4.8/5 RATING',
    value: '+11 POINTS',
  },
  {
    label: 'Quality & Time',
    title: 'Consistency compounds.',
    copy: 'Verified quality levels and active trading months reward longevity. Fresco-verified produce quality paired with 14 active months builds a durable profile.',
    tone: 'green',
    artifact: '14 MONTHS',
    value: '+13 POINTS',
  },
] as const

export const feapSimulations: readonly FeapSimulation[] = [
  { label: 'Improve fulfillment', from: '96%', to: '98%', simulatedScore: 79 },
  { label: 'Increase repeat customers', from: '29', to: '35', simulatedScore: 80 },
  { label: 'Maintain quality consistency', from: '90%+', to: '95%+', simulatedScore: 80 },
]

export const feapNextActions = [
  'Improve fulfillment consistency',
  'Increase repeat customers',
  'Maintain verified quality',
  'Build transaction consistency',
] as const

export const growthCoach = {
  label: 'Growth Coach',
  insight:
    'Tomato demand ↑22% this week · peak demand Friday–Saturday. Fulfillment is strong, but inventory is limiting orders — consider increasing supply ahead of the weekend.',
} as const

export const consentScopes = ['Order History', 'Quality History', 'Revenue History'] as const
export const consentRecipient = 'Wema Bank'

export const auditSeed = [
  ['10:42:03', 'Consent granted · Wema Bank · 3 scopes'],
  ['10:40:17', 'Consent reviewed by Amaka Okafor'],
  ['09:58:12', 'Passport updated · FEAP 78'],
] as const



export const explainability = {
  title: 'Why this opportunity surfaced',
  sections: ['Verified transaction activity', 'Fulfillment reliability', 'Recent revenue activity', 'Configured rule match'] as const,
  closing: 'No AI generated the financial recommendation. The opportunity was surfaced by deterministic rules applied to verified records.',
} as const

export const trustLayers: readonly TrustLayer[] = [
  { layer: 'Verified', meaning: 'Fresco quality evidence' },
  { layer: 'Recorded', meaning: 'Marketplace transaction' },
  { layer: 'Aggregated', meaning: 'Financial Passport' },
  { layer: 'Controlled', meaning: 'Farmer consent' },
  { layer: 'Explained', meaning: 'Wema opportunity rationale' },
]

export const trustClosing =
  'Not a credit score. Not a loan engine. The marketplace creates the evidence; consent controls the access.'

export const stories: readonly Story[] = [
  {
    quote: 'Before Fresco, my business was just crates and cash. Now it is a record.',
    name: 'Amaka Okafor',
    role: 'Farmer, Amaka Farms · Ikorodu',
    proof: 'FEAP 78 · 46 orders',
    initials: 'AO',
    portrait: '/assets/farmer-portrait.svg',
  },
  {
    quote: 'I buy tomatoes that carry their own quality report. Fresco means I do not have to take anyone\'s word for it.',
    name: 'David Ade',
    role: 'Consumer · Ikorodu',
    proof: '23 repeat orders',
    initials: 'DA',
    portrait: '/assets/consumer-portrait.svg',
  },
  {
    quote: 'Fresco is not a replacement for our banking products. It is a channel that brings us verified agricultural businesses we could not otherwise see.',
    name: 'K. Adebayo',
    role: 'Agri Credit · Wema Bank PLC',
    proof: '1 consent · 1 opportunity',
    initials: 'KA',
    portrait: '/assets/analyst-portrait.svg',
  },
  {
    quote: 'I used to lend on trust alone. Now the record does the remembering · 46 verified orders, 44 delivered.',
    name: 'Ngozi Eze',
    role: 'Market Trader · Bodija',
    proof: '44 fulfilled orders',
    initials: 'NE',
    portrait: '/assets/trader-portrait.svg',
  },
  {
    quote: 'Fresher produce, shorter routes. The system matches supply to demand before the load starts losing weight.',
    name: 'Chidi Nwosu',
    role: 'Logistics Partner · Oyo',
    proof: '92% freshness samples',
    initials: 'CN',
    portrait: '/assets/logistics-portrait.svg',
  },
  {
    quote: 'We onboarded 14 farmers in one month. Each one walks in with a passport, not a promise.',
    name: 'Olamide Adeyemi',
    role: 'Cooperative Lead · Ogun',
    proof: '14 farmers onboarded',
    initials: 'OA',
    portrait: '/assets/cooperative-portrait.svg',
  },
]

export const newsletter = {
  eyebrow: 'The Harvest Letter',
  copy: 'Monthly dispatches from the market floor: verified pricing, farmer stories, and what verified commerce means for access to finance.',
  placeholder: 'Enter your email',
  buttonLabel: 'Subscribe',
  watermark: 'Pure Harvest',
} as const

export const opportunityTeaser = {
  eyebrow: 'The Opportunity',
  headline: 'Make the invisible legible · without making it extractable.',
  copy: "Scroll through Amaka's verified account · each card is one fact of her story, and the last card shows how a confirmed order becomes a financing opportunity. No AI generated the recommendation · deterministic rules on verified records did.",
  stack: [
    {
      step: '01',
      eyebrow: 'Amaka Farms · Ikorodu, Lagos',
      value: '44',
      label: 'completed orders',
      caption: 'Every fulfilled order is one verified economic event. Her account starts with the record of what she has already delivered.',
      reasons: [],
    },
    {
      step: '02',
      eyebrow: 'Amaka Farms · Ikorodu, Lagos',
      value: '96%',
      label: 'fulfillment',
      caption: 'Orders completed without dispute. Reliability, measured · not promised.',
      reasons: [],
    },
    {
      step: '03',
      eyebrow: 'Amaka Farms · Ikorodu, Lagos',
      value: 'N1.2M',
      label: 'recent revenue',
      caption: 'Recent revenue activity, recorded and structured for interpretation.',
      reasons: [],
    },
    {
      step: '04',
      eyebrow: 'Confirmed order · HVL-ORD-100052',
      value: 'N150,000',
      label: 'Potential working-capital need',
      caption: 'Her confirmed order of ₦500,000 needs working capital to produce, harvest and deliver. With consent, it appears in the Wema dashboard as an order-financing opportunity.',
      reasons: [...explainability.sections],
    },
  ] as readonly OpportunityStackCard[],
} as const

export const wemaDashboard = {
  eyebrow: 'Wema analyst view',
  headline: 'A business a banker · can actually read',
  copy: "On the Wema side, Fresco is an institutional dashboard. Analysts see the network at a glance, then open any farmer's verified profile — revenue, fulfillment, reputation and quality — instead of a name and a balance.",
  pipeline: { value: '24', n: 24, label: 'Potential opportunities' },
  aggregate: {
    eyebrow: 'Wema · Agricultural Credit Engine',
    title: 'Network overview',
    stats: [
      { value: '1,240', n: 1240, label: 'Active farmers' },
      { value: '₦48M', n: 48, label: 'Marketplace GMV' },
      { value: '312', n: 312, label: 'Verified businesses' },
      { value: '96', n: 96, label: 'Consented businesses' },
    ],
  },
  opportunity: {
    eyebrow: 'Order-linked working capital · illustrative',
    value: 'Up to ₦350K',
    reasons: ['Verified order pipeline', 'Strong fulfillment history', 'Deterministic rule match'],
    disclaimer: 'Opportunity signals, not approvals. Wema runs its own risk and eligibility assessment.',
  },
  profile: {
    eyebrow: 'Farmer profile · opened by analyst',
    name: 'Amaka Farms',
    meta: 'Ikorodu, Lagos · 14 active months',
    feap: '78',
    feapN: 78,
    maturity: '85% · Established',
    rows: [
      { label: 'Lifetime revenue', value: '₦2.1M+' },
      { label: 'Completed orders', value: '44' },
      { label: 'Fulfillment', value: '96%' },
      { label: 'Customer rating', value: '4.8/5' },
      { label: 'Quality consistency', value: '91%' },
      { label: 'Repeat customers', value: '29' },
    ],
  },
} as const

export const canonical = {
  verifiedOrders: 46,
  completedOrders: 44,
  lifetimeRevenue: 'N2.1M+',
  fulfillmentRate: '96%',
  averageRating: '4.8/5',
  feapScore: 78,
  maturityTier: 'Established',
  repeatCustomers: 29,
  activeMonths: 14,
  sampleFreshness: '92%',
  sampleShelfLife: '5 days',
  sampleConfidence: '0.91',
  sampleQualityLabel: 'Premium',
  sampleBatch: 'TOM-2026-030',
  sampleOrderId: 'HVL-ORD-100047',
  sampleOrderValue: 'N12,500',
  illustrativeOpportunity: 'Up to N350,000',
  recentRevenueForOpportunity: 'N1.2M',
  repeatOrderCount: 23,
} as const

export const seo = {
  title: 'Fresco · From Harvest to Opportunity | Verified Farmer Commerce',
  description:
    'Fresco turns agricultural commerce into financial identity through Fresco-verified produce, a farmer-owned Financial Passport, deterministic FEAP scoring and explainable opportunity discovery.',
} as const

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Fresco',
      url: 'https://fresco.example',
      slogan: 'From Harvest to Opportunity',
      description: seo.description,
    },
    {
      '@type': 'WebSite',
      name: 'Fresco',
      url: 'https://fresco.example',
    },
    {
      '@type': 'ItemList',
      name: 'Fresco verified produce listings',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        description: `${product.label} ${product.name} · ${product.price} per ${product.unit}`,
      })),
    },
  ],
} as const
