import { useState } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { contactsApi, listsApi, segmentsApi } from '@/api/endpoints/crm.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/FilterBar'
import { FormField } from '@/components/common/FormField'
import { TagInput } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { ContactCell, ConsentIcons } from '@/components/features/contacts/ContactBits'
import { ContactFormModal } from '@/components/features/contacts/ContactFormModal'
import { Dropdown } from '@/components/ui/Dropdown'
import { TagList, ToneBadge } from '@/components/ui/StatusBadge'
import { CONSENT_OPTIONS, LIFECYCLE_STAGES, STAGE_TONES } from '@/constants/crm.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useList } from '@/hooks/queries/resource.queries'
import { useListParams } from '@/hooks/useListParams'
import { useToast } from '@/hooks/useToast'
import type { Contact } from '@/types/crm.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { downloadCsv } from '@/utils/helpers/csv'

type BulkMode = 'tag' | 'list' | null

export function ContactsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [urlParams, setUrlParams] = useSearchParams()
  const { query, filters, activeFilters, setSearch, setFilter, setPage, setSort, clear } = useListParams({
    perPage: 25,
    filterKeys: ['lifecycleStage', 'listId', 'segmentId', 'consent', 'tag'],
  })
  const contacts = useList('contacts', contactsApi.list, query)
  const lists = useAll('lists', listsApi.list)
  const segments = useAll('segments', segmentsApi.list)
  const [selected, setSelected] = useState<string[]>([])
  const [bulk, setBulk] = useState<BulkMode>(null)
  const [bulkTags, setBulkTags] = useState<string[]>([])
  const [bulkList, setBulkList] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const creating = urlParams.get('new') === '1'
  const [exporting, setExporting] = useState(false)

  const bulkUpdate = useAction('contacts', contactsApi.bulkUpdate, {
    invalidates: ['lists'],
    success: (r) => `${r.updated} contacts updated`,
    onSuccess: () => {
      setSelected([])
      setBulk(null)
    },
  })
  const bulkDelete = useAction('contacts', contactsApi.bulkDelete, {
    success: (r) => `${r.deleted} contacts deleted`,
    onSuccess: () => {
      setSelected([])
      setConfirmDelete(false)
    },
  })

  const exportCsv = async () => {
    setExporting(true)
    try {
      const rows = await contactsApi.export(query)
      downloadCsv<Contact>(`contacts-${new Date().toISOString().slice(0, 10)}.csv`, [
        { label: 'first_name', value: (c) => c.firstName },
        { label: 'last_name', value: (c) => c.lastName },
        { label: 'email', value: (c) => c.email },
        { label: 'phone', value: (c) => c.phone },
        { label: 'company', value: (c) => c.companyName },
        { label: 'country', value: (c) => c.country },
        { label: 'lifecycle_stage', value: (c) => c.lifecycleStage },
        { label: 'email_consent', value: (c) => c.consents.email },
        { label: 'tags', value: (c) => c.tags.join('|') },
        { label: 'created_at', value: (c) => c.createdAt },
      ], rows)
      toast.success(`Exported ${rows.length} contacts`)
    } finally {
      setExporting(false)
    }
  }

  const columns: DataTableColumn<Contact>[] = [
    { key: 'firstName', label: 'Contact', sortable: true, render: (c) => <ContactCell contact={c} /> },
    { key: 'companyName', label: 'Company', sortable: true, render: (c) => c.companyName ?? <span className="text-muted">—</span> },
    { key: 'lifecycleStage', label: 'Stage', render: (c) => <ToneBadge tone={STAGE_TONES[c.lifecycleStage]} dot>{LIFECYCLE_STAGES.find((s) => s.value === c.lifecycleStage)?.label}</ToneBadge> },
    { key: 'consents', label: 'Consent', render: (c) => <ConsentIcons contact={c} /> },
    { key: 'tags', label: 'Tags', render: (c) => <TagList tags={c.tags} max={2} /> },
    { key: 'lastActivityAt', label: 'Last activity', sortable: true, render: (c) => (c.lastActivityAt ? formatRelativeTime(c.lastActivityAt) : <span className="text-muted">Never</span>) },
  ]

  const closeCreate = () => {
    const next = new URLSearchParams(urlParams)
    next.delete('new')
    setUrlParams(next, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Contacts"
        description={contacts.data ? `${contacts.data.total.toLocaleString()} contacts match your filters.` : 'Everyone you can reach, across every channel.'}
        actions={
          <>
            <Guard permission="contacts.export">
              <button type="button" className="btn btn-light" onClick={exportCsv} disabled={exporting}>
                <i className="ri-download-2-line me-1" /> {exporting ? 'Exporting…' : 'Export'}
              </button>
            </Guard>
            <Guard permission="contacts.import">
              <Link to={ROUTES.CONTACT_IMPORT} className="btn btn-light">
                <i className="ri-upload-2-line me-1" /> Import
              </Link>
            </Guard>
            <Guard permission="contacts.manage">
              <button type="button" className="btn btn-primary" onClick={() => setUrlParams({ new: '1' })}>
                <i className="ri-user-add-line me-1" /> Add contact
              </button>
            </Guard>
          </>
        }
      />

      <div className="card">
        <div className="card-body pb-0">
          <FilterBar onClear={clear} activeCount={activeFilters + (query.search ? 1 : 0)}>
            <SearchInput value={query.search ?? ''} onChange={setSearch} placeholder="Search name, email, phone, company…" />
            <FilterSelect value={filters.listId} onChange={(v) => setFilter('listId', v)} allLabel="All lists" options={(lists.data?.data ?? []).map((l) => ({ value: l.id, label: l.name }))} />
            <FilterSelect value={filters.segmentId} onChange={(v) => setFilter('segmentId', v)} allLabel="All segments" options={(segments.data?.data ?? []).map((s) => ({ value: s.id, label: s.name }))} />
            <FilterSelect value={filters.lifecycleStage} onChange={(v) => setFilter('lifecycleStage', v)} allLabel="Any stage" options={LIFECYCLE_STAGES} />
            <FilterSelect value={filters.consent} onChange={(v) => setFilter('consent', v)} allLabel="Any email consent" options={CONSENT_OPTIONS} />
          </FilterBar>
          {selected.length > 0 && (
            <div className="alert alert-primary d-flex flex-wrap align-items-center gap-2 py-2 mb-4">
              <strong>{selected.length} selected</strong>
              <span className="mx-1 text-muted">·</span>
              <button type="button" className="btn btn-sm btn-light" onClick={() => setBulk('tag')}><i className="ri-price-tag-3-line me-1" />Add tags</button>
              <button type="button" className="btn btn-sm btn-light" onClick={() => setBulk('list')}><i className="ri-list-check me-1" />Add to list</button>
              <Dropdown
                label="More"
                buttonClassName="btn btn-sm btn-light"
                align="start"
                items={[
                  { key: 'block', label: 'Blocklist', icon: 'ri-forbid-line', onSelect: () => bulkUpdate.mutate({ ids: selected, blocklisted: true }) },
                  { key: 'unblock', label: 'Remove from blocklist', icon: 'ri-check-line', onSelect: () => bulkUpdate.mutate({ ids: selected, blocklisted: false }) },
                  'divider',
                  { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setConfirmDelete(true) },
                ]}
              />
              <button type="button" className="btn btn-sm btn-link ms-auto" onClick={() => setSelected([])}>Clear selection</button>
            </div>
          )}
        </div>
        <DataTable<Contact>
          columns={columns}
          rows={contacts.data ?? { data: [], current_page: 1, last_page: 1, from: null, to: null, total: 0 }}
          isLoading={contacts.isLoading}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          itemsLabel="contacts"
          emptyMessage={activeFilters || query.search ? 'No contacts match these filters' : 'No contacts yet'}
          emptyDescription={activeFilters || query.search ? 'Try removing a filter.' : 'Import a CSV or add your first contact.'}
          onRowClick={(c) => navigate(to(ROUTES.CONTACT, { id: c.id }))}
          fetchData={(page) => page && setPage(page)}
          onAction={(p) => {
            if ('direction' in p) setSort(p.column, p.direction)
          }}
        />
      </div>

      <ContactFormModal open={creating} onClose={closeCreate} onSaved={(c) => navigate(to(ROUTES.CONTACT, { id: c.id }))} />

      <Modal
        open={bulk !== null}
        onClose={() => setBulk(null)}
        title={bulk === 'tag' ? `Add tags to ${selected.length} contacts` : `Add ${selected.length} contacts to a list`}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={() => setBulk(null)}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={bulkUpdate.isPending || (bulk === 'tag' ? bulkTags.length === 0 : !bulkList)}
              onClick={() => bulkUpdate.mutate(bulk === 'tag' ? { ids: selected, addTags: bulkTags } : { ids: selected, addListIds: [bulkList] })}
            >
              {bulkUpdate.isPending ? 'Saving…' : 'Apply'}
            </button>
          </>
        }
      >
        {bulk === 'tag' ? (
          <FormField id="bulk-tags" label="Tags">
            <TagInput id="bulk-tags" value={bulkTags} onChange={setBulkTags} />
          </FormField>
        ) : (
          <FormField id="bulk-list" label="List">
            <select id="bulk-list" className="form-select" value={bulkList} onChange={(e) => setBulkList(e.target.value)}>
              <option value="">Choose a list…</option>
              {(lists.data?.data ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </FormField>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${selected.length} contacts?`}
        message="Their history, consents and list memberships are deleted permanently. This cannot be undone."
        confirmLabel="Delete contacts"
        danger
        busy={bulkDelete.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => bulkDelete.mutate(selected)}
      />
    </>
  )
}

