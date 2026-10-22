import { useEffect, useMemo, useRef, useState } from 'react'

export type RegionItem = {
  code: string
  name: string
  amount: string
  pct: string
  /** ISO country code matching map path data-country */
  country: string
}

const DEFAULT_REGIONS: RegionItem[] = [
  { code: 'US', name: 'United States', amount: '$19,158', pct: '28%', country: 'us' },
  { code: 'GB', name: 'United Kingdom', amount: '$10,947', pct: '16%', country: 'gb' },
  { code: 'CA', name: 'Canada', amount: '$8,210', pct: '12%', country: 'ca' },
  { code: 'DE', name: 'Germany', amount: '$6,842', pct: '10%', country: 'de' },
  { code: 'AU', name: 'Australia', amount: '$5,474', pct: '8%', country: 'au' },
  { code: 'OT', name: 'Other regions', amount: '$17,789', pct: '26%', country: 'other' },
]

type Props = {
  regions?: RegionItem[]
}

export function BuyingRegions({ regions = DEFAULT_REGIONS }: Props) {
  const ranked = useMemo(
    () => regions.filter((r) => r.country !== 'other').map((r) => r.country),
    [regions],
  )
  const [active, setActive] = useState(regions[0]?.country ?? 'us')
  const [mapHtml, setMapHtml] = useState<string | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const selected = regions.find((r) => r.country === active) ?? regions[0]

  useEffect(() => {
    let cancelled = false
    fetch('/assets/images/omi/world-map.svg')
      .then((r) => r.text())
      .then((svg) => {
        if (cancelled) return
        setMapHtml(svg)
      })
      .catch(() => {
        if (!cancelled) setMapHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const root = frameRef.current
    if (!root || !mapHtml) return

    const paths = root.querySelectorAll<SVGPathElement>('path[data-country]')
    paths.forEach((path) => {
      const code = path.getAttribute('data-country')
      if (code && ranked.includes(code)) {
        path.setAttribute('data-ranked', '')
        path.setAttribute('tabindex', '0')
        path.setAttribute('role', 'button')
        path.setAttribute('aria-label', `${path.getAttribute('data-name') || code} sales`)
      } else {
        path.removeAttribute('data-ranked')
        path.removeAttribute('tabindex')
        path.removeAttribute('role')
      }
      path.classList.toggle('is-selected', code === active)
    })

    const onActivate = (event: Event) => {
      const target = event.target as Element | null
      const path = target?.closest?.('path[data-ranked]') as SVGPathElement | null
      if (!path) return
      const code = path.getAttribute('data-country')
      if (code) setActive(code)
    }

    const onKey = (e: Event) => {
      const ke = e as KeyboardEvent
      if (ke.key === 'Enter' || ke.key === ' ') {
        ke.preventDefault()
        onActivate(e)
      }
    }

    root.addEventListener('click', onActivate)
    root.addEventListener('keydown', onKey)

    return () => {
      root.removeEventListener('click', onActivate)
      root.removeEventListener('keydown', onKey)
    }
  }, [mapHtml, ranked, active])

  return (
    <>
      <div
        className="regions-map-frame mb-3"
        ref={frameRef}
        dangerouslySetInnerHTML={mapHtml ? { __html: mapHtml } : undefined}
        aria-label="Interactive world map"
      />

      <div className="row g-2">
        {regions.map((region) => (
          <div className="col-6" key={region.code}>
            <button
              type="button"
              className={`omi-region-btn${active === region.country || (region.country === 'other' && active === 'other') ? ' is-active' : ''}`}
              onClick={() => setActive(region.country)}
              aria-pressed={active === region.country}
            >
              <div className="d-flex align-items-center gap-2">
                <span className="avatar avatar-xs bg-primary-subtle text-primary fw-bold rounded-circle">
                  {region.code}
                </span>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-truncate">{region.name}</div>
                  <div className="text-muted fs-12">{region.amount}</div>
                </div>
                <strong className="fs-13">{region.pct}</strong>
              </div>
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <p className="text-muted mb-0 mt-3 fs-13">
          {selected.name} · {selected.pct} · {selected.amount}
        </p>
      )}
    </>
  )
}
