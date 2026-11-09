import { Fragment, useEffect, useState, type DragEvent } from 'react'
import { EmailBlockContent } from '@/components/features/messaging/MessagePreview'
import { blockRowStyle, paperStyle } from '@/utils/helpers/email-html'
import { Segmented } from '@/components/ui/Segmented'
import { BLOCK_LIBRARY, DEFAULT_DESIGN, DESIGN_PRESETS, EMAIL_FONTS, SECTIONS } from '@/constants/email-builder.constants'
import { Link } from 'react-router-dom'
import { Switch } from '@/components/ui/Controls'
import { ROUTES } from '@/constants/routes.constants'
import type { BrandKit, EmailBlock, EmailBlockType, EmailDesign, Template } from '@/types/messaging.types'
import { BlockInspector } from './BlockInspector'
import { composeEmail, emailText } from '@/utils/helpers/template'
import { ColorField, EditorSection, RangeField } from './EditorParts'
import { TokenField } from './TokenField'

export type EmailDraft = Pick<Template, 'subject' | 'previewText' | 'blocks' | 'design' | 'examples' | 'brandHeader' | 'brandFooter'>

const DRAG = 'application/x-birdcrm-email'
type DragPayload = { kind: 'block'; type: EmailBlockType } | { kind: 'section'; key: string } | { kind: 'move'; id: string }
type LibraryTab = 'blocks' | 'sections' | 'style'

const uid = () => crypto.randomUUID()
const seedBlocks = (p: Exclude<DragPayload, { kind: 'move' }>): EmailBlock[] =>
  p.kind === 'block' ? [{ ...structuredClone(BLOCK_LIBRARY.find((d) => d.type === p.type)!.seed), id: uid() }] : SECTIONS.find((s) => s.key === p.key)!.blocks.map((b) => ({ ...structuredClone(b), id: uid() }))

interface EmailBuilderProps {
  value: EmailDraft
  onChange: (patch: Partial<EmailDraft>) => void
  selected: string | null
  onSelect: (id: string | null) => void
  device: 'desktop' | 'mobile'
  /** Block ids with a failing check. */
  flagged: Set<string>
  kit?: BrandKit | null
  /** Brand kit editing: no subject / preview text bar and no brand-kit switches. */
  bare?: boolean
}

/** Drag-and-drop email builder: library (blocks, sections, style), canvas, inspector. */
export function EmailBuilder({ value, onChange, selected, onSelect, device, flagged, kit, bare = false }: EmailBuilderProps) {
  const [tab, setTab] = useState<LibraryTab>('blocks')
  const [dragging, setDragging] = useState(false)
  const [over, setOver] = useState<number | null>(null)
  const blocks = value.blocks
  const design = { ...DEFAULT_DESIGN, ...(value.design ?? kit?.design) }
  const setBlocks = (next: EmailBlock[]) => onChange({ blocks: next })
  const block = blocks.find((b) => b.id === selected) ?? null
  const setDesign = (patch: Partial<EmailDesign>) => onChange({ design: { ...design, ...patch } })

  const insertAt = (index: number, items: EmailBlock[]) => {
    setBlocks([...blocks.slice(0, index), ...items, ...blocks.slice(index)])
    onSelect(items[0]?.id ?? null)
  }
  const insertAfterSelection = (p: Exclude<DragPayload, { kind: 'move' }>) => {
    const i = selected ? blocks.findIndex((b) => b.id === selected) + 1 : blocks.length
    insertAt(i, seedBlocks(p))
  }
  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[i], next[j]] = [next[j], next[i]]
    setBlocks(next)
  }
  const duplicate = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id)
    if (i < 0) return
    insertAt(i + 1, [{ ...structuredClone(blocks[i]), id: uid() }])
  }
  const remove = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id)
    setBlocks(blocks.filter((b) => b.id !== id))
    onSelect(blocks[i + 1]?.id ?? blocks[i - 1]?.id ?? null)
  }

  // Keyboard: Delete, Ctrl+D, Alt+↑/↓, Esc — only when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [contenteditable="true"]') || !selected) return
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(selected) }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(selected) }
      else if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); move(selected, -1) }
      else if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); move(selected, 1) }
      else if (e.key === 'Escape') onSelect(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const startDrag = (e: DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData(DRAG, JSON.stringify(payload))
    e.dataTransfer.effectAllowed = payload.kind === 'move' ? 'move' : 'copy'
    setDragging(true)
  }
  const endDrag = () => {
    setDragging(false)
    setOver(null)
  }
  const drop = (e: DragEvent, index: number) => {
    const raw = e.dataTransfer.getData(DRAG)
    endDrag()
    if (!raw) return
    e.preventDefault()
    const p = JSON.parse(raw) as DragPayload
    if (p.kind !== 'move') return insertAt(index, seedBlocks(p))
    const from = blocks.findIndex((b) => b.id === p.id)
    if (from < 0 || from === index || from + 1 === index) return
    const next = [...blocks]
    const [moved] = next.splice(from, 1)
    next.splice(from < index ? index - 1 : index, 0, moved)
    setBlocks(next)
  }
  const zone = (index: number) => (
    <div
      className={`email-insert${dragging ? ' armed' : ''}${over === index ? ' over' : ''}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG)) return
        e.preventDefault()
        setOver(index)
      }}
      onDragLeave={() => setOver((o) => (o === index ? null : o))}
      onDrop={(e) => drop(e, index)}
    >
      <span className="email-insert-line" />
      {!dragging && (
        <button type="button" className="email-insert-btn" title="Add a text block here" aria-label="Add a block here" onClick={() => insertAt(index, seedBlocks({ kind: 'block', type: 'text' }))}>
          <i className="ri-add-line" />
        </button>
      )}
    </div>
  )

  /** Shared header / footer from the brand kit: shown, not editable here. */
  const brandZone = (where: 'header' | 'footer', items: EmailBlock[]) => (
    <div className={`brand-zone ${where}`}>
      <span className="brand-zone-label"><i className="ri-lock-2-line" /> Brand {where} · shared by all templates <Link to={ROUTES.TEMPLATE_BRAND_KIT}>Edit</Link></span>
      {items.map((b) => (
        <div key={b.id} style={blockRowStyle(b)}><EmailBlockContent block={b} design={design} examples={value.examples} /></div>
      ))}
    </div>
  )

  return (
    <div className="tpl-builder">
      <aside className="tpl-library" aria-label="Email blocks">
        <Segmented<LibraryTab> block ariaLabel="Library" value={tab} onChange={setTab} options={[{ value: 'blocks', label: 'Blocks' }, { value: 'sections', label: 'Sections' }, { value: 'style', label: 'Style' }]} />
        <div className="tpl-library-body">
          {tab === 'blocks' && (
            <>
              <p className="text-muted fs-xs mb-2">Drag onto the email, or click to add after the selected block.</p>
              <div className="block-tiles">
                {BLOCK_LIBRARY.map((d) => (
                  <button key={d.type} type="button" className="block-tile" draggable onDragStart={(e) => startDrag(e, { kind: 'block', type: d.type })} onDragEnd={endDrag} onClick={() => insertAfterSelection({ kind: 'block', type: d.type })}>
                    <i className={d.icon} />
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === 'sections' && (
            <div className="d-flex flex-column gap-2">
              {SECTIONS.map((s) => (
                <button key={s.key} type="button" className="section-tile" draggable onDragStart={(e) => startDrag(e, { kind: 'section', key: s.key })} onDragEnd={endDrag} onClick={() => insertAfterSelection({ kind: 'section', key: s.key })}>
                  <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary"><i className={s.icon} /></span>
                  <span className="min-w-0 text-start">
                    <strong>{s.label}</strong>
                    <span className="d-block text-muted fs-xs">{s.description} · {s.blocks.length} blocks</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {tab === 'style' && (
            <>
              {!bare && <EditorSection title="Brand kit" action={<Link to={ROUTES.TEMPLATE_BRAND_KIT} className="fs-xs">Edit kit</Link>}>
                <div className="d-flex flex-column gap-2 mb-2">
                  <Switch id="use-header" checked={!!value.brandHeader} onChange={(brandHeader) => onChange({ brandHeader })} label="Shared header" description="Logo bar from the brand kit" />
                  <Switch id="use-footer" checked={!!value.brandFooter} onChange={(brandFooter) => onChange({ brandFooter })} label="Shared footer" description="Social links, address and unsubscribe" />
                </div>
                {value.design && <button type="button" className="btn btn-sm btn-link p-0 mb-2" onClick={() => onChange({ design: undefined })}><i className="ri-refresh-line me-1" />Use brand kit colours</button>}
              </EditorSection>}
              <EditorSection title="Palette">
                <div className="palette-row">
                  {DESIGN_PRESETS.map((p) => (
                    <button key={p.name} type="button" className={`palette-swatch${design.accent === p.design.accent ? ' on' : ''}`} title={p.name} aria-label={`${p.name} palette`} style={{ background: p.design.background }} onClick={() => setDesign(p.design)}>
                      <span style={{ background: p.design.accent }} />
                    </button>
                  ))}
                </div>
              </EditorSection>
              <EditorSection title="Colours">
                <div className="d-flex flex-column gap-2 mb-3">
                  <ColorField id="d-accent" label="Brand / buttons" value={design.accent} onChange={(accent) => setDesign({ accent })} />
                  <ColorField id="d-text" label="Text" value={design.text} onChange={(text) => setDesign({ text })} />
                  <ColorField id="d-paper" label="Content background" value={design.paper} onChange={(paper) => setDesign({ paper })} />
                  <ColorField id="d-bg" label="Page background" value={design.background} onChange={(background) => setDesign({ background })} />
                </div>
              </EditorSection>
              <EditorSection title="Typography & shape">
                <label htmlFor="d-font" className="form-label mb-1">Font</label>
                <select id="d-font" className="form-select form-select-sm mb-3" value={design.font} onChange={(e) => setDesign({ font: e.target.value as EmailDesign['font'] })}>
                  {EMAIL_FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
                <RangeField id="d-radius" label="Corner radius" value={design.radius} min={0} max={24} unit="px" onChange={(radius) => setDesign({ radius })} />
              </EditorSection>
            </>
          )}
        </div>
      </aside>

      <main className="tpl-stage">
        {!bare && <div className="inbox-head">
          <span className="tpl-avatar" style={{ background: design.accent }}>N</span>
          <div className="flex-1 min-w-0">
            <div className="fs-xs text-muted mb-2">From <strong className="text-body">Northwind</strong> &lt;hello@northwind.io&gt;</div>
            <TokenField id="subject" label="Subject" value={value.subject ?? ''} onChange={(subject) => onChange({ subject })} soft={60} max={150} className="mb-2" placeholder="Something worth opening" />
            <TokenField id="previewText" label="Preview text" value={value.previewText ?? ''} onChange={(previewText) => onChange({ previewText })} soft={90} max={150} className="mb-0" placeholder="Shown after the subject in the inbox" />
          </div>
        </div>}
        <div className="email-stage" style={{ background: design.background }} onClick={(e) => e.target === e.currentTarget && onSelect(null)}>
          <div className={`email-paper editing${device === 'mobile' ? ' mobile' : ''}`} style={paperStyle(design)}>
            {kit && value.brandHeader && brandZone('header', kit.header)}
            {blocks.length === 0 ? (
              <div className={`email-empty${dragging ? ' armed' : ''}`} onDragOver={(e) => e.dataTransfer.types.includes(DRAG) && e.preventDefault()} onDrop={(e) => drop(e, 0)}>
                <i className="ri-drag-drop-line" />
                <strong>Drag blocks here, or start with a section</strong>
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                  {SECTIONS.map((s) => <button key={s.key} type="button" className="btn btn-sm btn-light" onClick={() => insertAt(0, seedBlocks({ kind: 'section', key: s.key }))}><i className={`${s.icon} me-1`} />{s.label}</button>)}
                </div>
              </div>
            ) : (
              <>
                {zone(0)}
                {blocks.map((b, i) => (
                  <Fragment key={b.id}>
                    <div
                      className={`email-block${selected === b.id ? ' selected' : ''}${flagged.has(b.id) ? ' flagged' : ''}`}
                      style={blockRowStyle(b)}
                      draggable
                      onDragStart={(e) => startDrag(e, { kind: 'move', id: b.id })}
                      onDragEnd={endDrag}
                      onClick={(e) => { e.stopPropagation(); onSelect(b.id) }}
                      data-block-id={b.id}
                    >
                      <span className="email-block-label">{BLOCK_LIBRARY.find((d) => d.type === b.type)?.label}</span>
                      <div className="email-block-tools" onClick={(e) => e.stopPropagation()}>
                        <span className="drag" title="Drag to move"><i className="ri-draggable" /></span>
                        <button type="button" title="Move up (Alt+↑)" aria-label="Move up" disabled={i === 0} onClick={() => move(b.id, -1)}><i className="ri-arrow-up-line" /></button>
                        <button type="button" title="Move down (Alt+↓)" aria-label="Move down" disabled={i === blocks.length - 1} onClick={() => move(b.id, 1)}><i className="ri-arrow-down-line" /></button>
                        <button type="button" title="Duplicate (Ctrl+D)" aria-label="Duplicate" onClick={() => duplicate(b.id)}><i className="ri-file-copy-line" /></button>
                        <button type="button" title="Delete (Del)" aria-label="Delete" className="danger" onClick={() => remove(b.id)}><i className="ri-delete-bin-6-line" /></button>
                      </div>
                      <EmailBlockContent block={b} design={design} examples={value.examples} />
                    </div>
                    {zone(i + 1)}
                  </Fragment>
                ))}
              </>
            )}
            {kit && value.brandFooter && brandZone('footer', kit.footer)}
          </div>
        </div>
      </main>

      <aside className="tpl-side" aria-label="Block settings">
        {block ? (
          <BlockInspector
            block={block}
            design={design}
            onChange={(patch) => setBlocks(blocks.map((x) => (x.id === block.id ? { ...x, ...patch } : x)))}
            onDuplicate={() => duplicate(block.id)}
            onDelete={() => remove(block.id)}
            onClose={() => onSelect(null)}
          />
        ) : (
          <div className="tpl-inspector">
            <header className="tpl-inspector-head">
              <span className="icon-tile icon-tile-sm bg-light text-muted"><i className="ri-mail-settings-line" /></span>
              <strong className="flex-1">Email</strong>
            </header>
            <EditorSection title="Outline">
              {blocks.length ? (
                <ol className="outline-list">
                  {blocks.map((b) => {
                    const d = BLOCK_LIBRARY.find((x) => x.type === b.type)!
                    return (
                      <li key={b.id}>
                        <button type="button" onClick={() => onSelect(b.id)} className={flagged.has(b.id) ? 'flagged' : ''}>
                          <i className={d.icon} />
                          <span className="text-truncate">{b.type === 'image' ? b.alt || 'Image' : ['heading', 'text', 'button', 'footer'].includes(b.type) && b.content.trim() ? b.content.split('\n')[0] : d.label}</span>
                          {flagged.has(b.id) && <i className="ri-error-warning-fill text-warning ms-auto" />}
                        </button>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p className="text-muted fs-sm">No blocks yet.</p>
              )}
            </EditorSection>
            <EditorSection title="Plain-text version">
              <pre className="plain-text">{emailText(composeEmail(value, kit)) || '—'}</pre>
              <p className="form-text mt-1 mb-0">Generated automatically for inboxes that do not show HTML.</p>
            </EditorSection>
            <p className="text-muted fs-xs mb-0"><i className="ri-keyboard-line me-1" />Select a block, then Del deletes, Ctrl+D duplicates, Alt+↑/↓ moves, Esc closes.</p>
          </div>
        )}
      </aside>
    </div>
  )
}
