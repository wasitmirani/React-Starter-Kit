import { useEffect, useState } from 'react'
import { widgetsApi } from '@/api/endpoints/channels.api'
import { FormField } from '@/components/common/FormField'
import { CopyButton } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { Switch } from '@/components/ui/Controls'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { LiveChatWidget } from '@/types/channel.types'

const COLORS = ['#647ee8', '#0ea5e9', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#111827']

export function LiveChatChannelPage() {
  const widgets = useAll('widgets', widgetsApi.list)
  const widget = widgets.data?.data[0]
  const [draft, setDraft] = useState<LiveChatWidget | null>(null)
  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    if (widget && !dirty) setDraft(widget)
  }, [widget, dirty])
  const save = useAction('widgets', () => widgetsApi.update(draft!.id, draft!), { success: 'Widget saved', onSuccess: () => setDirty(false) })

  if (!draft) return <SkeletonLines lines={8} />
  const edit = (patch: Partial<LiveChatWidget>) => {
    setDraft({ ...draft, ...patch })
    setDirty(true)
  }
  const snippet = `<script src="https://chat.birdcrm.app/widget.js" data-widget="${draft.id}" async></script>`

  return (
    <>
      <PageHeader
        title="Live chat"
        description="A chat widget for your website. Conversations arrive in the inbox."
        meta={<StatusBadge status={draft.status} />}
        actions={<button type="button" className="btn btn-primary" disabled={!dirty || save.isPending} onClick={() => save.mutate(undefined)}>Save</button>}
      />
      <div className="row g-4">
        <div className="col-xl-7">
          <Panel title="Appearance" className="mb-4">
            <div className="row g-4">
              <FormField id="w-name" label="Widget name" className="col-md-6"><input id="w-name" className="form-control" value={draft.name} onChange={(e) => edit({ name: e.target.value })} /></FormField>
              <FormField id="w-domain" label="Allowed domain" hint="The widget only loads on this domain." className="col-md-6"><input id="w-domain" className="form-control" value={draft.domain} onChange={(e) => edit({ domain: e.target.value })} /></FormField>
              <div className="col-12">
                <span className="form-label d-block">Colour</span>
                <div className="d-flex gap-2" role="radiogroup" aria-label="Colour">
                  {COLORS.map((c) => (
                    <button key={c} type="button" role="radio" aria-checked={draft.color === c} aria-label={c} className="rounded-circle border-0 p-0" style={{ width: 32, height: 32, background: c, outline: draft.color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} onClick={() => edit({ color: c })} />
                  ))}
                </div>
              </div>
              <FormField id="w-pos" label="Position" className="col-md-6">
                <select id="w-pos" className="form-select" value={draft.position} onChange={(e) => edit({ position: e.target.value as 'left' | 'right' })}>
                  <option value="right">Bottom right</option>
                  <option value="left">Bottom left</option>
                </select>
              </FormField>
            </div>
          </Panel>
          <Panel title="Messages & behaviour" className="mb-4">
            <FormField id="w-greet" label="Greeting" className="mb-3"><input id="w-greet" className="form-control" value={draft.greeting} onChange={(e) => edit({ greeting: e.target.value })} /></FormField>
            <FormField id="w-away" label="Away message" className="mb-4"><textarea id="w-away" rows={2} className="form-control" value={draft.awayMessage} onChange={(e) => edit({ awayMessage: e.target.value })} /></FormField>
            <div className="d-flex flex-column gap-3">
              <Switch id="w-email" checked={draft.collectEmail} onChange={(collectEmail) => edit({ collectEmail })} label="Ask for email before chatting" description="Lets you follow up by email and matches the visitor to a contact." />
              <Switch id="w-photos" checked={draft.showAgentPhotos} onChange={(showAgentPhotos) => edit({ showAgentPhotos })} label="Show agent photos" />
              <Switch id="w-active" checked={draft.status === 'active'} onChange={(on) => edit({ status: on ? 'active' : 'disabled' })} label="Widget enabled" />
            </div>
          </Panel>
          <Panel title="Install">
            <p className="text-muted fs-sm">Paste this before <code>&lt;/body&gt;</code> on every page of {draft.domain || 'your site'}.</p>
            <pre className="code-block mb-2">{snippet}</pre>
            <CopyButton value={snippet} label="Copy snippet" />
          </Panel>
        </div>
        <div className="col-xl-5">
          <Panel title="Preview" bodyClassName="email-canvas rounded-0">
            <div className={`d-flex flex-column gap-3 ${draft.position === 'left' ? 'align-items-start' : 'align-items-end'}`} style={{ minHeight: 480 }}>
              <div className="chat-widget-preview">
                <div className="chat-head" style={{ background: draft.color }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {draft.showAgentPhotos && <span className="d-flex">{['AR', 'DB', 'ML'].map((i, n) => <span key={i} className="avatar-initials bg-white" style={{ width: 26, height: 26, fontSize: 10, color: draft.color, marginLeft: n ? -8 : 0, border: `2px solid ${draft.color}` }}>{i}</span>)}</span>}
                    <span className="fw-semibold">{draft.name}</span>
                  </div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>We typically reply in a few minutes</div>
                </div>
                <div className="p-3" style={{ minHeight: 200 }}>
                  <div className="phone-bubble mb-3" style={{ background: '#f3f4f6' }}>{draft.greeting}</div>
                  {draft.collectEmail && <input className="form-control form-control-sm mb-2" placeholder="Your email" disabled style={{ background: '#fff' }} />}
                </div>
                <div className="border-top p-2 d-flex gap-2">
                  <input className="form-control form-control-sm border-0" placeholder="Write a message…" disabled style={{ background: '#fff' }} />
                  <span className="btn btn-sm text-white" style={{ background: draft.color }}><i className="ri-send-plane-2-fill" /></span>
                </div>
              </div>
              <span className="chat-launcher" style={{ background: draft.color }}><i className="ri-chat-3-fill" /></span>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
