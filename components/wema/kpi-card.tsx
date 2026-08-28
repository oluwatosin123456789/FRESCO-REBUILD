interface KpiCardProps {
  label: string
  value: string
  delta: string
}

export function KpiCard({ label, value, delta }: KpiCardProps) {
  return (
    <div className="wema-kpi-card">
      <div className="wema-kpi-label">{label}</div>
      <div className="wema-kpi-value">{value}</div>
      <div className="wema-kpi-delta">{delta}</div>
    </div>
  )
}