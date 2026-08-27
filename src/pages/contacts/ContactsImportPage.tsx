import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { contactsService } from '@/services/contacts.service'
import { ROUTES } from '@/constants/routes.constants'

export function ContactsImportPage() {
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const importMutation = useMutation({
    mutationFn: (file?: File) => contactsService.importCsv(file),
    onSuccess: (res) => {
      setResult(`Imported ${res.data?.imported ?? 0} contacts.`)
    },
  })

  return (
    <>
      <BreadCrumb
        activePage="Import Contacts"
        breadcrumbs={[{ label: 'Contacts', href: ROUTES.CONTACTS }]}
      />
      <div className="box">
        <div className="box-header flex items-center justify-between">
          <div className="box-title">CSV Import</div>
          <Link to={ROUTES.CONTACTS} className="ti-btn ti-btn-outline-light ti-btn-sm">
            Back
          </Link>
        </div>
        <div className="box-body">
          <p className="text-textmuted">
            Upload a CSV with columns: firstName, lastName, email, phone, company, tags.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            className="form-control mb-3"
            onChange={(e) => {
              const file = e.target.files?.[0]
              setFileName(file?.name ?? '')
              setResult(null)
            }}
          />
          {fileName && <p className="fs-12 text-textmuted">Selected: {fileName}</p>}
          <button
            type="button"
            className="ti-btn ti-btn-primary"
            disabled={importMutation.isPending}
            onClick={() => importMutation.mutate(undefined)}
          >
            {importMutation.isPending ? 'Importing…' : 'Start Import'}
          </button>
          {result && <p className="text-success mt-3 mb-0">{result}</p>}
        </div>
      </div>
    </>
  )
}
