import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { contactsApi } from '@/api/endpoints/crm.api'
import { Avatar } from '@/components/ui/Avatar'
import { to, ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useList } from '@/hooks/queries/resource.queries'
import { useDebounce } from '@/hooks/useDebounce'
import { flattenMenu, getSidebarMenu } from '@/utils/helpers/sidebar.menu'

const QUICK_ACTIONS = [
  { title: 'Create a campaign', group: 'Actions', link: ROUTES.CAMPAIGN_NEW },
  { title: 'Import contacts', group: 'Actions', link: ROUTES.CONTACT_IMPORT },
  { title: 'Build a segment', group: 'Actions', link: ROUTES.SEGMENT_NEW },
]

/** ⌘K / Ctrl+K: jump to any page or contact. */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const { can } = useAuth()
  const search = useDebounce(text, 200)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', onOpen)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onOpen)
    }
  }, [])

  const contacts = useList('contacts', contactsApi.list, { search, perPage: 5 }, { enabled: open && search.length >= 2 })

  const results = useMemo(() => {
    const q = text.trim().toLowerCase()
    const pages = [...QUICK_ACTIONS, ...flattenMenu(getSidebarMenu(can))].filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.group.toLowerCase().includes(q),
    )
    const people = (search.length >= 2 ? contacts.data?.data ?? [] : []).map((c) => ({
      title: `${c.firstName} ${c.lastName}`,
      group: c.email ?? c.phone ?? 'Contact',
      link: to(ROUTES.CONTACT, { id: c.id }),
      person: true,
    }))
    return [...people, ...pages.slice(0, 12).map((p) => ({ ...p, person: false }))]
  }, [text, search, contacts.data, can])

  useEffect(() => {
    setActive(0)
  }, [text])

  if (!open) return null

  const close = () => {
    setOpen(false)
    setText('')
  }
  const go = (link: string) => {
    close()
    navigate(link)
  }

  return createPortal(
    <>
      <div className="modal fade show d-block command-palette" role="dialog" aria-modal="true" aria-label="Search" onClick={close}>
        <div className="modal-dialog modal-dialog-scrollable" style={{ marginTop: '10vh' }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header py-3">
              <i className="ri-search-line text-muted me-2" />
              <input
                autoFocus
                className="form-control border-0 shadow-none px-0"
                placeholder="Search pages, actions and contacts…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') close()
                  if (e.key === 'ArrowDown') setActive((a) => Math.min(results.length - 1, a + 1))
                  if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1))
                  if (e.key === 'Enter' && results[active]) go(results[active].link)
                }}
              />
              <span className="kbd">Esc</span>
            </div>
            <div className="modal-body p-2">
              {results.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No matches for “{text}”.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {results.map((r, i) => (
                    <button
                      key={r.link + r.title}
                      type="button"
                      className={`list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded${i === active ? ' active' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r.link)}
                    >
                      {r.person ? <Avatar name={r.title} size={28} /> : <i className="ri-arrow-right-up-line text-muted" />}
                      <span className="flex-1 text-truncate">{r.title}</span>
                      <span className="text-muted fs-sm text-truncate">{r.group}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>,
    document.body,
  )
}
