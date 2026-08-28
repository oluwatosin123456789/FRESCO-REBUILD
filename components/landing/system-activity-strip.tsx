import { systemEvents } from '@/lib/landing/content'

export function SystemActivityStrip() {
  const loop = [...systemEvents, ...systemEvents]
  return (
    <section className="activity-strip" aria-label="Live network activity feed">
      <span className="activity-label">Live Network Activity</span>
      <div className="activity-marquee">
        <div className="activity-track">
          {loop.map((event, index) => (
            <span key={`${event}-${index}`} className="activity-event">
              {event}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}