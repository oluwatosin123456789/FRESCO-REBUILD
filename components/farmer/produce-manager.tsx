'use client'

import { useEffect, useState } from 'react'
import { FarmerButton, FarmerHeader, FarmerMetric, FarmerNote, FarmerPill, FarmerSection, FarmerStatusPill } from '@/components/farmer/farmer-ui'
import { PRODUCE, fmtFull, type Produce } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type ApiProduce = {
  id: string
  name: string
  category?: string
  quantity: number
  unit: string
  price: number
  status: string
  batchId?: string | null
  imageUrl?: string | null
  frescoScan?: { freshnessScore: number; estimatedShelfLifeDays: number; qualityLabel?: string } | null
}

const ART_BG: Record<string, string> = {
  crate: '#F3EAD9',
  pepper: '#EFE3D0',
  greens: '#E6EDDC',
  cucumber: '#EBF0DC',
}

const ART_COLOR: Record<string, string> = {
  crate: '#7A5130',
  pepper: '#9A3E1F',
  greens: '#3F6B3A',
  cucumber: '#4E7A3A',
}

function artColor(image: string) {
  return ART_BG[image] ?? '#F3EAD9'
}

export function ProduceManager() {
  const [list, setList] = useState<Produce[]>(PRODUCE)
  const [listed, setListed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api<ApiProduce[]>('/api/produce/mine')
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return
        const mapped: Produce[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          variety: p.category ?? '',
          price: p.price,
          unit: p.unit,
          qty: p.quantity,
          image: 'crate',
          batch: p.batchId ?? '·',
          freshness: p.frescoScan?.freshnessScore ?? 0,
          shelfLife: p.frescoScan?.estimatedShelfLifeDays ?? 0,
          confidence: 0.9,
          grade: p.frescoScan?.qualityLabel ?? 'Standard',
          status: p.status,
          listedAt: '',
        }))
        setList(mapped)
      })
      .catch(() => undefined)
  }, [])

  const activeCount = list.filter((p) => p.status === 'LISTED').length

  return (
    <>
      {/* Hero banner */}
      <div style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        marginBottom: 28, height: 200,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
      }}>
        <img
          src="/assets/hero-produce-listings.jpg"
          alt="Fresh Nigerian market produce — tomatoes, peppers, leafy greens and yams"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(10,20,10,0.72) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '18px 24px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>Produce</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 750, letterSpacing: '-.3px', lineHeight: 1.1 }}>Your listings</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5, marginTop: 4 }}>{activeCount} active · every listing carries Fresco evidence</div>
        </div>
      </div>

      <FarmerHeader
        eyebrow="Produce"
        title="Your listings"
        subtitle={`${activeCount} active · every listing carries Fresco evidence`}
        actions={<FarmerButton href="/farmer/scan">Scan new produce</FarmerButton>}
      />

      <div className="farmer-metrics" style={{ marginBottom: 28 }}>
        <FarmerMetric label="Listed now" value={activeCount} sub="active listings" />
        <FarmerMetric label="Avg freshness" value="91%" sub="across Fresco scans" />
        <FarmerMetric label="Total qty" value={list.reduce((s, p) => s + p.qty, 0)} sub="units available" />
        <FarmerMetric label="Grades" value="A" sub="premium evidence tier" />
      </div>

      <FarmerSection title="Inventory" subtitle="verified batches ready for buyers">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((p) => {
            const isListed = p.status === 'LISTED'
            const qty = listed[p.id] ?? p.qty
            return (
              <div className="farmer-row" key={p.id}>
                <div
                  className="farmer-row-art"
                  style={{ background: artColor(p.image), color: ART_COLOR[p.image] ?? '#7A5130' }}
                >
                  {p.variety.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <b style={{ fontWeight: 750, fontSize: 15, color: 'var(--farmer-ink)' }}>{p.name}</b>
                    {isListed ? <FarmerPill tone="green">Fresco Verified</FarmerPill> : <FarmerStatusPill status={p.status} />}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--farmer-muted)', marginTop: 3 }}>
                    {p.variety} · {fmtFull(p.price)}/{p.unit} · {qty} {p.unit} available
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <FarmerPill tone="blue">Freshness {p.freshness}%</FarmerPill>
                    <FarmerPill tone="teal">Shelf life {p.shelfLife} days</FarmerPill>
                    <FarmerPill tone="muted">{p.batch}</FarmerPill>
                  </div>
                </div>

                <FarmerButton
                  tone="outline"
                  small
                  onClick={() =>
                    setListed((prev) => {
                      const next = { ...prev, [p.id]: !(prev[p.id] ?? false) }
                      return next
                    })
                  }
                >
                  {isListed ? 'Unlist' : 'List'}
                </FarmerButton>
              </div>
            )
          })}
        </div>
      </FarmerSection>

      <div style={{ marginTop: 18 }}>
        <FarmerNote>
          <b>Fresco Verified means evidence.</b> A scanned produce carries freshness, shelf life and confidence · buyers see it before they buy.
        </FarmerNote>
      </div>
    </>
  )
}