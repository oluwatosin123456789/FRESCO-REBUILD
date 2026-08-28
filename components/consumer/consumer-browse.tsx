'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/frame-ui'
import { ProductTile } from './product-tile'
import { useCatalog } from './consumer-store'

const FILTERS = [
  { k: 'all', label: 'All' },
  { k: 'verified', label: 'Fresco verified' },
  { k: 'near', label: 'Nearby' },
  { k: 'under', label: 'Under ₦600' },
] as const

export function ConsumerBrowse() {
  const searchParams = useSearchParams()
  const items = useCatalog()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [filter, setFilter] = useState<string>('all')

  const visible = useMemo(() => {
    return items.filter((m) => {
      const match = !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.farm.toLowerCase().includes(q.toLowerCase())
      const ok =
        filter === 'all' ||
        (filter === 'verified' && m.freshness >= 85) ||
        (filter === 'near' && m.distKm <= 15) ||
        (filter === 'under' && m.price <= 1200)
      return match && ok
    })
  }, [items, q, filter])

  return (
    <>
      <PageHeader eyebrow="Marketplace" title="Fresh produce" />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '9px 14px',
            flex: 1,
            minWidth: 220,
          }}
        >
          <span style={{ color: 'var(--muted)' }}>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search produce or farm…"
            style={{ border: 0, outline: 0, background: 'transparent', width: '100%', fontSize: 13.5, color: 'var(--ink)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.k}
              type="button"
              onClick={() => setFilter(f.k)}
              style={{
                background: filter === f.k ? 'var(--dark)' : 'var(--panel2)',
                color: filter === f.k ? '#ffffff' : 'var(--ink)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No produce matches your search.</div>
      ) : (
        <div className="consumer-grid">
          {visible.map((item) => (
            <ProductTile key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  )
}
