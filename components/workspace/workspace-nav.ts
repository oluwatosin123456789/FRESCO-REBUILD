import type { WorkspaceNavItem, WorkspaceTab, WorkspaceUser } from './workspace-shell'

export const FARMER_WORKSPACE_USER: WorkspaceUser = {
  name: 'Amaka Okafor',
  sub: 'Amaka Farms · Ikorodu',
  initials: 'AO',
  notification: 4,
  avatarGradient: 'linear-gradient(145deg,#607c4b 0%,#2a4930 100%)',
  avatarUrl: '/assets/avatar-farmer-amaka.jpg',
}

export const CONSUMER_WORKSPACE_USER: WorkspaceUser = {
  name: 'David Ade',
  sub: 'Ikorodu, Lagos',
  initials: 'DA',
  avatarGradient: 'linear-gradient(145deg,#6c9360 0%,#3c6843 100%)',
  avatarUrl: '/assets/avatar-consumer-david.jpg',
}

export const WEMA_WORKSPACE_USER: WorkspaceUser = {
  name: 'K. Adebayo',
  sub: 'Agri Credit · Wema Bank',
  initials: 'KA',
  avatarGradient: 'linear-gradient(145deg,#4a4a4a 0%,#1c1c1c 100%)',
  avatarUrl: '/assets/avatar-wema-adebayo.jpg',
}

export const CONSUMER_NAV: WorkspaceNavItem[] = [
  { key: 'discover', label: 'Discover', href: '/consumer' },
  { key: 'browse', label: 'Browse', href: '/consumer/browse' },
  { key: 'cart', label: 'My Cart', href: '/consumer/cart' },
  { key: 'orders', label: 'Orders', href: '/consumer/orders' },
]

export const CONSUMER_TABS: WorkspaceTab[] = [
  { key: 'discover', label: 'Discover', icon: '🔍', href: '/consumer' },
  { key: 'browse', label: 'Browse', icon: '🥬', href: '/consumer/browse', cta: true },
  { key: 'cart', label: 'Cart', icon: '🛒', href: '/consumer/cart' },
  { key: 'orders', label: 'Orders', icon: '📦', href: '/consumer/orders' },
]

export const WEMA_NAV: WorkspaceNavItem[] = [
  { key: 'overview', label: 'Overview', href: '/wema' },
  { key: 'farmers', label: 'Farmers', href: '/wema/farmers', badge: 116 },
  { key: 'analytics', label: 'Analytics', href: '/wema/analytics' },
  { key: 'pipeline', label: 'Review Pipeline', href: '/wema/review-queue', badge: 5 },
  { key: 'reports', label: 'Reports', href: '/wema/reports' },
  { key: 'settings', label: 'Settings', href: '/wema/settings' },
]

export const WEMA_TABS: WorkspaceTab[] = [
  { key: 'overview', label: 'Overview', icon: '📊', href: '/wema' },
  { key: 'farmers', label: 'Farmers', icon: '👥', href: '/wema/farmers' },
  { key: 'pipeline', label: 'Review', icon: '✅', href: '/wema/review-queue', cta: true },
  { key: 'reports', label: 'Reports', icon: '📄', href: '/wema/reports' },
  { key: 'settings', label: 'Settings', icon: '⚙️', href: '/wema/settings' },
]