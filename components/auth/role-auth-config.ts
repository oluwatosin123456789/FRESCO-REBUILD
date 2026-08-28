import { Sprout, ShoppingBag, Landmark, type LucideIcon } from 'lucide-react'

export type RoleKey = 'farmer' | 'consumer' | 'wema'
export type AuthMode = 'login' | 'signup'

export type RoleAuthConfig = {
  role: RoleKey
  workspace: string
  roleLabel: string
  icon: LucideIcon
  iconBg: string
  destination: string
  loginPath: string
  signupPath: string
  accent: string
  accentDark: string
  ring: string
  shadow: string
  glowOrb: [string, string]
  formBg: string
  formEyebrow: { login: string; signup: string }
  visual: { image: string; title: string; sub: string; gradient: [string, string] }
  demo: { name: string; sub: string; email: string; password: string }
  signupFields: { key: string; label: string; placeholder: string }[]
  signupNote: string
}

export const ROLE_AUTH_CONFIG: Record<RoleKey, RoleAuthConfig> = {
  farmer: {
    role: 'farmer',
    workspace: 'Farmer Workspace',
    roleLabel: 'Verified Grower Network',
    icon: Sprout,
    iconBg: 'linear-gradient(135deg,#315642 0%,#4a6b52 100%)',
    destination: '/farmer',
    loginPath: '/farmer/login',
    signupPath: '/farmer/signup',
    accent: '#315642',
    accentDark: '#223a2e',
    ring: 'rgba(49,86,66,.16)',
    shadow: 'rgba(49,86,66,.24)',
    glowOrb: ['rgba(49,86,66,.30)', 'rgba(200,168,75,.24)'],
    formBg: '#ffffff',
    formEyebrow: {
      login: 'Sign in to your Farmer Workspace',
      signup: 'Start turning verified harvest into financial identity',
    },
    visual: {
      image: '/assets/auth-visual-farmer.jpg',
      title: 'Your harvest, verified.',
      sub: 'Every crate becomes an economic record Wema can read.',
      gradient: ['rgba(49,86,66,.16)', 'rgba(15,28,21,.46)'],
    },
    demo: {
      name: 'Amaka Okafor',
      sub: 'Amaka Farms · Ikorodu, Lagos',
      email: 'amaka@fresco.demo',
      password: '12345678',
    },
    signupFields: [
      { key: 'farmName', label: 'Farm / Business Name', placeholder: 'Amaka Farms' },
      { key: 'location', label: 'Farm Location', placeholder: 'Ikorodu, Lagos' },
      { key: 'primaryProduce', label: 'Primary Produce', placeholder: 'Tomatoes' },
    ],
    signupNote: 'By creating an account you agree to our terms and privacy policy.',
  },
  consumer: {
    role: 'consumer',
    workspace: 'Consumer Marketplace',
    roleLabel: 'Verified Produce Market',
    icon: ShoppingBag,
    iconBg: 'linear-gradient(135deg,#4a6b52 0%,#6c9360 100%)',
    destination: '/consumer',
    loginPath: '/consumer/login',
    signupPath: '/consumer/signup',
    accent: '#4a6b52',
    accentDark: '#35503d',
    ring: 'rgba(74,107,82,.16)',
    shadow: 'rgba(74,107,82,.22)',
    glowOrb: ['rgba(74,107,82,.28)', 'rgba(49,86,66,.20)'],
    formBg: '#ffffff',
    formEyebrow: {
      login: 'Sign in to the Consumer Marketplace',
      signup: 'Start shopping produce that carries its own quality report',
    },
    visual: {
      image: '/assets/auth-visual-consumer.jpg',
      title: 'Fresh from the farm.',
      sub: 'Verified produce with freshness, shelf life and a farm you can trust.',
      gradient: ['rgba(74,107,82,.14)', 'rgba(11,36,20,.44)'],
    },
    demo: {
      name: 'David Ade',
      sub: 'Verified Buyer · Ikorodu, Lagos',
      email: 'david@fresco.demo',
      password: '12345678',
    },
    signupFields: [
      { key: 'deliveryLocation', label: 'Delivery Location', placeholder: 'Ikorodu, Lagos' },
    ],
    signupNote: 'By creating an account you agree to our terms and privacy policy.',
  },
  wema: {
    role: 'wema',
    workspace: 'Wema Institutional Portal',
    roleLabel: 'Agricultural Credit Intelligence',
    icon: Landmark,
    iconBg: 'linear-gradient(135deg,#2a2a26 0%,#1a1a18 100%)',
    destination: '/wema',
    loginPath: '/wema/login',
    signupPath: '/wema/signup',
    accent: '#171713',
    accentDark: '#000000',
    ring: 'rgba(23,23,19,.14)',
    shadow: 'rgba(23,23,19,.26)',
    glowOrb: ['rgba(200,168,75,.28)', 'rgba(23,23,19,.16)'],
    formBg: '#ffffff',
    formEyebrow: {
      login: 'Sign in to the Agricultural Credit Intelligence portal',
      signup: 'Request institutional access to the credit intelligence portal',
    },
    visual: {
      image: '/assets/auth-visual-wema.jpg',
      title: 'Underwrite with evidence.',
      sub: 'Consent-gated passports and deterministic FEAP, not guesswork.',
      gradient: ['rgba(23,23,19,.2)', 'rgba(0,0,0,.46)'],
    },
    demo: {
      name: 'K. Adebayo',
      sub: 'Agri-Credit Desk · Wema Bank PLC',
      email: 'wema@fresco.demo',
      password: '12345678',
    },
    signupFields: [
      { key: 'institution', label: 'Institution', placeholder: 'Wema Bank PLC' },
      { key: 'desk', label: 'Desk / Team', placeholder: 'Agri-Credit Desk' },
    ],
    signupNote: 'Institutional access is simulated in this environment. By creating an account you agree to our terms.',
  },
}

export function getRoleAuthConfig(role: RoleKey): RoleAuthConfig {
  return ROLE_AUTH_CONFIG[role]
}