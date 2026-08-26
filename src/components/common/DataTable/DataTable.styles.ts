export const dataTableStyles = {
  wrapper: 'table-responsive',
  table: 'table text-nowrap ti-custom-table ti-custom-table-head border-b border-defaultborder',
  thead: 'bg-light',
  row: 'task-list',
  empty: 'text-center text-textmuted py-8',
  actions: 'ti-btn-list',
  checkbox: 'form-check-input',
  actionBase: 'ti-btn ti-btn-sm ti-btn-icon',
  actionVariants: {
    view: 'ti-btn-warning-light',
    edit: 'ti-btn-info-light',
    delete: 'ti-btn-danger-light',
    default: 'ti-btn-primary-light',
  },
} as const
