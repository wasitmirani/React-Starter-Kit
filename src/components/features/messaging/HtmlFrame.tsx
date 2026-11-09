import { useCallback, useEffect, useRef, useState } from 'react'

interface HtmlFrameProps {
  html: string
  /** Fixed height; omit to grow with the content. */
  height?: number
  minHeight?: number
  title?: string
  className?: string
}

/**
 * Renders user-written HTML in a sandboxed iframe. Scripts, forms, popups and
 * navigation are blocked (no `allow-scripts`), so custom HTML can never run code
 * inside the app. Same-origin is allowed only so the frame can be measured.
 */
export function HtmlFrame({ html, height, minHeight = 40, title = 'HTML preview', className = '' }: HtmlFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [auto, setAuto] = useState(minHeight)
  const measure = useCallback(() => {
    const doc = ref.current?.contentDocument
    if (doc?.documentElement) setAuto(Math.max(minHeight, doc.documentElement.scrollHeight))
  }, [minHeight])
  useEffect(() => {
    const doc = ref.current?.contentDocument
    if (!doc?.documentElement || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(doc.documentElement)
    return () => ro.disconnect()
  }, [html, measure])
  const doc = /<html[\s>]/i.test(html) ? html : `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Inter,Arial,sans-serif;color:#1f2937}img{max-width:100%}</style></head><body>${html}</body></html>`
  return <iframe ref={ref} className={`html-frame ${className}`} title={title} sandbox="allow-same-origin" referrerPolicy="no-referrer" srcDoc={doc} style={{ height: height ?? auto }} onLoad={measure} />
}
