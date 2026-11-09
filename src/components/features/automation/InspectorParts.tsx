import type { ReactNode } from 'react'
import { listsApi } from '@/api/endpoints/crm.api'
import { templatesApi } from '@/api/endpoints/messaging.api'
import { FormField } from '@/components/common/FormField'
import type { ConfigField } from '@/constants/automation.constants'
import { useAll } from '@/hooks/queries/resource.queries'
import type { VariableOption } from '@/utils/helpers/workflow'
import { VariableInput } from './VariableInput'

/** One step or trigger setting, rendered by its field type. */
export function ConfigInput({ field, value, onChange, invalid, options }: { field: ConfigField; value: string; onChange: (v: string) => void; invalid: boolean; options: VariableOption[] }) {
  const templates = useAll('templates', templatesApi.list)
  const lists = useAll('lists', listsApi.list)
  const id = `cfg-${field.key}`
  const cls = (base: string) => `${base}${invalid ? ' is-invalid' : ''}`
  const input = (() => {
    if (field.variables) return <VariableInput id={id} value={value} onChange={onChange} options={options} placeholder={field.placeholder} invalid={invalid} />
    switch (field.type) {
      case 'select':
        return (
          <select id={id} className={cls('form-select')} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">Choose…</option>
            {field.options!.map((o) => <option key={o} value={o}>{field.optionLabels?.[o] ?? o}</option>)}
          </select>
        )
      case 'template': {
        const list = (templates.data?.data ?? []).filter((t) => t.channel === field.channel && ['active', 'approved'].includes(t.status))
        return (
          <select id={id} className={cls('form-select')} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">Choose a template…</option>
            {list.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        )
      }
      case 'list':
        return (
          <select id={id} className={cls('form-select')} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">Choose a list…</option>
            {(lists.data?.data ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        )
      case 'textarea':
        return <textarea id={id} rows={3} className={cls('form-control')} value={value} onChange={(e) => onChange(e.target.value)} />
      default:
        return <input id={id} type={field.type === 'number' ? 'number' : 'text'} min={0} className={cls('form-control')} placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    }
  })()
  return (
    <FormField id={id} label={<>{field.label}{field.optional && <span className="text-muted fw-normal"> (optional)</span>}</>} error={invalid ? 'Required' : undefined} hint={field.hint} className="mb-4">
      {input}
    </FormField>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="wf-section">
      <h6 className="wf-library-group">{title}</h6>
      {children}
    </section>
  )
}

