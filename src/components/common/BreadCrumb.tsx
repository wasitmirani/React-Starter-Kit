import { Link } from 'react-router-dom'

const BreadCrumb = ({
  activePage,
  breadcrumbs,
}: {
  activePage: string
  breadcrumbs: { label: string; href: string }[]
}) => {
  return (
    <div className="flex items-center justify-between page-header-breadcrumb flex-wrap gap-2">
      <div>
        <h1 className="page-title mb-0!">{activePage}</h1>
      </div>
      <ol className="breadcrumb mb-0!">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <li className="breadcrumb-item" key={breadcrumb.label}>
            <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
          </li>
        ))}
        <li className="breadcrumb-item active" aria-current="page">
          {activePage}
        </li>
      </ol>
    </div>
  )
}

export default BreadCrumb
