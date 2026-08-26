export const dataTableStyles = {
  wrapper: 'table-responsive',
  table: 'table whitespace-nowrap ti-custom-table',
  thead: '',
  row: '',
  empty: 'text-center text-textmuted py-8',
  actions: 'hstack gap-2 fs-15',
  checkbox: 'form-check-input',
  actionBase: 'ti-btn ti-btn-icon waves-effect waves-light ti-btn-sm rounded-pill',
  actionVariants: {
    view: 'ti-btn-success-light',
    edit: 'ti-btn-primary-light',
    delete: 'ti-btn-danger-light',
    default: 'ti-btn-primary-light',
  },
} as const
