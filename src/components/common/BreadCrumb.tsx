const BreadCrumb = ({activePage, breadcrumbs}: {activePage: string, breadcrumbs: {label: string, href: string}[]}) => {
  
   
    return (

        <>
            <div className="main-content app-content">
          <div className="flex items-center justify-between page-header-breadcrumb my-2 flex-wrap gap-2">
            <h1 className="page-title font-semibold! text-[20px]! mb-0!">{activePage}</h1>
            <ol className="breadcrumb mb-0!">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              {breadcrumbs.map(breadcrumb=>{
                return (
                    <li className="breadcrumb-item"  key={breadcrumb.label}>
                        <a href={breadcrumb.href}>{breadcrumb.label}</a>
                    </li>
                )
              })}
              
              <li className="breadcrumb-item active" aria-current="page">
                {activePage}
              </li>
            </ol>
          </div>

        </div>
        </>
    )
}
export default BreadCrumb;