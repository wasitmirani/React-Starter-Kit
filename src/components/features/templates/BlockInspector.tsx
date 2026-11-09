import { FormField } from '@/components/common/FormField'
import { Switch } from '@/components/ui/Controls'
import { Segmented } from '@/components/ui/Segmented'
import { BLOCK_LIBRARY, LOGO, SOCIAL_NETWORKS } from '@/constants/email-builder.constants'
import type { EmailBlock, EmailDesign } from '@/types/messaging.types'
import { ColorField, EditorSection, RangeField } from './EditorParts'
import { TokenField } from './TokenField'

const IMAGE_PICKS = [LOGO, '/assets/images/1.webp', '/assets/images/2.webp', '/assets/images/3.webp']

interface BlockInspectorProps {
  block: EmailBlock
  design: EmailDesign
  onChange: (patch: Partial<EmailBlock>) => void
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}

/** Settings for the selected email block: content first, then style. */
export function BlockInspector({ block: b, design, onChange, onDuplicate, onDelete, onClose }: BlockInspectorProps) {
  const def = BLOCK_LIBRARY.find((d) => d.type === b.type)!
  const hasText = ['heading', 'text', 'button', 'footer'].includes(b.type)
  const aligns = !['divider', 'spacer', 'html'].includes(b.type)

  return (
    <div className="tpl-inspector" key={b.id}>
      <header className="tpl-inspector-head">
        <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary"><i className={def.icon} /></span>
        <strong className="flex-1">{def.label}</strong>
        <button type="button" className="btn btn-sm btn-icon btn-light" title="Duplicate (Ctrl+D)" aria-label="Duplicate block" onClick={onDuplicate}><i className="ri-file-copy-line" /></button>
        <button type="button" className="btn btn-sm btn-icon btn-light text-danger" title="Delete (Del)" aria-label="Delete block" onClick={onDelete}><i className="ri-delete-bin-6-line" /></button>
        <button type="button" className="btn btn-sm btn-icon btn-light" title="Close (Esc)" aria-label="Close" onClick={onClose}><i className="ri-close-line" /></button>
      </header>

      <EditorSection title="Content">
        {hasText && (
          <TokenField
            id={`blk-${b.id}`}
            label={b.type === 'button' ? 'Label' : 'Text'}
            value={b.content}
            onChange={(content) => onChange({ content })}
            multiline={b.type !== 'button'}
            rows={b.type === 'text' ? 6 : 2}
            hint={b.type === 'footer' ? 'Include your address and an unsubscribe link.' : undefined}
          />
        )}
        {b.type === 'footer' && !/unsubscribe/i.test(b.content) && (
          <button type="button" className="btn btn-sm btn-light mb-3" onClick={() => onChange({ content: `${b.content.trim()} · {{unsubscribe_url}}` })}><i className="ri-link-unlink me-1" />Add unsubscribe link</button>
        )}
        {b.type === 'image' && (
          <>
            <FormField id={`src-${b.id}`} label="Image URL" className="mb-2">
              <input id={`src-${b.id}`} className="form-control" value={b.content} placeholder="https://…" onChange={(e) => onChange({ content: e.target.value })} />
            </FormField>
            <div className="img-picks mb-3" role="group" aria-label="Pick an image">
              {IMAGE_PICKS.map((src) => (
                <button key={src} type="button" className={b.content === src ? 'on' : ''} aria-pressed={b.content === src} onClick={() => onChange({ content: src })}><img src={src} alt="" /></button>
              ))}
            </div>
            <FormField id={`alt-${b.id}`} label="Alt text" hint="Describes the image when it is blocked or read aloud." className="mb-3">
              <input id={`alt-${b.id}`} className="form-control" value={b.alt ?? ''} onChange={(e) => onChange({ alt: e.target.value })} />
            </FormField>
            <RangeField id={`w-${b.id}`} label="Width" value={b.width ?? 100} min={10} max={100} unit="%" onChange={(width) => onChange({ width })} />
          </>
        )}
        {(b.type === 'button' || b.type === 'image') && (
          <TokenField id={`href-${b.id}`} label="Link" value={b.href ?? ''} placeholder="https://" onChange={(href) => onChange({ href })} hint={b.type === 'button' ? 'Clicks are tracked automatically.' : undefined} />
        )}
        {b.type === 'spacer' && <RangeField id={`h-${b.id}`} label="Height" value={b.height ?? 24} min={8} max={96} step={4} unit="px" onChange={(height) => onChange({ height })} />}
        {b.type === 'social' &&
          SOCIAL_NETWORKS.map((n) => (
            <div key={n.key} className="input-group input-group-sm mb-2">
              <span className="input-group-text" title={n.label}><i className={n.icon} /></span>
              <input className="form-control" placeholder={`${n.label} URL`} aria-label={`${n.label} URL`} value={b.links?.[n.key] ?? ''} onChange={(e) => onChange({ links: { ...b.links, [n.key]: e.target.value } })} />
            </div>
          ))}
        {b.type === 'divider' && <p className="text-muted fs-sm mb-0">A thin line between sections.</p>}
        {b.type === 'html' && (
          <TokenField id={`html-${b.id}`} label="HTML" value={b.content} onChange={(content) => onChange({ content })} multiline rows={12} mono hint="Use inline styles and tables for email clients. Scripts never run: the preview is sandboxed and scripts are stripped when sending." />
        )}
      </EditorSection>

      <EditorSection title="Style">
        {b.type === 'heading' && (
          <div className="mb-3">
            <div className="form-label mb-1">Size</div>
            <Segmented<1 | 2 | 3> block ariaLabel="Heading size" value={b.level ?? 1} onChange={(level) => onChange({ level })} options={[{ value: 1, label: 'Large' }, { value: 2, label: 'Medium' }, { value: 3, label: 'Small' }]} />
          </div>
        )}
        {b.type === 'text' && <RangeField id={`fs-${b.id}`} label="Font size" value={b.size ?? 15} min={12} max={32} unit="px" onChange={(size) => onChange({ size })} />}
        {aligns && (
          <div className="mb-3">
            <div className="form-label mb-1">Alignment</div>
            <Segmented<'left' | 'center' | 'right'> block ariaLabel="Alignment" value={b.align ?? 'left'} onChange={(align) => onChange({ align })} options={(['left', 'center', 'right'] as const).map((a) => ({ value: a, label: '', icon: `ri-align-${a}`, title: `Align ${a}` }))} />
          </div>
        )}
        {b.type === 'button' && (
          <>
            <div className="row g-2 mb-3">
              <div className="col-6"><ColorField id={`bc-${b.id}`} label="Fill" value={b.color ?? design.accent} onChange={(color) => onChange({ color })} onReset={b.color ? () => onChange({ color: undefined }) : undefined} /></div>
              <div className="col-6"><ColorField id={`bt-${b.id}`} label="Label" value={b.textColor ?? '#ffffff'} onChange={(textColor) => onChange({ textColor })} /></div>
            </div>
            <div className="mb-3"><Switch id={`fw-${b.id}`} checked={!!b.fullWidth} onChange={(fullWidth) => onChange({ fullWidth })} label="Full width" /></div>
          </>
        )}
        {['heading', 'text', 'footer', 'social'].includes(b.type) && (
          <div className="mb-3"><ColorField id={`tc-${b.id}`} label="Text colour" value={b.color ?? (b.type === 'footer' || b.type === 'social' ? '#6b7280' : design.text)} onChange={(color) => onChange({ color })} onReset={b.color ? () => onChange({ color: undefined }) : undefined} /></div>
        )}
        <div className="mb-3">
          <div className="form-label mb-1">Padding</div>
          <Segmented<NonNullable<EmailBlock['padding']>> block ariaLabel="Padding" value={b.padding ?? (b.type === 'spacer' || b.type === 'divider' ? 'sm' : 'md')} onChange={(padding) => onChange({ padding })} options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]} />
        </div>
        <ColorField id={`bg-${b.id}`} label="Background" value={b.bg ?? design.paper} onChange={(bg) => onChange({ bg })} onReset={b.bg ? () => onChange({ bg: undefined }) : undefined} />
      </EditorSection>
    </div>
  )
}
