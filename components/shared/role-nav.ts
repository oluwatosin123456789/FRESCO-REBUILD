import type { ShellNavItem, ShellUser } from '@/components/shared/role-shell'

export const FARMER_USER: ShellUser = {
  name: 'Amaka Okafor',
  sub: 'Amaka Farms · Ikorodu',
  initials: 'AO',
  avatarGradient: 'linear-gradient(145deg,#607c4b 0%,#2a4930 100%)',
}

export const FARMER_NAV: ShellNavItem[] = [
  { key: 'home', label: 'Overview', icon: '📊', href: '/farmer' },
  { key: 'listings', label: 'Listings', icon: '🥬', href: '/farmer/produce' },
  { key: 'orders', label: 'Orders', icon: '📦', href: '/farmer/orders' },
  { key: 'passport', label: 'Passport', icon: '📋', href: '/farmer/passport' },
  { key: 'insights', label: 'AI Insights', icon: '✨', href: '/farmer/coach' },
  { key: 'consent', label: 'Consent', icon: '🛡', href: '/farmer/consent' },
  { key: 'finance', label: 'Finance', icon: '💳', href: '/farmer/finance' },
]

export const FARMER_TABS: ShellNavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', href: '/farmer' },
  { key: 'listings', label: 'Listings', icon: '🥬', href: '/farmer/produce' },
  { key: 'scan', label: 'Scan', icon: '📷', href: '/farmer/scan', cta: true },
  { key: 'orders', label: 'Orders', icon: '📦', href: '/farmer/orders' },
  { key: 'passport', label: 'Passport', icon: '📋', href: '/farmer/passport' },
]

export const CONSUMER_USER: ShellUser = {
  name: 'David Ade',
  sub: 'Ikorodu, Lagos',
  initials: 'DA',
  avatarGradient: 'linear-gradient(145deg,#6c9360 0%,#3c6843 100%)',
}

export const CONSUMER_NAV: ShellNavItem[] = [
  { key: 'home', label: 'Discover', icon: '🔍', href: '/consumer' },
  { key: 'browse', label: 'Browse', icon: '🥬', href: '/consumer/browse' },
  { key: 'cart', label: 'Cart', icon: '🛒', href: '/consumer/cart' },
  { key: 'orders', label: 'My orders', icon: '📦', href: '/consumer/orders' },
]

export const CONSUMER_TABS: ShellNavItem[] = [
  { key: 'home', label: 'Discover', icon: '🔍', href: '/consumer' },
  { key: 'browse', label: 'Browse', icon: '🥬', href: '/consumer/browse' },
  { key: 'cart', label: 'Cart', icon: '🛒', href: '/consumer/cart' },
  { key: 'orders', label: 'Orders', icon: '📦', href: '/consumer/orders' },
]

export const WEMA_USER: ShellUser = {
  name: 'K. Adebayo',
  sub: 'Agri Credit · Wema Bank',
  initials: 'KA',
  avatarGradient: 'linear-gradient(145deg,#4a4a4a 0%,#1c1c1c 100%)',
}

export const WEMA_NAV: ShellNavItem[] = [
  { key: 'overview', label: 'Overview', href: '/wema/portfolio' },
  { key: 'farmers', label: 'Farmers', href: '/wema/farmers', badge: 116 },
  { key: 'analytics', label: 'Analytics', href: '/wema/analytics' },
  { key: 'pipeline', label: 'Review Pipeline', href: '/wema/review-queue', badge: 5 },
  { key: 'reports', label: 'Reports', href: '/wema/reports' },
  { key: 'settings', label: 'Settings', href: '/wema/settings' },
]

export const WEMA_TABS: ShellNavItem[] = [
  { key: 'overview', label: 'Overview', icon: '📊', href: '/wema/portfolio' },
  { key: 'farmers', label: 'Farmers', icon: '👥', href: '/wema/farmers', badge: 116 },
  { key: 'analytics', label: 'Analytics', icon: '📈', href: '/wema/analytics' },
  { key: 'pipeline', label: 'Pipeline', icon: '✅', href: '/wema/review-queue', badge: 5 },
  { key: 'reports', label: 'Reports', icon: '📄', href: '/wema/reports' },
  { key: 'settings', label: 'Settings', icon: '⚙️', href: '/wema/settings' },
]
