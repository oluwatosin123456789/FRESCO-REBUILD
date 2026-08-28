'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CoverflowCarousel, type CoverflowSlide } from '@/components/shared/coverflow-carousel'
import { ROLE_AUTH_CONFIG, type RoleKey } from '@/components/auth/role-auth-config'

const ROLES: RoleKey[] = ['farmer', 'consumer', 'wema']

const PORTRAIT: Record<RoleKey, string> = {
  farmer: '/assets/cartoon-farmer-amaka.jpg',
  consumer: '/assets/cartoon-consumer-david.jpg',
  wema: '/assets/cartoon-wema-adebayo.jpg',
}

const META: Record<RoleKey, { label: string; value: string }[]> = {
  farmer: [
    { label: 'Sell', value: 'Produce listings' },
    { label: 'Track', value: 'Verified orders' },
    { label: 'Build', value: 'Financial Passport' },
  ],
  consumer: [
    { label: 'Shop', value: 'Fresh produce' },
    { label: 'Trust', value: 'Fresco scans' },
    { label: 'Pay', value: 'Escrow checkout' },
  ],
  wema: [
    { label: 'Review', value: 'Farmer passports' },
    { label: 'Decide', value: 'FEAP evidence' },
    { label: 'Lend', value: 'Working capital' },
  ],
}

const SLIDES: CoverflowSlide[] = ROLES.map((role) => {
  const cfg = ROLE_AUTH_CONFIG[role]
  return {
    src: PORTRAIT[role],
    alt: cfg.workspace,
    title: role.charAt(0).toUpperCase() + role.slice(1),
    subtitle: cfg.roleLabel,
    meta: META[role],
  }
})

export function LoginHub() {
  const [selected, setSelected] = useState(0)
  const cfg = ROLE_AUTH_CONFIG[ROLES[selected]]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--canvas)] px-5 py-12 font-sans antialiased">
      <p className="mb-8 text-[12px] font-medium text-[var(--ink-secondary)]">
        Choose your role to sign in
      </p>

      <div className="w-full max-w-[720px]">
        <CoverflowCarousel
          slides={SLIDES}
          showCaption
          showPagination
          showNavigation
          onChange={(index) => setSelected(index)}
          label="Choose your role"
        />
      </div>

      <Link
        href={cfg.loginPath}
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[14px] font-semibold text-[var(--ink-on-image)] transition-transform hover:-translate-y-0.5"
      >
        Continue to sign in <ArrowRight size={15} strokeWidth={2.2} />
      </Link>
    </div>
  )
}