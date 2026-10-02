import { Link } from 'react-router-dom'

const BreadCrumb = ({
  activePage,
  breadcrumbs,
}: {
  activePage: string
  breadcrumbs: { label: string; href: string }[]
}) => {
  return (
    <div className="gap-2 page-heading mb-4 flex-column flex-md-row">
      <h6 className="flex-grow-1 mb-0">{activePage}</h6>
      <ul className="breadcrumb flex-shrink-0 mb-0">
        {breadcrumbs.map((breadcrumb, idx) => (
          <li className="breadcrumb-item" key={breadcrumb.label}>
            <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
          </li>
        ))}
        <li className="breadcrumb-item active" aria-current="page">
          {activePage}
        </li>
      </ul>
    </div>
  )
}

export default BreadCrumb
