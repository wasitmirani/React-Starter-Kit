import BreadCrumb from '@/components/common/BreadCrumb';

export function AnalyticsPage() {
  return (
    <>
    <BreadCrumb activePage="Analytics" breadcrumbs={[ {label: "Dashboards", href: "/dashboard"}]} />

<div className="grid 2xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-4">
    <div className="col">
        <div className="box">
            <div className="box-body">
                <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex-1">
                        <p className="text-textmuted mb-2!">Visitors Online</p>
                        <div className="font-semibold fs-22">53,673</div>
                    </div>
                    <div className="text-end">
                        <div className="anal-body">
                            <div className="bg-primary-transparent anal-icon-bg"></div>
                            <div className="rounded avatar avatar-md bg-primary anal-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-users">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                                    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-1 inline-flex items-center gap-2 text-textmuted">
                    <span className="bg-success-transparent px-1 rounded-pill inline-flex items-center gap-1 fs-12 font-medium">
                        <i className="ti ti-arrow-up"></i>
                        7.5K+
                    </span>

                    <span className="fs-12 font-medium mr-1">
                        vs Previous month
                    </span>
                </div>
            </div>
        </div>
    </div>
    <div className="col">
         <div className="box">
            <div className="box-body">
                <div className="flex flex-wrap items-center justify-between gap-1">
                    <div>
                    </div>
                    <div className="flex-1">
                        <p className="text-textmuted mb-2!">Bounce Rate</p>
                        <div className="font-semibold fs-22">42%</div>
                    </div>
                    <div className="text-end">
                        <div className="anal-body">
                            <div className="bg-secondary-transparent anal-icon-bg"></div>
                            <div className="rounded avatar avatar-md bg-secondary anal-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    fill="currentColor" viewBox="0 0 24 24">
                                    <path d="m6.89 12.45 1.05-2.1 3.14 7.06c.16.36.52.59.91.59h.05c.41-.02.77-.29.9-.68l2.98-8.93 1.11 3.89c.12.43.52.73.96.73h4v-2h-3.25l-1.79-6.27c-.12-.42-.5-.72-.94-.73a.98.98 0 0 0-.97.68l-3.18 9.55L8.91 7.6c-.16-.35-.5-.58-.89-.59-.41-.04-.74.21-.92.55l-1.72 3.45H2v2h4c.38 0 .73-.21.89-.55Z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-1 inline-flex items-center gap-2 text-textmuted">
                    <span className="bg-success-transparent px-1 rounded-pill inline-flex items-center gap-1 fs-12 font-medium">
                        <i className="ti ti-arrow-up"></i>
                        3.4K+
                    </span>
                    <span className="fs-12 font-medium mr-1">
                        vs Previous month
                    </span>
                </div>
            </div>
        </div>
    </div>
   <div className="col">
        <div className="box">
            <div className="box-body">
                <div className="flex flex-wrap items-center justify-between gap-1">
                    <div>
                    </div>
                    <div className="flex-1">
                        <p className="text-textmuted mb-2!">Avg. Visit Duration</p>
                        <div className="font-semibold fs-22">5m 42s</div>
                    </div>
                    <div className="text-end">
                        <div className="anal-body">
                            <div className="bg-success-transparent anal-icon-bg"></div>
                            <div className="rounded avatar avatar-md bg-success anal-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.58 2 2 6.58 2 12s4.58 10 10 10 10-4.58 10-10S17.42 2 12 2m0 18c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8-3.66 8-8 8"></path>
                                    <path d="M13 7h-2v6h6v-2h-4z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-1 inline-flex items-center gap-2 text-textmuted">
                    <span className="bg-danger-transparent px-1 rounded-pill inline-flex items-center gap-1 fs-12 font-medium">
                        <i className="ti ti-arrow-down"></i>
                        1.6K+
                    </span>
                    <span className="fs-12 font-medium mr-1">
                        vs Previous month
                    </span>
                </div>
            </div>
        </div>
    </div>
    <div className="col">
        <div className="box">
            <div className="box-body">
                <div className="flex flex-wrap items-center justify-between gap-1">
                    <div>
                    </div>
                    <div className="flex-1">
                        <p className="text-textmuted mb-2!">Lead Analytics</p>
                        <div className="font-semibold fs-22">3,859</div>
                    </div>
                    <div className="text-end">
                        <div className="anal-body">
                            <div className="bg-warning-transparent anal-icon-bg"></div>
                            <div className="rounded avatar avatar-md bg-warning anal-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h7c.55 0 1-.45 1-1 0-4.41-3.59-8-8-8m1 7V4.08c2.51.42 4.49 2.41 4.92 4.92z"></path>
                                    <path d="M10.51 22A8.5 8.5 0 0 0 19 14.06c.02-.28-.08-.55-.27-.75s-.45-.32-.73-.32h-6.99V6a.97.97 0 0 0-.32-.73c-.2-.19-.46-.28-.75-.27-2.06.13-4 1.01-5.45 2.47C2.88 9.08 2 11.22 2 13.49s.89 4.41 2.49 6.02A8.46 8.46 0 0 0 10.51 22M5.91 8.88c.86-.86 1.93-1.45 3.1-1.73v6.83c0 .55.45 1 1 1h6.83a6.4 6.4 0 0 1-1.73 3.1c-1.23 1.23-2.87 1.91-4.6 1.91s-3.37-.68-4.6-1.91S4 15.21 4 13.48s.68-3.38 1.91-4.61Z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-1 inline-flex items-center gap-2 text-textmuted">
                    <span className="bg-success-transparent px-1 rounded-pill inline-flex items-center gap-1 fs-12 font-medium">
                        <i className="ti ti-arrow-up"></i>
                        2.4K+
                    </span>
                    <span className="fs-12 font-medium mr-1">
                        vs Previous month
                    </span>
                </div>
            </div>
        </div>
    </div>
    <div className="col">
        <div className="box">
            <div className="box-body">
                <div className="flex flex-wrap items-center justify-between gap-1">
                    <div>
                    </div>
                    <div className="flex-1">
                        <p className="text-textmuted mb-2!">Sessions</p>
                        <div className="font-semibold fs-22">97.66k</div>
                    </div>
                    <div className="text-end">
                        <div className="anal-body">
                            <div className="bg-danger-transparent anal-icon-bg"></div>
                            <div className="rounded avatar avatar-md bg-danger anal-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-calendar-stats">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4" />
                                    <path d="M18 14v4h4" />
                                    <path d="M14 18a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                                    <path d="M15 3v4" />
                                    <path d="M7 3v4" />
                                    <path d="M3 11h16" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-1 inline-flex items-center gap-2 text-textmuted">
                    <span className="bg-success-transparent px-1 rounded-pill inline-flex items-center gap-1 fs-12 font-medium">
                        <i className="ti ti-arrow-up"></i>
                        2.7K+
                    </span>
                    <span className="fs-12 font-medium mr-1">
                        vs Previous month
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>
{/* End:: row-1 */}

{/* Start:: row-2 */}
 <div className="grid grid-cols-12 sm:gap-x-6">
    <div className="2xl:col-span-3 xl:col-span-6 col-span-12 xl:order-1 2xl:order-1">
        <div className="box">
            <div className="box-header block!">
                <div className="flex items-center flex-wrap justify-between">
                    <div className="box-title">Visitors By Countries</div>
                    <button className="ti-btn ti-btn-sm ti-btn-light border border-defaultborder float-end">View All</button>
                </div>
            </div>
            <div className="box-body">
                <ul className="list-none mb-0 top-Countries">
                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/us_flag.jpg" alt="" />
                            </div>
                            <div className="flex-1 leading-none">
                                <div className="font-semibold mb-1">United States</div>
                                <span className="fs-12 text-gray-500">Increased by
                                    <span className="text-success font-medium ms-1">4.75%<i className="ti ti-arrow-narrow-up"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">35,701</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/argentina_flag.jpg" alt="" />
                            </div>
                            <div className="flex-1 leading-none mb-1">
                                <div className="font-semibold mb-1">Argentina</div>
                                <span className="fs-12 text-gray-500">Increased by
                                    <span className="text-success font-medium ms-1">2.75%<i className="ti ti-arrow-narrow-up"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">18,798</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/Spain_flag.html" alt="" />
                            </div>
                            <div className="flex-1 leading-none">
                                <div className="font-semibold mb-1">Spain</div>
                                <span className="fs-12 text-gray-500">Increased by
                                    <span className="text-success font-medium ms-1">2.75%<i className="ti ti-arrow-narrow-up"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">13,463</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/Russia_flag.html" alt="" />
                            </div>
                            <div className="flex-1 leading-none">
                                <div className="font-semibold mb-1">Russia</div>
                                <span className="fs-12 text-gray-500">Decreased by
                                    <span className="text-danger font-medium ms-1">1.4%<i className="ti ti-arrow-narrow-down"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">23,569</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/Uae_flag.html" alt="" />
                            </div>
                            <div className="flex-1 leading-none">
                                <div className="font-semibold mb-1">Uae</div>
                                <span className="fs-12 text-gray-500">Increased by
                                    <span className="text-success font-medium ms-1">1.3%<i className="ti ti-arrow-narrow-up"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">16,563</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/China_flag.html" alt="" />
                            </div>
                            <div className="flex-1 leading-none">
                                <div className="font-semibold mb-1">China</div>
                                <span className="fs-12 text-gray-500">Decreased by
                                    <span className="text-danger font-medium ms-1">0.2%<i className="ti ti-arrow-narrow-down"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">15,673</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/Canada_flag.html" alt="" />
                            </div>
                            <div className="flex-1 leading-none">
                                <div className="font-semibold mb-1">Canada</div>
                                <span className="fs-12 text-gray-500">Increased by
                                    <span className="text-success font-medium ms-1">0.5%<i className="ti ti-arrow-narrow-up"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">18,252</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-start gap-2">
                            <div className="avatar avatar-sm bg-light avatar-rounded">
                                <img src="/assets/images/flags/Mexico_flag.html" alt="" />
                            </div>
                            <div className="flex-1 leading-none">
                                <div className="font-semibold mb-1">Mexico</div>
                                <span className="fs-12 text-gray-500">Decreased by
                                    <span className="text-danger font-medium ms-1">0.2%<i className="ti ti-arrow-narrow-down"></i></span>
                                </span>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="mb-0 font-semibold text-base">12,652</div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div className="2xl:col-span-6 xl:col-span-12 col-span-12 xl:order-3 2xl:order-2">
        <div className="box">
            <div className="box-header">
                <div className="box-title">Visitor Analytics</div>
            </div>

            <div className="box-body pb-0">
                <div className="p-3 border rounded border-defaultborder border-dashed">
                    <div className="grid grid-cols-12 sm:gap-x-6 mb-2 gap-y-6">
                        <div className="sm:col-span-4 col-span-6">
                            <div className="flex items-start gap-3 flex-wrap">
                                <div className="avatar avatar-md bg-light text-default">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 12c0-4.88-4.12-9-9-9s-9 4.12-9 9c0 2.58 1.16 4.95 2.98 6.61L3.8 20.79l1.41 1.41 2.4-2.4c1.31.75 2.81 1.19 4.39 1.19s3.08-.44 4.39-1.19l2.4 2.4 1.41-1.41-2.18-2.18C19.83 16.95 21 14.59 21 12M5 12c0-3.79 3.21-7 7-7s7 3.21 7 7-3.21 7-7 7-7-3.21-7-7"></path>
                                        <path d="M17 11h-4V7h-2v6h6zM8.31 2.74a3.985 3.985 0 0 0-5.14.42c-1.4 1.4-1.53 3.58-.42 5.14 1.03-2.5 3.06-4.53 5.56-5.56m7.38 0c2.5 1.03 4.53 3.06 5.56 5.56 1.12-1.56.98-3.74-.42-5.14s-3.58-1.53-5.14-.42"></path>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="text-gray-500 text-[14px] font-medium">Sessions</span>
                                    <div className="font-semibold text-base mb-0">52%</div>
                                </div>
                                <div className="text-end">
                                    <span className="bg-success-transparent rounded-pill text-[10px] p-1 px-2">
                                        <i className="ti ti-trending-up"></i> 5.3%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-4 col-span-6">
                            <div className="flex items-start gap-3 flex-wrap">
                                <div className="avatar avatar-md bg-light text-default">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 13H8c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5m-5 5c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3zm7.73-11.49c-.08-.22-.19-.42-.3-.62v-.01c-.69-1.14-1.93-1.89-3.42-1.89-2.28 0-4 1.72-4 4s1.72 4 4 4c1.49 0 2.73-.74 3.42-1.89v-.01c.12-.2.22-.4.3-.62.02-.06.03-.12.05-.18.06-.17.11-.34.15-.52.05-.25.07-.51.07-.78s-.03-.53-.07-.78c-.03-.18-.09-.35-.15-.52-.02-.06-.03-.12-.05-.18M9 10c-1.18 0-2-.82-2-2s.82-2 2-2 2 .82 2 2-.82 2-2 2m6 0q-.165 0-.33-.03c-.22.66-.56 1.27-.98 1.81.41.13.84.22 1.31.22 2.28 0 4-1.72 4-4s-1.72-4-4-4c-.47 0-.9.09-1.31.22.43.53.76 1.14.98 1.81.11-.01.21-.03.33-.03 1.18 0 2 .82 2 2s-.82 2-2 2m1 3h-1.11c.6.58 1.08 1.27 1.44 2.03C17.83 15.2 19 16.46 19 18h-2v1c0 .35-.07.69-.18 1H20c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5"></path>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="text-gray-500 text-[14px] font-medium">Followers</span>
                                    <div className="font-semibold text-base mb-0">38%</div>
                                </div>
                                <div className="text-end">
                                    <span className="bg-primary-transparent rounded-pill text-[10px] p-1 px-2">
                                        <i className="ti ti-trending-up"></i> 2.8%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-4 col-span-6">
                            <div className="flex items-start gap-3 flex-wrap">
                                <div className="avatar avatar-md bg-light text-default">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path>
                                        <path d="M12 19c7.63 0 9.93-6.62 9.95-6.68.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68s-9.93 6.61-9.95 6.67c-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68Zm0-12c5.35 0 7.42 3.85 7.93 5-.5 1.16-2.58 5-7.93 5s-7.42-3.84-7.93-5c.5-1.16 2.58-5 7.93-5"></path>
                                    </svg>
                                </div>

                                <div className="flex-1">
                                    <span className="text-gray-500 text-[14px] font-medium">Viewers</span>
                                    <div className="font-semibold text-base mb-0">27%</div>
                                </div>

                                <div className="text-end">
                                    <span className="bg-warning-transparent rounded-pill text-[10px] p-1 px-2">
                                        <i className="ti ti-trending-up"></i> 1.7%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="profitchart"></div>
            </div>
        </div>
    </div>
    <div className="2xl:col-span-3 xl:col-span-6 col-span-12 xl:order-2 2xl:order-3">
        <div className="box">
            <div className="box-header">
                <div className="box-title">Traffic Sources</div>
            </div>

            <div className="box-body">
                <div id="visitors-device"></div>

                <div className="grid grid-cols-12 sm:gap-x-6 gap-y-7 mt-4">
                    <div className="sm:col-span-6 col-span-12">
                        <div className="p-3 border border-dashed rounded-sm border-defaultborder">
                            <div className="flex items-start gap-2">
                                <span className="avatar avatar-sm avatar-rounded bg-primary-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m-.74 2.04c-.07.03-.14.06-.22.08-.4.14-.8.18-1.11.16.43-.12.88-.2 1.33-.24M4 12c0-2.84 1.5-5.34 3.74-6.76.09.27.05.82-.13 1.4-.22.71-.23 1.78-.02 2.38s.67 1.39 1.02 1.76.99.79 1.42.94.96.41 1.19.59.57.4.76.51.24.54.1.97c-.13.43-.09 1.08.09 1.45s.55.87.81 1.1.3 1.14.09 2c-.2.78-.27 1.45-.19 1.6-.29.03-.58.05-.88.05-4.41 0-8-3.59-8-8Zm9.13 7.91c.32-.17.93-.61 1.56-1.13l.96-.8c.85-.7 1.77-1.8 2.06-2.45.28-.65.11-1.41-.4-1.69s-1.2-.7-1.55-.93-1.09-.53-1.64-.66c-.55-.14-1.15-.14-1.33-.02-.18.13-.58-.02-.89-.33s-.65-.77-.76-1.04c-.11-.26-.38-.29-.61-.06s-.54.13-.69-.22-.01-.77.31-.93.8-.23 1.05-.16c.26.08.54.25.63.4.09.14.22.18.29.09s.19-.41.26-.71c.08-.29.39-.85.71-1.24.31-.39.84-.83 1.17-.98s.34-.47.02-.71-.72-.56-.88-.73c-.16-.16-.22-.43-.12-.6.09-.17.41-.14.71.07.29.21.59.3.66.21s.11-.42.1-.73V4.5C17.81 5.62 20 8.56 20 12c0 4.03-2.99 7.36-6.87 7.91"></path>
                                    </svg>
                                </span>

                                <div className="flex-1">
                                    <p className="text-textmuted text-sm mb-1!">Website</p>
                                    <div className="mb-0 text-[18px] font-medium">4,289</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-6 col-span-12">
                        <div className="p-3 border border-dashed rounded-sm border-defaultborder">
                            <div className="flex items-start gap-2">
                                <span className="avatar avatar-sm avatar-rounded bg-secondary-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
                                    </svg>
                                </span>

                                <div className="flex-1">
                                    <p className="text-textmuted text-sm mb-1!">Facebook</p>
                                    <div className="mb-0 text-[18px] font-medium">3,565</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-6 col-span-12">
                        <div className="p-3 border border-dashed rounded-sm border-defaultborder">
                            <div className="flex items-start gap-2">
                                <span className="avatar avatar-sm avatar-rounded bg-warning-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4l0 -8" />
                                        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                                        <path d="M16.5 7.5v.01" />
                                    </svg>
                                </span>

                                <div className="flex-1">
                                    <p className="text-textmuted text-sm mb-1!">Instagram</p>
                                    <div className="mb-0 text-[18px] font-medium">2,964</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-6 col-span-12">
                        <div className="p-3 border border-dashed rounded-sm border-defaultborder">
                            <div className="flex items-start gap-2">
                                <span className="avatar avatar-sm avatar-rounded bg-success-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-brand-x">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M4 4l11.733 16h4.267l-11.733 -16l-4.267 0" />
                                        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                                    </svg>
                                </span>

                                <div className="flex-1">
                                    <p className="text-textmuted text-sm mb-1!">Twitter</p>
                                    <div className="mb-0 text-[18px] font-medium">1,573</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
 </div>

<div className="grid grid-cols-12 sm:gap-x-6">
    <div className="2xl:col-span-9 col-span-12">
        <div className="box overflow-hidden">
            <div className="box-header justify-between">
                <div className="box-title">Transactions</div>
                <button className="ti-btn ti-btn-sm ti-btn-light border  border-defaultborder folat-end">View All</button>
            </div>

            <div className="box-body p-0!">
                <div className="table-responsive">
                    <table className="table ti-custom-table table-hover text-nowrap resent-order-table">
                        <thead>
                            <tr>
                                <th scope="col" className="text-center">S.No</th>
                                <th scope="col">Transactions ID</th>
                                <th scope="col">User Name</th>
                                <th scope="col">Transactions Date</th>
                                <th scope="col">Payment Method</th>
                                <th scope="col">Status</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <th scope="row" className="text-center">1</th>
                                <td><span>#TX-12356</span></td>
                                <td>Rohit Verma</td>
                                <td>23, Dec 2025</td>
                                <td><span className="badge bg-primary-transparent">Credit Card</span></td>
                                <td><span className="badge bg-warning-transparent">Pending</span></td>
                                <td>$34,674</td>
                                <td>
                                    <div className="ti-btn-list">
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-primary-light"><i className="ti ti-edit"></i></a>
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-secondary-light"><i className="ti ti-trash"></i></a>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th scope="row" className="text-center">2</th>
                                <td><span>#TX-12563</span></td>
                                <td>Hiroshi Priya</td>
                                <td>15, Dec 2025</td>
                                <td><span className="badge bg-primary-transparent">UPI</span></td>
                                <td><span className="badge bg-success-transparent">Delivered</span></td>
                                <td>$12,742</td>
                                <td>
                                    <div className="ti-btn-list">
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-primary-light"><i className="ti ti-edit"></i></a>
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-secondary-light"><i className="ti ti-trash"></i></a>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th scope="row" className="text-center">3</th>
                                <td><span>#TX-12764</span></td>
                                <td>Amit Sharma</td>
                                <td>30, Nov 2025</td>
                                <td><span className="badge bg-primary-transparent">Debit Card</span></td>
                                <td><span className="badge bg-info-transparent">Shipped</span></td>
                                <td>$29,894</td>
                                <td>
                                    <div className="ti-btn-list">
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-primary-light"><i className="ti ti-edit"></i></a>
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-secondary-light"><i className="ti ti-trash"></i></a>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th scope="row" className="text-center">4</th>
                                <td><span>#TX-12234</span></td>
                                <td>Jackie Wilson</td>
                                <td>19, Nov 2025</td>
                                <td><span className="badge bg-primary-transparent">Bank Transfer</span></td>
                                <td><span className="badge bg-success-transparent">Delivered</span></td>
                                <td>$17,849</td>
                                <td>
                                    <div className="ti-btn-list">
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-primary-light"><i className="ti ti-edit"></i></a>
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-secondary-light"><i className="ti ti-trash"></i></a>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th scope="row" className="text-center border-bottom-0">5</th>
                                <td className="border-bottom-0"><span>#TX-12785</span></td>
                                <td className="border-bottom-0">Hannah Taylor</td>
                                <td className="border-bottom-0">04, Nov 2025</td>
                                <td className="border-bottom-0">
                                    <span className="badge bg-primary-transparent">PayPal</span>
                                </td>
                                <td className="border-bottom-0">
                                    <span className="badge bg-danger-transparent">Failed</span>
                                </td>
                                <td className="border-bottom-0">$14,678</td>
                                <td className="border-bottom-0">
                                    <div className="ti-btn-list">
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-primary-light"><i className="ti ti-edit"></i></a>
                                        <a href="javascript:void(0)" className="ti-btn ti-btn-icon ti-btn-sm ti-btn-secondary-light"><i className="ti ti-trash"></i></a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div className="2xl:col-span-3 col-span-12">
        <div className="box">
            <div className="box-header">
                <div className="box-title">Audience Growth</div>
            </div>

            <div className="box-body p-0!">
                <div className="flex items-center p-4">
                    <div className="fs-22 font-medium">$23,75K</div>
                    <span className="badge bg-success-transparent mx-1">
                        12.4% <i className="ti ti-trending-up"></i>
                    </span>
                    Increases
                </div>

                <div id="daily-sales"></div>
            </div>
        </div>
    </div>
</div>

 <div className="grid grid-cols-12 sm:gap-x-6">
    <div className="2xl:col-span-3 xl:col-span-6 col-span-12  xl:order-1">
        <div className="box">
            <div className="box-header">
                <div className="box-title">Users By Device</div>
            </div>

            <div className="box-body">
                <div id="sessions-device"></div>

                <ul className="custom-users pt-4 border-t border-dashed border-defaultborder">
                    <li>
                        <div className="flex items-center gap-2">
                            <div>
                                <span className="avatar avatar-sm avatar-rounded bg-primary-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-device-ipad">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M18 3a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2l12 0" />
                                        <path d="M9 18h6" />
                                    </svg>
                                </span>
                            </div>

                            <div className="flex-1">
                                <span className="font-semibold text-[13px]">Tablet</span>
                            </div>

                            <div className="text-end">
                                <span className="font-medium">9.3K</span>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-center gap-2">
                            <div>
                                <span className="avatar avatar-sm avatar-rounded bg-warning-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-device-mobile-charging">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -14" />
                                        <path d="M11 4h2" />
                                        <path d="M12 9.5l-1 2.5h2l-1 2.5" />
                                    </svg>
                                </span>
                            </div>

                            <div className="flex-1">
                                <span className="font-semibold text-[13px]">Mobile</span>
                            </div>

                            <div className="text-end">
                                <span className="font-medium">25.3K</span>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-center gap-2">
                            <div>
                                <span className="avatar avatar-sm avatar-rounded bg-success-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-device-desktop">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10" />
                                        <path d="M7 20h10" />
                                        <path d="M9 16v4" />
                                        <path d="M15 16v4" />
                                    </svg>
                                </span>
                            </div>

                            <div className="flex-1">
                                <span className="font-semibold text-[13px]">Desktop</span>
                            </div>

                            <div className="text-end">
                                <span className="font-medium">8.4K</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div className="2xl:col-span-6 col-span-12 xl:order-3">
        <div className="box overflow-hidden">
            <div className="box-header">
                <div className="box-title">Browser Statistics</div>
            </div>
            <div className="box-body p-0!">
                <div className="table-responsive browser-table">
                    <table className="table ti-custom-table ti-custom-table-head text-nowrap mb-0">
                        <thead className="table-header-light">
                            <tr>
                                <th>Browser</th>
                                <th className="text-center">Device</th>
                                <th className="text-center">Bounce Rate</th>
                                <th className="text-center">Sessions</th>
                                <th className="text-center">Session Duration</th>
                                <th className="text-center">Conversion %</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>
                                    <div className="flex items-center">
                                        <div className="me-2">
                                            <span className="avatar avatar-rounded avatar-md p-1 bg-secondary-transparent border border-secondary/10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        className="icon icon-tabler icon-tabler-brand-chrome">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                                        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                                        <path d="M12 9h8.4" />
                                                        <path d="M14.598 13.5l-4.2 7.275" />
                                                        <path d="M9.402 13.5l-4.2 -7.275" />
                                                    </svg>
                                            </span>
                                        </div>
                                        <div className="flex-[1_1_auto]">
                                            <span className="font-medium">Chrome</span>
                                            <span className="block text-textmuted fs-12">Google Browser</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <span className="badge bg-success-transparent">Desktop</span>
                                </td>
                                <td className="text-end">
                                    <span className="inline-flex items-center text-success">
                                        <i className="fe fe-arrow-up-right me-1"></i>32.5%
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">21,436</span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">4m 28s</span>
                                </td>
                                <td className="text-center">
                                    <span className="font-semibold text-success">6.8%</span>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <div className="flex items-center">
                                        <div className="me-2">
                                            <span className="avatar avatar-rounded avatar-md p-1 bg-primary-transparent border border-primary/10">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        className="icon icon-tabler icon-tabler-compass">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <path d="M8 16l2 -6l6 -2l-2 6l-6 2" />
                                                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                                        <path d="M12 3l0 2" />
                                                        <path d="M12 19l0 2" />
                                                        <path d="M3 12l2 0" />
                                                        <path d="M19 12l2 0" />
                                                    </svg>
                                            </span>
                                        </div>
                                        <div className="flex-[1_1_auto]">
                                            <span className="font-medium">Safari</span>
                                            <span className="block text-textmuted fs-12">Apple Browser</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <span className="badge bg-info-transparent">Mobile</span>
                                </td>
                                <td className="text-end">
                                    <span className="inline-flex items-center text-success">
                                        <i className="fe fe-arrow-up-right me-1"></i>41.2%
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">19,124</span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">3m 12s</span>
                                </td>
                                <td className="text-center">
                                    <span className="font-semibold text-success">4.5%</span>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <div className="flex items-center">
                                        <div className="me-2">
                                            <span className="avatar avatar-rounded avatar-md p-1 bg-danger-transparent border border-danger/10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="currentColor"
                                                        className="icon icon-tabler icon-tabler-brand-opera">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-5 2.66c-2.285 0 -3.915 2.619 -3.997 5.752l-.003 .248c0 3.242 1.655 6 4 6s4 -2.758 4 -6s-1.655 -6 -4 -6" />
                                                    </svg>
                                            </span>
                                        </div>
                                        <div className="flex-[1_1_auto]">
                                            <span className="font-medium">Opera</span>
                                            <span className="block text-textmuted fs-12">Opera Browser</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <span className="badge bg-info-transparent">Mobile</span>
                                </td>
                                <td className="text-end">
                                    <span className="inline-flex items-center text-danger">
                                        <i className="fe fe-arrow-down-right me-1"></i>38.6%
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">17,235</span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">2m 46s</span>
                                </td>
                                <td className="text-center">
                                    <span className="font-semibold text-danger">2.3%</span>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <div className="flex items-center">
                                        <div className="me-2">
                                            <span className="avatar avatar-rounded avatar-md p-1 bg-warning-transparent border border-warning/10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        className="icon icon-tabler icon-tabler-brand-firefox">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <path d="M4.028 7.82a9 9 0 1 0 12.823 -3.4c-1.636 -1.02 -3.064 -1.02 -4.851 -1.02h-1.647" />
                                                        <path d="M4.914 9.485c-1.756 -1.569 -.805 -5.38 .109 -6.17c.086 .896 .585 1.208 1.111 1.685c.88 -.275 1.313 -.282 1.867 0c.82 -.91 1.694 -2.354 2.628 -2.093c-1.082 1.741 -.07 3.733 1.371 4.173c-.17 .975 -1.484 1.913 -2.76 2.686c-1.296 .938 -.722 1.85 0 2.234c.949 .506 3.611 -1 4.545 .354c-1.698 .102 -1.536 3.107 -3.983 2.727c2.523 .957 4.345 .462 5.458 -.34c1.965 -1.52 2.879 -3.542 2.879 -5.557c-.014 -1.398 .194 -2.695 -1.26 -4.75" />
                                                    </svg>
                                            </span>
                                        </div>
                                        <div className="flex-[1_1_auto]">
                                            <span className="font-medium">Firefox</span>
                                            <span className="block text-textmuted fs-12">Mozilla Browser</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <span className="badge bg-success-transparent">Desktop</span>
                                </td>
                                <td className="text-end">
                                    <span className="inline-flex items-center text-success">
                                        <i className="fe fe-arrow-up-right me-1"></i>29.8%
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">15,478</span>
                                </td>
                                <td className="text-center">
                                    <span className="text-[14px] font-medium">3m 54s</span>
                                </td>
                                <td className="text-center">
                                    <span className="font-semibold text-success">5.6%</span>
                                </td>
                            </tr>

                            <tr>
                                <td className="border-b-0">
                                    <div className="flex items-center">
                                        <div className="me-2">
                                            <span className="avatar avatar-rounded avatar-md p-1 bg-info-transparent border border-info/10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        className="icon icon-tabler icon-tabler-brand-edge">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <path d="M20.978 11.372a9 9 0 1 0 -1.593 5.773" />
                                                        <path d="M20.978 11.372c.21 2.993 -5.034 2.413 -6.913 1.486c1.392 -1.6 .402 -4.038 -2.274 -3.851c-1.745 .122 -2.927 1.157 -2.784 3.202c.28 3.99 4.444 6.205 10.36 4.79" />
                                                        <path d="M3.022 12.628c-.283 -4.043 8.717 -7.228 11.248 -2.688" />
                                                        <path d="M12.628 20.978c-2.993 .21 -5.162 -4.725 -3.567 -9.748" />
                                                    </svg>
                                            </span>
                                        </div>
                                        <div className="flex-[1_1_auto]">
                                            <span className="font-medium">Edge</span>
                                            <span className="block text-textmuted fs-12">Microsoft Browser</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center border-b-0">
                                    <span className="badge bg-info-transparent">Mobile</span>
                                </td>
                                <td className="text-end border-b-0">
                                    <span className="inline-flex items-center text-danger">
                                        <i className="fe fe-arrow-down-right me-1"></i>35.4%
                                    </span>
                                </td>
                                <td className="text-center border-b-0">
                                    <span className="text-[14px] font-medium">12,344</span>
                                </td>
                                <td className="text-center border-b-0">
                                    <span className="text-[14px] font-medium">2m 58s</span>
                                </td>
                                <td className="text-center border-b-0">
                                    <span className="font-semibold text-danger">3.1%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div className="2xl:col-span-3 xl:col-span-6 col-span-12 xl:order-2">
        <div className="box activity-modern-card">
            <div className="box-header">
                <div className="box-title">Recent Activity</div>
            </div>
            <div className="box-body relative p-0! pb-4!">
                <ul className="activity-feed">

                    <li className="activity-item">
                        <div className="activity-icon">
                            <div className="avatar avatar-rounded">
                                <img src="/assets/images/faces/5.jpg" alt="" />
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">
                                <div className="fs-16 font-medium">Proposal Sent</div>
                                <span className="activity-time">10 min ago</span>
                            </div>
                            <p className="activity-text">
                                Email sent to John Doe regarding product demo.
                            </p>
                            <span className="activity-file bg-primary-transparent text-primary">
                                <i className="ti ti-send"></i>
                                Email Activity
                            </span>
                        </div>
                    </li>

                    <li className="activity-item">
                        <div className="activity-icon">
                            <div className="avatar avatar-rounded bg-success">
                                <span className="font-semibold">SB</span>
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">
                                <div className="fs-16 font-medium">Shannon Baker</div>
                                <span className="activity-time">28 min ago</span>
                            </div>
                            <p className="activity-text">
                                Uploaded a new proposal document for review.
                            </p>
                            <span className="activity-file bg-danger-transparent text-danger">
                                <i className="ti ti-file-analytics"></i>
                                Proposal.pdf
                            </span>
                        </div>
                    </li>

                    <li className="activity-item">
                        <div className="activity-icon">
                            <div className="avatar avatar-rounded">
                                <img src="/assets/images/faces/2.jpg" alt="" />
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">
                                <div className="fs-16 font-medium">Charlie Brown</div>
                                <span className="activity-time">45 min ago</span>
                            </div>
                            <p className="activity-text">
                                Commented on a photo -
                                <span className="activity-highlight text-success">"Beautiful"</span>
                            </p>
                            <span className="activity-file bg-success-transparent text-success">
                                <i className="ti ti-message-circle"></i>
                                New Comment
                            </span>
                        </div>
                    </li>

                    <li className="activity-item">
                        <div className="activity-icon">
                            <div className="avatar avatar-rounded bg-secondary">
                                <span className="font-semibold">JS</span>
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">
                                <div className="fs-16 font-medium">Jane Smith</div>
                                <span className="activity-time">1 hr ago</span>
                            </div>
                            <p className="activity-text">
                                Updated the product description for
                                <span className="activity-highlight text-info">Widget X</span>
                            </p>
                            <span className="activity-file bg-info-transparent text-info">
                                <i className="ti ti-edit"></i>
                                Product Updated
                            </span>
                        </div>
                    </li>

                    <li className="activity-item">
                        <div className="activity-icon">
                            <div className="avatar avatar-rounded">
                                <img src="/assets/images/faces/3.jpg" alt="" />
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-title">
                                <div className="fs-16 font-medium">Priya Mehta</div>
                                <span className="activity-time">2 hrs ago</span>
                            </div>
                            <p className="activity-text">
                                Added feedback on a shared media item -
                                <span className="activity-highlight text-success">"Beautiful"</span>
                            </p>
                            <span className="activity-file bg-warning-transparent text-warning">
                                <i className="ti ti-photo"></i>
                                Photo Feedback
                            </span>
                        </div>
                    </li>

                </ul>
            </div>
        </div>
    </div>
 </div>


  </>
  )
}
