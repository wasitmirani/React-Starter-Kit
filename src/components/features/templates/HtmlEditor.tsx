import { useRef, type ChangeEvent, type KeyboardEvent } from 'react'
import { CopyButton } from '@/components/common/Misc'
import { HtmlFrame } from '@/components/features/messaging/HtmlFrame'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { fillSample, insertAtCaret } from '@/utils/helpers/template'
import { TokenField } from './TokenField'
import { VariablePicker } from './VariablePicker'

interface HtmlEditorProps {
  subject: string
  previewText: string
  html: string
  examples?: Record<string, string>
  device: 'desktop' | 'mobile'
  onChange: (patch: { subject?: string; previewText?: string; html?: string }) => void
}

const MAX_FILE = 500_000

/** Code-your-own email: HTML source on the left, sandboxed live preview on the right. */
export function HtmlEditor({ subject, previewText, html, examples, device, onChange }: HtmlEditorProps) {
  const toast = useToast()
  const code = useRef<HTMLTextAreaElement>(null)
  const gutter = useRef<HTMLDivElement>(null)
  const file = useRef<HTMLInputElement>(null)
  const preview = useDebounce(html, 250)
  const lines = Math.max(1, html.split('\n').length)

  const insert = (token: string) => {
    const { next, caret } = insertAtCaret(code.current, html, token)
    onChange({ html: next })
    requestAnimationFrame(() => {
      code.current?.focus()
      code.current?.setSelectionRange(caret, caret)
    })
  }
  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > MAX_FILE) return toast.error('That file is larger than 500 KB.')
    onChange({ html: await f.text() })
    toast.success(`Imported ${f.name}`)
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'email.html' })
    a.click()
    URL.revokeObjectURL(url)
  }
  // Tab inserts two spaces instead of leaving the editor.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab' || e.shiftKey) return
    e.preventDefault()
    insert('  ')
  }

  return (
    <div className="html-editor">
      <section className="html-pane">
        <div className="inbox-head compact">
          <TokenField id="subject" label="Subject" value={subject} onChange={(v) => onChange({ subject: v })} soft={60} max={150} className="mb-2" />
          <TokenField id="previewText" label="Preview text" value={previewText} onChange={(v) => onChange({ previewText: v })} soft={90} max={150} className="mb-0" />
        </div>
        <div className="code-toolbar">
          <span className="fs-xs fw-semibold text-muted"><i className="ri-code-s-slash-line me-1" />HTML</span>
          <span className="flex-1" />
          <VariablePicker onInsert={insert} />
          <button type="button" className="btn btn-sm btn-light" onClick={() => file.current?.click()}><i className="ri-upload-2-line me-1" />Import .html</button>
          <input ref={file} type="file" accept=".html,.htm,text/html" hidden onChange={importFile} />
          <button type="button" className="btn btn-sm btn-light" onClick={download} disabled={!html}><i className="ri-download-2-line me-1" />Download</button>
          <CopyButton value={html} className="btn btn-sm btn-light" />
        </div>
        <div className="code-editor">
          <div ref={gutter} className="code-gutter" aria-hidden>
            {Array.from({ length: lines }, (_, i) => <span key={i}>{i + 1}</span>)}
          </div>
          <textarea
            id="html"
            ref={code}
            spellCheck={false}
            value={html}
            aria-label="Email HTML"
            onChange={(e) => onChange({ html: e.target.value })}
            onKeyDown={onKeyDown}
            onScroll={(e) => gutter.current && (gutter.current.scrollTop = e.currentTarget.scrollTop)}
          />
        </div>
        <p className="form-text mb-0 px-3 pb-2"><i className="ri-shield-check-line me-1" />The preview is sandboxed: scripts never run. Scripts and event handlers are stripped when sending. {html.length.toLocaleString()} characters.</p>
      </section>
      <section className="html-preview-pane">
        <div className={`email-paper html${device === 'mobile' ? ' mobile' : ''}`}>
          {preview.trim() ? <HtmlFrame html={fillSample(preview, examples)} minHeight={300} title="Email preview" /> : <p className="text-muted text-center p-5 mb-0">Write or import HTML to see it here.</p>}
        </div>
      </section>
    </div>
  )
}
