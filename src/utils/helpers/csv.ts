/** Minimal RFC 4180 CSV parser: quoted fields, escaped quotes, CRLF. */
export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const records: string[][] = []
  let field = ''
  let record: string[] = []
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      record.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      record.push(field)
      if (record.some((v) => v !== '')) records.push(record)
      record = []
      field = ''
    } else field += ch
  }
  record.push(field)
  if (record.some((v) => v !== '')) records.push(record)
  const [headers = [], ...body] = records
  const clean = headers.map((h) => h.trim())
  return { headers: clean, rows: body.map((r) => Object.fromEntries(clean.map((h, i) => [h, r[i] ?? '']))) }
}

function escape(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Builds a CSV file from rows and triggers a browser download. */
export function downloadCsv<T>(fileName: string, columns: { label: string; value: (row: T) => unknown }[], rows: T[]) {
  const lines = [columns.map((c) => escape(c.label)).join(',')]
  for (const row of rows) lines.push(columns.map((c) => escape(c.value(row))).join(','))
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
