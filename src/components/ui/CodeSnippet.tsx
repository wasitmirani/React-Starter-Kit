import { useState } from 'react'
import { CopyButton } from '@/components/common/Misc'
import { Segmented } from './Segmented'

export interface Snippet {
  key: string
  label: string
  code: string
}

/** Copyable code sample with language tabs (cURL / Node / Python…). */
export function CodeSnippet({ snippets, title }: { snippets: Snippet[]; title?: string }) {
  const [active, setActive] = useState(snippets[0]?.key)
  const current = snippets.find((s) => s.key === active) ?? snippets[0]
  if (!current) return null
  return (
    <div className="code-snippet">
      <div className="code-snippet-head">
        {snippets.length > 1 ? <Segmented ariaLabel={title ?? 'Language'} value={current.key} onChange={setActive} options={snippets.map((s) => ({ value: s.key, label: s.label }))} /> : <span className="fs-xs fw-semibold text-muted">{title ?? current.label}</span>}
        <CopyButton value={current.code} className="btn btn-sm btn-icon-text btn-link text-reset" />
      </div>
      <pre tabIndex={0}><code>{current.code}</code></pre>
    </div>
  )
}
