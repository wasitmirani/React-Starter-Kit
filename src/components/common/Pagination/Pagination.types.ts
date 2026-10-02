export type PaginationSize = 'sm' | 'md' | 'lg'

export interface PaginationProps {
  /** 1-based current page */
  currentPage: number
  /** Total number of pages (minimum 1) */
  totalPages: number
  /** Called when the user selects a different page */
  onPageChange: (page: number) => void
  /** Pages shown on each side of the current page. Default: 1 */
  siblingCount?: number
  size?: PaginationSize
  className?: string
  /** Hide the control when there is only one page. Default: false */
  hideWhenSinglePage?: boolean
  ariaLabel?: string
  prevLabel?: string
  nextLabel?: string
}

export interface PaginationInfoProps {
  from: number | null
  to: number | null
  total: number
  itemsLabel?: string
  className?: string
}
