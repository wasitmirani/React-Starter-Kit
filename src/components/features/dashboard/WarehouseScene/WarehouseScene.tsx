import { useEffect, useState } from 'react'

type SignalTone = 'blue' | 'amber' | 'red' | 'green'

type SignalBeat = {
  tone: SignalTone
  route: string
  target: { x: number; y: number }
  label: string
}

/** Activity hotspots mapped to the warehouse.webp composition (1200×900). */
const BEATS: SignalBeat[] = [
  {
    tone: 'amber',
    route: 'M600 8 V76 Q600 92 616 92 H704 Q724 92 724 112 V206',
    target: { x: 724, y: 206 },
    label: 'Packing station',
  },
  {
    tone: 'red',
    route: 'M600 8 V40 Q600 56 616 56 H1120 Q1140 56 1140 76 V374 Q1140 392 1122 392 H1040',
    target: { x: 1016, y: 392 },
    label: 'Outbound chute',
  },
  {
    tone: 'green',
    route: 'M600 8 V48 Q600 64 580 64 H220 Q200 64 200 84 V300 Q200 320 220 320 H310',
    target: { x: 310, y: 320 },
    label: 'Pallet mover',
  },
  {
    tone: 'blue',
    route: 'M600 8 V56 Q600 72 620 72 H860 Q880 72 880 92 V250 Q880 270 860 270 H780',
    target: { x: 780, y: 270 },
    label: 'Shelf pick',
  },
]

type Props = {
  greetingName?: string
  alertText?: string
}

export function WarehouseScene({
  greetingName = 'Alex',
  alertText = 'Wireless Mouse — low stock',
}: Props) {
  const [beatIndex, setBeatIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const beat = BEATS[beatIndex]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    let fadeTimer: number | undefined
    const id = window.setInterval(() => {
      setVisible(false)
      fadeTimer = window.setTimeout(() => {
        setBeatIndex((i) => (i + 1) % BEATS.length)
        setVisible(true)
      }, 220)
    }, 3400)

    return () => {
      window.clearInterval(id)
      if (fadeTimer) window.clearTimeout(fadeTimer)
    }
  }, [])

  return (
    <div className="warehouse-scene" aria-label="Live warehouse activity">
      <div className="warehouse-banners">
        <span className="warehouse-banner">
          <i className="ri-sun-line" aria-hidden />
          {greeting}, {greetingName} · Your store, in motion
        </span>
        <span className="warehouse-banner warehouse-banner--alert">
          <i className="ri-error-warning-line" aria-hidden />
          {alertText}
        </span>
      </div>

      <div className="warehouse-artwork">
        <img
          className="warehouse-artwork__img"
          src="/assets/images/omi/warehouse.webp"
          alt="Isometric warehouse with shelves, parcels and packing station"
          width={1200}
          height={900}
          fetchPriority="high"
        />
        <svg
          className={`warehouse-signal${visible ? ' is-on' : ' is-off'}`}
          viewBox="0 0 1200 900"
          aria-hidden
          data-tone={beat.tone}
        >
          <defs>
            <marker
              id="activity-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M1 1 L6 4 L1 7" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </marker>
          </defs>
          <path className="signal-route" d={beat.route} markerEnd="url(#activity-arrow)" />
          <path className="signal-flow" d={beat.route} />
          <g transform={`translate(${beat.target.x} ${beat.target.y})`}>
            <circle className="signal-halo" r="26" />
            <circle className="signal-dot" r="7" />
          </g>
        </svg>
      </div>

      <div className="warehouse-activity-pill" data-tone={beat.tone}>
        <span className="warehouse-activity-pill__dot" />
        {beat.label}
      </div>

      <span className="visually-hidden">Current activity: {beat.label}</span>
    </div>
  )
}
