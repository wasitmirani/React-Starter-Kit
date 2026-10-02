import { useMemo } from 'react'
import type { PaginationInfoProps, PaginationProps, PaginationSize } from './Pagination.types'

const SIZE_CLASS: Record<PaginationSize, string> = {
  sm: 'pagination-sm',
  md: 'pagination-md',
  lg: 'pagination-lg',
}

function buildPageRange(
  current: number,
  last: number,
  siblingCount: number,
): (number | '...')[] {
  if (last <= 1) return [1]

  const range: (number | '...')[] = []
  const start = Math.max(1, current - siblingCount)
  const end = Math.min(last, current + siblingCount)

  if (start > 1) {
    range.push(1)
    if (start > 2) range.push('...')
  }

  for (let page = start; page <= end; page++) {
    range.push(page)
  }

  if (end < last) {
    if (end < last - 1) range.push('...')
    range.push(last)
  }

  return range
}

export function PaginationInfo({
  from,
  to,
  total,
  itemsLabel = 'Results',
  className = '',
}: PaginationInfoProps) {
  const classes = ['text-muted text-center text-md-start mb-0', className]
    .filter(Boolean)
    .join(' ')

  return (
    <p className={classes}>
      Showing{' '}
      <b className="me-1">
        {from ?? 0}-{to ?? 0}
      </b>{' '}
      of <b className="ms-1">{total}</b> {itemsLabel}
    </p>
  )
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  size = 'md',
  className = '',
  hideWhenSinglePage = false,
  ariaLabel = 'Page navigation',
  prevLabel = 'Prev',
  nextLabel = 'Next',
}: PaginationProps) {
  const lastPage = Math.max(1, totalPages)
  const page = Math.min(Math.max(1, currentPage), lastPage)

  const pages = useMemo(
    () => buildPageRange(page, lastPage, siblingCount),
    [page, lastPage, siblingCount],
  )

  if (hideWhenSinglePage && lastPage <= 1) return null

  const listClass = [
    'pagination',
    SIZE_CLASS[size],
    'justify-content-center justify-content-md-end mb-0',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const goTo = (next: number) => {
    if (next < 1 || next > lastPage || next === page) return
    onPageChange(next)
  }

  return (
    <nav aria-label={ariaLabel}>
      <ul className={listClass}>
        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => goTo(page - 1)}
          >
            <i className="mgc_left_line" aria-hidden /> {prevLabel}
          </button>
        </li>

        {pages.map((item, index) =>
          item === '...' ? (
            <li key={`ellipsis-${index}`} className="page-item disabled">
              <span className="page-link" aria-hidden>
                …
              </span>
            </li>
          ) : (
            <li key={item} className={`page-item${item === page ? ' active' : ''}`}>
              <button
                type="button"
                className="page-link"
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                onClick={() => goTo(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li className={`page-item${page === lastPage ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            aria-label="Next page"
            disabled={page === lastPage}
            onClick={() => goTo(page + 1)}
          >
            {nextLabel} <i className="mgc_right_line" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  )
}
