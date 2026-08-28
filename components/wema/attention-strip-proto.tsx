import { ATTENTION_ITEMS } from '@/lib/seed/dashboard.seed'

export function AttentionStrip() {
  return (
    <section className="wema-attention-strip" aria-labelledby="attention-heading">
      <div className="wema-attention-header">
        <span className="wema-attention-title">NEEDS ATTENTION TODAY · 9 AWAITING FIRST LOOK</span>
        <button className="wema-btn wema-btn--secondary">Open review pipeline →</button>
      </div>
      <div className="wema-attention-grid">
        {ATTENTION_ITEMS.map((item, i) => (
          <div key={i} className="wema-attention-card">
            <div className="wema-attention-card-header">
              <span className="wema-attention-name">{item.name}</span>
              <span className="wema-attention-feap">{item.feap}</span>
            </div>
            <p className="wema-attention-reason">{item.reason}</p>
            <button className="wema-btn wema-btn--tertiary">Open profile</button>
          </div>
        ))}
      </div>
    </section>
  )
}