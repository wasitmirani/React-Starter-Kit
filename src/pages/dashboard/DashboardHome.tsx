import BreadCrumb from '@/components/common/BreadCrumb'
import { SortByDropdown } from '@/components/common/SortByDropdown/SortByDropdown'

export function DashboardHome() {
  return (
  <>
    <BreadCrumb activePage="CRM Dashboard" breadcrumbs={[ {label: "Dashboards", href: "/dashboard"}]} />
    {/* Start:: row-1 */}
                <div className="grid grid-cols-12 gap-x-4 dashboard-home">
                    <div className="xl:col-span-6 col-span-12 box-col-12">
                        <div className="grid grid-cols-12 gap-x-4">
                            <div className="xl:col-span-4 lg:col-span-4 col-span-12">
                                <div className="box dashboard-main-card primary">
                                    <div className="box-body">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="block text-muted mb-1">Total Projects</span>
                                                <div className="font-semibold fs-22 mb-2">2,755</div>
                                                <div>
                                                    <span className="badge bg-success-transparent me-1 d-inline-block">
                                                        <i className="ri-arrow-up-line me-1 fs-10"></i>2.13%
                                                    </span>
                                                    <span className="text-muted fs-13">Last Month</span>
                                                </div>
                                            </div>
                                            <div className="leading-none">
                                                <span className="avatar avatar-md bg-primary-transparent fill-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#000000"><g fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M3 12c0 3.771 0 7.657 1.318 8.828C5.636 22 7.758 22 12 22c4.243 0 6.364 0 7.682-1.172C21 19.657 21 15.771 21 12"/><path d="m14.66 14.202l6.198-1.86c.41-.123.616-.184.768-.306a1 1 0 0 0 .3-.404c.074-.18.074-.395.074-.824c0-1.688 0-2.531-.33-3.175a3 3 0 0 0-1.303-1.303C19.723 6 18.88 6 17.192 6H6.808c-1.688 0-2.531 0-3.175.33A3 3 0 0 0 2.33 7.633C2 8.277 2 9.12 2 10.808c0 .429 0 .643.073.824a1 1 0 0 0 .3.404c.153.122.358.183.77.307l6.197 1.859"/><path stroke-linecap="round" d="M14 12.5h-4a.5.5 0 0 0-.5.5v2.162a.5.5 0 0 0 .314.464l.7.28a4 4 0 0 0 2.972 0l.7-.28a.5.5 0 0 0 .314-.464V13a.5.5 0 0 0-.5-.5ZM9.17 4a3.001 3.001 0 0 1 5.66 0"/></g></svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-4 lg:col-span-4 col-span-12">
                                <div className="box dashboard-main-card success">
                                    <div className="box-body">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="block text-muted mb-1">Completed Projects</span>
                                                <div className="font-semibold fs-22 mb-2">847</div>
                                                <div>
                                                    <span className="badge bg-danger-transparent me-1 d-inline-block">
                                                        <i className="ri-arrow-down-line me-1 fs-10"></i>0.64%
                                                    </span>
                                                    <span className="text-muted fs-13">Last Month</span>
                                                </div>
                                            </div>
                                            <div className="leading-none">
                                                <span className="avatar avatar-md bg-success-transparent svg-success">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#000000"><g fill="none" stroke="var(--color-success)" stroke-width="2"><path d="M16 4c2.175.012 3.353.109 4.121.877C21 5.756 21 7.17 21 9.998v6c0 2.829 0 4.243-.879 5.122c-.878.878-2.293.878-5.121.878H9c-2.828 0-4.243 0-5.121-.878C3 20.24 3 18.827 3 15.998v-6c0-2.828 0-4.242.879-5.121C4.647 4.109 5.825 4.012 8 4"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 13.4l1.714 1.6L15 11"/><path d="M8 3.5A1.5 1.5 0 0 1 9.5 2h5A1.5 1.5 0 0 1 16 3.5v1A1.5 1.5 0 0 1 14.5 6h-5A1.5 1.5 0 0 1 8 4.5v-1Z"/></g></svg>                                               
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-4 lg:col-span-4 col-span-12">
                                <div className="box dashboard-main-card secondary">
                                    <div className="box-body">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="block text-muted mb-1">In Progress Projects</span>
                                                <div className="font-semibold  fs-22 mb-2">1,763</div>
                                                <div>
                                                    <span className="badge bg-success-transparent me-1 d-inline-block">
                                                        <i className="ri-arrow-up-line me-1 fs-10"></i>2.64%
                                                    </span>
                                                    <span className="text-muted fs-13">Last Month</span>
                                                </div>
                                            </div>
                                            <div className="leading-none">
                                                <span className="avatar avatar-md bg-secondary-transparent svg-secondary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#000000"><g fill="none" stroke="var(--color-secondary)" stroke-width="2"><path d="m12 12l-2.958 2.929c-2.922 2.894-4.383 4.341-3.974 5.59c.035.107.078.211.13.312C5.8 22 7.867 22 12 22c4.133 0 6.2 0 6.802-1.17c.052-.1.095-.204.13-.311c.41-1.249-1.052-2.696-3.974-5.59L12 12Zm0 0l2.958-2.929c2.922-2.894 4.383-4.341 3.974-5.59a2.12 2.12 0 0 0-.13-.312C18.2 2 16.133 2 12 2C7.867 2 5.8 2 5.198 3.17c-.052.1-.095.204-.13.311c-.41 1.249 1.052 2.696 3.974 5.59L12 12Z"/><path stroke-linecap="round" d="M10 5.5h4m-4 13h4"/></g></svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-12 col-span-12">
                                <div className="box overflow-hidden">
                                    <div className="box-header border-bottom-0 pb-0 justify-between">
                                        <div className="box-title">
                                            Priority Task
                                        </div>
                                        <button className="ti-btn ti-btn-light ti-btn-sm ti-btn-icon">
                                            <i className="ri-arrow-right-s-line fs-22"></i>
                                        </button>
                                    </div>
                                    <div className="box-body">
                                        <div className="swiper swiper-task">
                                            <div className="swiper-wrapper">
                                                <div className="swiper-slide">
                                                    <div className="p-6 border border-defaultborder rounded">
                                                        <div className="flex gap-2 mb-2 justify-between">
                                                            <p className="mb-0 font-medium fs-16">
                                                             Refine and Verify Project Documentation
                                                            </p>
                                                            <div>
                                                             <span className="badge bg-warning-transparent">
                                                                 Review
                                                             </span>
                                                            </div>
                                                         </div>
                                                         <div className="flex mb-2 gap-2 justify-between">
                                                             <span className="text-muted">50% Project Done</span>
                                                            <span className="font-medium">18/22</span>
                                                         </div>
                                                         <div className="progress bg-primary-transparent progress-animate mb-2 progress-xs w-100" 
                                                         role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
                                                             <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" style={{width: '72%'}}></div>
                                                         </div>
                                                         <span className="text-muted">Due: Jan 08th, 2026</span>
                                                         <div className="p-2 bg-light mt-2 rounded flex justify-between">
                                                            <div className="avatar-list-stacked">
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/2.jpg" alt="img" />
                                                                </span>
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/8.jpg" alt="img" />
                                                                </span>
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/13.jpg" alt="img" />
                                                                </span>
                                                                <a className="avatar bg-primary avatar-rounded avatar-sm" href="javascript:void(0);">
                                                                    +8
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <span className="badge bg-light fs-12 text-muted rounded-pill border text-default"><i className="ri-calendar-line"></i> 1 week Left</span>
                                                            </div>
                                                         </div>
                                                    </div>
                                                </div>
                                                <div className="swiper-slide">
                                                    <div className="p-6 border border-defaultborder rounded">
                                                        <div className="flex gap-3 mb-2 justify-between">
                                                            <p className="mb-0 font-medium fs-16">
                                                                Enhance Clarity and Consistency in Project Records
                                                            </p>
                                                            <div>
                                                             <span className="badge bg-success-transparent">
                                                                Quality
                                                             </span>
                                                            </div>
                                                         </div>
                                                         <div className="flex mb-2 gap-2 justify-between">
                                                             <span className="text-muted">76% Project Done</span>
                                                             <span className="font-medium">12/18</span>
                                                         </div>
                                                         <div className="progress progress-animate bg-secondary-transparent mb-2 progress-xs w-100" 
                                                         role="progressbar" aria-valuenow={55} aria-valuemin={0} aria-valuemax={100}>
                                                             <div className="progress-bar progress-bar-striped progress-bar-animated bg-secondary!" style={{width: '55%'}}></div>
                                                         </div>
                                                         <span className="text-muted">Due: Feb 12th, 2026</span>
                                                         <div className="p-2 bg-light mt-2 rounded flex justify-between">
                                                            <div className="avatar-list-stacked">
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/2.jpg" alt="img" />
                                                                </span>
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/13.jpg" alt="img" />
                                                                </span>
                                                                <a className="avatar bg-primary avatar-rounded avatar-sm" href="javascript:void(0);">
                                                                    +8
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <span className="badge bg-light fs-12 text-muted rounded-pill border text-default"><i className="ri-calendar-line"></i> 2 week Left</span>
                                                            </div>
                                                         </div>
                                                    </div>
                                                </div>
                                                <div className="swiper-slide">
                                                    <div className="p-6 border border-defaultborder rounded">
                                                        <div className="flex gap-3 mb-2 justify-between">
                                                            <p className="mb-0 font-medium fs-16">
                                                                Collaborate on Document Review and Editing
                                                            </p>
                                                            <div>
                                                             <span className="badge bg-secondary-transparent">
                                                                 Edit
                                                             </span>
                                                            </div>
                                                         </div>
                                                         <div className="flex mb-2 gap-2 justify-between">
                                                             <span className="text-muted">86% Project Done</span>
                                                             <span className="font-medium">15/32</span>
                                                         </div>
                                                         <div className="progress progress-animate bg-success-transparent mb-2 progress-xs w-100" 
                                                         role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
                                                             <div className="progress-bar progress-bar-striped progress-bar-animated bg-success!" style={{width: '85%'}}></div>
                                                         </div>
                                                         <span className="text-muted">Due: Dec 21th, 2026</span>
                                                         <div className="p-2 bg-light mt-2 rounded flex justify-between">
                                                            <div className="avatar-list-stacked">
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/2.jpg" alt="img" />
                                                                </span>
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/8.jpg" alt="img" />
                                                                </span>
                                                                <span className="avatar avatar-rounded avatar-sm">
                                                                    <img src="/assets/images/faces/13.jpg" alt="img" />
                                                                </span>
                                                                <a className="avatar bg-primary avatar-rounded avatar-sm" href="javascript:void(0);">
                                                                    +8
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <span className="badge bg-light fs-12 text-muted rounded-pill border text-default"><i className="ri-calendar-line"></i> 5 week Left</span>
                                                            </div>
                                                         </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-6 col-span-12 box-col-12">
                        <div className="grid grid-cols-12 gap-x-4">
                            <div className="xl:col-span-6 col-span-12">
                                <div className="box overflow-hidden">
                                    <div className="box-header">
                                        <div className="box-title">
                                            Task Activity
                                        </div>
                                    </div>
                                    <div className="box-body p-0!">
                                        <div id="task-activity"></div>
                                    </div>
                                    <div className="box-footer border-t-0!">
                                        <div className="grid grid-cols-12 gap-2">
                                          <div className="xl:col-span-6 col-span-12 box-col-12">
                                            <div className="flex items-center gap-2 p-2 border border-defaultborder rounded-sm border-dashed">
                                                <div className="flex-grow-1">
                                                    <span className="block"><i className="ri-circle-fill fs-10 leading-none align-middle text-primary"></i> On-Going </span>
                                                </div>
                                                <div className="font-semibold">440</div>
                                            </div>
                                          </div>
                                          <div className="xl:col-span-6 col-span-12 box-col-12">
                                            <div className="flex items-center gap-2 p-2 border border-defaultborder rounded-sm border-dashed">
                                                <div className="flex-grow-1">
                                                    <span className="block"><i className="ri-circle-fill fs-10 leading-none align-middle text-success"></i> Completed </span>
                                                </div>
                                                <div className="font-semibold">550</div>
                                            </div>
                                          </div>
                                          <div className="xl:col-span-6 col-span-12 box-col-12">
                                            <div className="flex items-center gap-2 p-2 border border-defaultborder rounded-sm border-dashed">
                                                <div className="flex-grow-1">
                                                    <span className="block"><i className="ri-circle-fill fs-10 leading-none align-middle text-warning"></i> To Do </span>
                                                </div>
                                                <div className="font-semibold">670</div>
                                            </div>
                                          </div>
                                          <div className="xl:col-span-6 col-span-12 box-col-12">
                                            <div className="flex items-center gap-2 p-2 border border-defaultborder rounded-sm border-dashed">
                                                <div className="flex-grow-1">
                                                    <span className="block"><i className="ri-circle-fill fs-10 leading-none align-middle text-secondary"></i> Pending </span>
                                                </div>
                                                <div className="font-semibold">830</div>
                                            </div>
                                          </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-6 col-span-12">
                                <div className="box overflow-hidden">
                                    <div className="box-header">
                                        <div className="box-title">
                                            Today's Schedule
                                        </div>
                                    </div>  
                                    <div className="box-body">
                                        <ul className="list-unstyled projects-recent-transactions-list">
                                            <li>
                                                <div className="flex items-center gap-2">
                                                    <div className="leading-none">
                                                        <span className="avatar avatar-md avatar-rounded bg-primary-transparent">
                                                            <i className="ri-earth-line fs-22"></i>
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <span className="block font-semibold">Development Planning</span>
                                                        <span className="fs-13 text-muted">iTest Factory - 9:20 AM</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="block font-semibold">12 min</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="flex items-center gap-2">
                                                    <div className="leading-none">
                                                        <span className="avatar avatar-md avatar-rounded bg-secondary-transparent">
                                                            <i className="ri-markup-line fs-22"></i>
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <span className="block font-semibold">Design New UI & Check Sales</span>
                                                        <span className="fs-13 text-muted">Meta4Systems - 11:30 AM</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="block font-semibold">25 min</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="flex items-center gap-2">
                                                    <div className="leading-none">
                                                        <span className="avatar avatar-md avatar-rounded bg-warning-transparent">
                                                            <i className="ri-calendar-2-line fs-22"></i>
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <span className="block font-semibold">Weekly Catch-Up</span>
                                                        <span className="fs-13 text-muted">Nesta Technologies - 2:00 PM</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="block font-semibold">27 min</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="flex items-center gap-2">
                                                    <div className="leading-none">
                                                        <span className="avatar avatar-md avatar-rounded bg-info-transparent">
                                                            <i className="ri-slideshow-line fs-22"></i>
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <span className="block font-semibold">Client Meeting: James Bangs</span>
                                                        <span className="fs-13 text-muted">Nesta Technologies - 3:45 PM</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="block font-semibold">30 min</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="flex items-center gap-2">
                                                    <div className="leading-none">
                                                        <span className="avatar avatar-md avatar-rounded bg-danger-transparent">
                                                            <i className="ri-feedback-line fs-22"></i>
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <span className="block font-semibold">Review Project Proposals</span>
                                                        <span className="fs-13 text-muted">Meta4Systems - 4:30 PM</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="block font-semibold">20 min</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="flex items-center gap-2">
                                                    <div className="leading-none">
                                                        <span className="avatar avatar-md avatar-rounded bg-success-transparent">
                                                            <i className="ri-group-3-line fs-22"></i>
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <span className="block font-semibold">Team Retrospective</span>
                                                        <span className="fs-13 text-muted">iTest Factory - 5:15 PM</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="block font-semibold">45 min</span>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-8 col-span-12">
                        <div className="box">
                            <div className="box-header">
                                <div className="box-title">
                                    Projects Overview
                                </div>
                            </div>
                            <div className="box-body">
                                <div id="projects-overview"></div>
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-4 col-span-12">
                        <div className="box">
                            <div className="box-header">
                                <div className="box-title">
                                    Recent Activity
                                </div>
                            </div>
                            <div className="box-body">
                                <ul className="list-unstyled projects-recent-activity-list">
                                    <li>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <span className="avatar avatar-md avatar-rounded online">
                                                    <img src="/assets/images/faces/8.jpg" alt="" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="flex items-start justify-between mb-1 flex-wrap">
                                                    <div className="block font-semibold">Jane Doe</div>
                                                    <span className="badge bg-light text-default border border-defaultborder">February 17, 2025</span>
                                                </div>
                                                <div className="block fs-14 text-muted">The redesign for NovaStream has been successfully completed. The new website is now live and accessible for users.</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <span className="avatar avatar-md avatar-rounded online">
                                                    <img src="/assets/images/faces/11.jpg" alt="" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="flex items-start justify-between mb-1 flex-wrap">   
                                                    <div className="block font-semibold">John Smith</div>
                                                    <span className="badge bg-light text-default border border-defaultborder">February 16, 2025</span>
                                                </div>
                                                <div className="block fs-14 text-muted">UI redesign completed and deployed.</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <span className="avatar avatar-md avatar-rounded online">
                                                    <img src="/assets/images/faces/9.jpg" alt="" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="flex items-start justify-between mb-1 flex-wrap">
                                                    <div className="block font-semibold">Sarah Lee</div>
                                                    <span className="badge bg-light text-default border border-defaultborder">February 15, 2025</span>
                                                </div>
                                                <div className="block fs-14 text-muted mb-1">New algorithm ready for review.</div>
                                                <div className="p-1 border border-dotted border-defaultborder rounded position-relative"> 
                                                    <a href="javascript:void(0);" className="stretched-link"></a>
                                                    <div className="flex items-center gap-2"> 
                                                        <span className="badge bg-success">PPT</span> 
                                                        <span className="fs-12">Project_discussion</span> 
                                                    </div> 
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <span className="avatar avatar-md avatar-rounded online">
                                                    <img src="/assets/images/faces/7.jpg" alt="" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="flex items-start justify-between mb-1 flex-wrap">
                                                    <div className="block font-semibold">Emily Clark</div>
                                                    <span className="badge bg-light text-default border border-defaultborder">February 13, 2025</span>
                                                </div>
                                                <div className="block fs-14 text-muted">Integrated third-party tools</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <span className="avatar avatar-md avatar-rounded online">
                                                    <img src="/assets/images/faces/4.jpg" alt="" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="flex items-start justify-between mb-1 flex-wrap">
                                                    <div className="block font-semibold">Lisa Simpson</div>
                                                    <span className="badge bg-light text-default border border-defaultborder">February 14, 2025</span>
                                                </div>
                                                <div className="block fs-14 text-muted">Backend Optimization</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <span className="avatar avatar-md avatar-rounded online">
                                                    <img src="/assets/images/faces/14.jpg" alt="" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="flex items-start justify-between mb-1 flex-wrap">
                                                    <div className="block font-semibold">	Nyomi Gray</div>
                                                    <span className="badge bg-light text-default border border-defaultborder">July 12, 2025</span>
                                                </div>
                                                <div className="block fs-14 text-muted">Landing page updated design with clean code</div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-x-4">
                    <div className="xl:col-span-3 col-span-12 box-col-12">
                        <div className="box overflow-hidden">
                            <div className="box-header">
                                <div className="box-title">Team Performance</div>
                            </div>
                            <div className="box-body">
                                <ul className="list-unstyled team-performance-list mb-0">
                                    <li>
                                        <div className="flex items-center gap-2">
                                            <span className="avatar avatar-md avatar-rounded bg-primary-transparent">
                                                <img src="/assets/images/faces/15.jpg" alt="" />
                                            </span>
                                            <div className="flex-grow-1">
                                                <span className="block font-semibold">Ethan Carter</span>
                                                <span className="fs-13 text-muted">18 Assigned • 15 Completed</span>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-success-transparent">94%</span>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-2">
                                            <span className="avatar avatar-md avatar-rounded bg-secondary-transparent">
                                                <img src="/assets/images/faces/8.jpg" alt="" />
                                            </span>
                                            <div className="flex-grow-1">
                                                <span className="block font-semibold">Sophia Reed</span>
                                                <span className="fs-13 text-muted">21 Assigned • 17 Completed</span>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-warning-transparent">81%</span>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-2">
                                            <span className="avatar avatar-md avatar-rounded bg-info-transparent">
                                                <img src="/assets/images/faces/12.jpg" alt="" />
                                            </span>
                                            <div className="flex-grow-1">
                                                <span className="block font-semibold">Mason Blake</span>
                                                <span className="fs-13 text-muted">33 Assigned • 29 Completed</span>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-success-transparent">89%</span>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-2">
                                            <span className="avatar avatar-md avatar-rounded bg-success-transparent">
                                                <img src="/assets/images/faces/3.jpg" alt="" />
                                            </span>
                                            <div className="flex-grow-1">
                                                <span className="block font-semibold">Olivia Hayes</span>
                                                <span className="fs-13 text-muted">27 Assigned • 25 Completed</span>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-success-transparent">97%</span>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-2">
                                            <span className="avatar avatar-md avatar-rounded bg-danger-transparent">
                                                <img src="/assets/images/faces/5.jpg" alt="" />
                                            </span>
                                            <div className="flex-grow-1">
                                                <span className="block font-semibold">Noah Bennett</span>
                                                <span className="fs-13 text-muted">39 Assigned • 31 Completed</span>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-danger-transparent">76%</span>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-2">
                                            <span className="avatar avatar-md avatar-rounded bg-danger-transparent">
                                                <img src="/assets/images/faces/13.jpg" alt="" />
                                            </span>
                                            <div className="flex-grow-1">
                                                <span className="block font-semibold">Lisa Simpson</span>
                                                <span className="fs-13 text-muted">34 Assigned • 23 Completed</span>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-warning-transparent">67%</span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-5 col-span-12 box-col-6">
                        <div className="box overflow-hidden">
                            <div className="box-header justify-between">
                                <div className="box-title">
                                    Upcoming Deadlines
                                </div>
                                <SortByDropdown buttonClassName="ti-btn-light" />
                            </div>
                            <div className="box-body p-0!">
                                <div className="table-responsive">
                                    <table className="table ti-custom-table text-nowrap">
                                        <thead>
                                            <tr>
                                                <th>Task</th>
                                                <th>Priority</th>
                                                <th>Deadline</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="form-check mb-0">
                                                            <input className="form-check-input" type="checkbox" value="" id="urgent-task1" />
                                                        </div>
                                                        <a href="javascript:void(0);" className="urgent-task-title font-medium text-default">Fix Critical Bug in Payment Gateway</a>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-success">Low</span>
                                                </td>
                                                <td>
                                                    18-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary-transparent">In Progress</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="form-check mb-0">
                                                            <input className="form-check-input" type="checkbox" value="" id="urgent-task2" />
                                                        </div>
                                                        <a href="javascript:void(0);" className="urgent-task-title font-medium text-default">Deploy Latest Security Update</a>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-danger">High</span>
                                                </td>
                                                <td>
                                                    19-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-warning-transparent">
                                                        Pending
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="form-check mb-0">
                                                            <input className="form-check-input" type="checkbox" value="" id="urgent-task3" />
                                                        </div>
                                                        <a href="javascript:void(0);" className="urgent-task-title font-medium text-default">Complete Mobile App Feature Testing</a>
                                                    </div>
                                                </td>
                                                <td>
                                                   <span className="text-secondary">Medium</span>
                                                </td>
                                                <td>
                                                    21-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-success-transparent">
                                                        Completed
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="form-check mb-0">
                                                            <input className="form-check-input" type="checkbox" value="" id="urgent-task4" />
                                                        </div>
                                                        <a href="javascript:void(0);" className="urgent-task-title font-medium text-default">Resolve User Account Login Issue</a>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-danger">High</span>
                                                </td>
                                                <td>
                                                    17-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary-transparent">
                                                        In Progress
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border-bottom-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="form-check mb-0">
                                                            <input className="form-check-input" type="checkbox" value="" id="urgent-task6" />
                                                        </div>
                                                        <a href="javascript:void(0);" className="urgent-task-title font-medium text-default">Update API for New Payment Method</a>
                                                    </div>
                                                </td>
                                                <td className="border-bottom-0">
                                                    <span className="text-danger">High</span>
                                                </td>
                                                <td className="border-bottom-0">
                                                    22-02-2025
                                                </td>
                                                <td className="border-bottom-0">
                                                    <span className="badge bg-success-transparent">
                                                        Completed
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="box-footer">
                                <div className="flex items-center">
                                    <div> Showing 5 Entries <i className="bi bi-arrow-right ms-2 font-semibold"></i> </div>
                                    <div className="ms-auto">
                                        <nav aria-label="Page navigation" className="pagination-style-5">
                                            <ul className="ti-pagination mb-0!">
                                                <li className="page-item disabled">
                                                    <a className="page-link" href="javascript:void(0);" aria-label="Previous page">
                                                        <i className="ri-arrow-left-s-line"></i>
                                                    </a>
                                                </li>
                                                <li className="page-item"><a className="page-link" href="javascript:void(0);">1</a></li>
                                                <li className="page-item active"><a className="page-link active" href="javascript:void(0);">2</a></li>
                                                <li className="page-item"><a className="page-link" href="javascript:void(0);">3</a></li>
                                                <li className="page-item">
                                                    <a className="page-link" href="javascript:void(0);" aria-label="Next page">
                                                        <i className="ri-arrow-right-s-line"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-4 col-span-12 box-col-6">
                        <div className="box">
                            <div className="box-header pb-0 border-bottom-0 justify-between">
                                <div className="box-title">Project Analytics</div>
                                <a href="javascript:void(0);" className="text-muted fs-13">View All <i className="ti ti-arrow-narrow-right"></i></a>
                            </div>
                            <div className="box-body py-2!">
                                <div className="grid grid-cols-12 gap-x-4">
                                    <div className="xl:col-span-6 col-span-12">
                                       <div id="task-overview"></div>
                                    </div> 
                                    <div className="xl:col-span-6 col-span-12 my-auto">
                                        <ul className="list-group task-overdue-list">
                                            <li className="list-group-item  py-1! px-4! rounded-sm border-0 mb-2 bg-primary-transparent">
                                                <div className="flex items-start justify-between">
                                                    <div className="working-format-type lh-1 completed">
                                                        <div className="font-medium text-default">Designing</div>
                                                    </div>
                                                    <div className="lh-1 text-end">
                                                        <span className="block font-semibold mb-0">1,754</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="list-group-item py-1! px-4! rounded-sm border-0 mb-2 bg-secondary-transparent">
                                                <div className="flex items-start justify-between">
                                                    <div className="working-format-type lh-1 pending">
                                                        <div className="font-medium text-default">Developing</div>
                                                    </div>
                                                    <div className="lh-1 text-end">
                                                        <span className="block font-semibold mb-0">634</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="list-group-item py-1! px-4! rounded-sm border-0 mb-2 bg-success-transparent">
                                                <div className="flex items-start justify-between">
                                                    <div className="working-format-type in-progress lh-1">
                                                        <div className="font-medium text-default">UI Testing</div>
                                                    </div>
                                                    <div className="lh-1 text-end">
                                                        <span className="block font-semibold mb-0">878</span>
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="list-group-item py-1! px-4! rounded-sm border-0 bg-warning-transparent">
                                                <div className="flex items-start justify-between">
                                                    <div className="working-format-type overdue lh-1">
                                                        <div className="font-medium text-default">Bugs Fixing</div>
                                                    </div>
                                                    <div className="lh-1 text-end">
                                                        <span className="block font-semibold mb-0">470</span>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="box">
                            <div className="box-body">
                                <div className="flex gap-2 items-center mb-3">
                                  <span className="avatar avatar-md bg-primary svg-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M240,56v64a8,8,0,0,1-13.66,5.66L200,99.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,188.69,88,162.34,61.66A8,8,0,0,1,168,48h64A8,8,0,0,1,240,56Z"></path></svg>
                                  </span>
                                  <div className="flex-grow-1">
                                    <p className="mb-1!">Total Revenue Generated</p>
                                     <div className="font-semibold fs-16">$16,12,756</div>
                                  </div>
                                    <div> 
                                        <button className="ti-btn ti-btn-icon ti-btn-light rounded-circle">
                                            <i className="ri-arrow-right-up-line"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="lg:col-span-6 col-span-12">
                                       <div className="p-3 rounded-md bg-light text-center">
                                           <p className="mb-1! text-muted">Total Income</p>
                                           <div className="font-semibold mb-0 fs-16">$23,22,745  <span className="text-success fs-13">+12.76%</span></div>
                                       </div>
                                    </div>
                                    <div className="lg:col-span-6 col-span-12">
                                        <div className="p-3 rounded-md bg-light text-center">
                                            <p className="mb-1! text-muted">Total Expense</p>
                                            <div className="font-semibold mb-0 fs-16">$2,05,974  <span className="text-danger fs-13">-34.75%</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End:: row-2 */}

                 {/* Start:: row-3 */}
                 <div className="grid grid-cols-12 gap-x-4">
                    <div className="xl:col-span-12 col-span-12">
                        <div className="box">
                            <div className="box-header justify-between">
                                <div className="box-title">
                                    Projects Summary
                                </div>
                                <div className="flex flex-wrap gap-2"> 
                                    <div> 
                                        <input className="form-control form-control-sm" type="text" placeholder="Search Here" aria-label=".form-control-sm example" /> 
                                    </div> 
                                    <SortByDropdown buttonClassName="ti-btn-primary" />
                                </div>
                            </div>
                            <div className="box-body p-0!">
                                <div className="table-responsive">
                                    <table className="table whitespace-nowrap ti-custom-table mb-0">
                                        <thead>
                                            <tr>
                                                <th scope="col"><input className="form-check-input" type="checkbox" id="checkboxCheckAll" value="" aria-label="..." /></th>
                                                <th scope="col">Project Name</th>
                                                <th scope="col">Start Date</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">End Date</th>
                                                <th scope="col">Progress</th>
                                                <th scope="col">Team</th>
                                                <th scope="col">Budget</th>
                                                <th scope="col">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <input className="form-check-input" type="checkbox" id="checkbox1" value="" aria-label="..." />
                                                </td>
                                                <td>
                                                    NovaStream - UI Overhaul
                                                </td>
                                                <td>
                                                    25-01-2025
                                                </td>
                                                <td>
                                                    <div className="flex items-center">
                                                        <div className="progress progress-animate progress-xs w-100" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                                                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" style={{width: '100%'}}></div>
                                                        </div>
                                                        <div className="ms-2">100%</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    17-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-success-transparent">Completed</span>
                                                </td>
                                                <td>
                                                    <div className="avatar-list-stacked">
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/12.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/5.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/3.jpg" alt="img" />
                                                        </span>
                                                        <a className="avatar avatar-sm bg-primary avatar-rounded text-fixed-white" href="javascript:void(0);">
                                                            +2
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>
                                                    $15,000.00
                                                </td>
                                                 <td>
                                                    <div className="btn-list">
                                                        <button className="ti-btn ti-btn-icon ti-btn-primary-light ti-btn-sm">
                                                            <i className="ti ti-edit"></i>
                                                        </button>
                                                        <button className="ti-btn ti-btn-icon ti-btn-danger-light ti-btn-sm">
                                                            <i className="ti ti-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input className="form-check-input" type="checkbox" id="checkbox2" value="" aria-label="..." />   
                                                </td>
                                                <td>
                                                    TravelSphere - App Features
                                                </td>
                                                <td>
                                                    01-12-2024
                                                </td>
                                                <td>
                                                    <div className="flex items-center">
                                                        <div className="progress progress-animate progress-xs w-100" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                                                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-secondary!" style={{width: '60%'}}></div>
                                                        </div>
                                                        <div className="ms-2">60%</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    30-03-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary-transparent">In Progress</span>
                                                </td>
                                                <td>
                                                    <div className="avatar-list-stacked">
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/13.jpg" alt="img" />
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    $10,000.00
                                                </td>
                                                 <td>
                                                    <div className="btn-list">
                                                        <button className="ti-btn ti-btn-icon ti-btn-primary-light ti-btn-sm">
                                                            <i className="ti ti-edit"></i>
                                                        </button>
                                                        <button className="ti-btn ti-btn-icon ti-btn-danger-light ti-btn-sm">
                                                            <i className="ti ti-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input className="form-check-input" type="checkbox" id="checkbox5" value="" aria-label="..." />
                                                </td>
                                                <td>
                                                    SoundWave - Algorithm Integration
                                                </td>
                                                <td>
                                                    10-11-2024
                                                </td>
                                                <td>
                                                    <div className="flex items-center">
                                                        <div className="progress progress-animate progress-xs w-100" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                                                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning!" style={{width: '100%'}}></div>
                                                        </div>
                                                        <div className="ms-2">100%</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    15-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-success-transparent">Completed</span>
                                                </td>
                                                <td>
                                                    <div className="avatar-list-stacked">
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/1.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/15.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/8.jpg" alt="img" />
                                                        </span>
                                                        <a className="avatar avatar-sm bg-primary avatar-rounded text-fixed-white" href="javascript:void(0);">
                                                            +1
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>
                                                    $20,000.00
                                                </td>
                                                 <td>
                                                    <div className="btn-list">
                                                        <button className="ti-btn ti-btn-icon ti-btn-primary-light ti-btn-sm">
                                                            <i className="ti ti-edit"></i>
                                                        </button>
                                                        <button className="ti-btn ti-btn-icon ti-btn-danger-light ti-btn-sm">
                                                            <i className="ti ti-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input className="form-check-input" type="checkbox" id="checkbox4" value="" aria-label="..." />
                                                </td>
                                                <td>
                                                    RideMaster - Backend Optimization
                                                </td>
                                                <td>
                                                    05-10-2024
                                                </td>
                                                <td>
                                                    <div className="flex items-center">
                                                        <div className="progress progress-animate progress-xs w-100" role="progressbar" aria-valuenow={80} aria-valuemin={0} aria-valuemax={100}>
                                                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-info!" style={{width: '80%'}}></div>
                                                        </div>
                                                        <div className="ms-2">80%</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    14-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary-transparent">In Progress</span>
                                                </td>
                                                <td>
                                                    <div className="avatar-list-stacked">
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/6.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/11.jpg" alt="img" />
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    $12,000.00
                                                </td>
                                                 <td>
                                                    <div className="btn-list">
                                                        <button className="ti-btn ti-btn-icon ti-btn-primary-light ti-btn-sm">
                                                            <i className="ti ti-edit"></i>
                                                        </button>
                                                        <button className="ti-btn ti-btn-icon ti-btn-danger-light ti-btn-sm">
                                                            <i className="ti ti-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input className="form-check-input" type="checkbox" id="checkbox15" value="" aria-label="..." />
                                                </td>
                                                <td>
                                                    Connectify - Tool Integration
                                                </td>
                                                <td>
                                                    01-01-2025
                                                </td>
                                                <td>
                                                    <div className="flex items-center">
                                                        <div className="progress progress-animate progress-xs w-100" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                                                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-success!" style={{width: '100%'}}></div>
                                                        </div>
                                                        <div className="ms-2">100%</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    13-02-2025
                                                </td>
                                                <td>
                                                    <span className="badge bg-success-transparent">Completed</span>
                                                </td>
                                                <td>
                                                    <div className="avatar-list-stacked">
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/4.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/14.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/4.jpg" alt="img" />
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    $8,500.00
                                                </td>
                                                 <td>
                                                    <div className="btn-list">
                                                        <button className="ti-btn ti-btn-icon ti-btn-primary-light ti-btn-sm">
                                                            <i className="ti ti-edit"></i>
                                                        </button>
                                                        <button className="ti-btn ti-btn-icon ti-btn-danger-light ti-btn-sm">
                                                            <i className="ti ti-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border-bottom-0">
                                                    <input className="form-check-input" type="checkbox" id="checkbox3" value="" aria-label="..." />
                                                </td>
                                                <td className="border-bottom-0">
                                                    NovaStream - UI Overhaul
                                                </td>
                                                <td className="border-bottom-0">
                                                    25-01-2025
                                                </td>
                                                <td className="border-bottom-0">
                                                    <div className="flex items-center">
                                                        <div className="progress progress-animate progress-xs w-100" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                                                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger!" style={{width: '100%'}}></div>
                                                        </div>
                                                        <div className="ms-2">100%</div>
                                                    </div>
                                                </td>
                                                <td className="border-bottom-0">
                                                    17-02-2025
                                                </td>
                                                <td className="border-bottom-0">
                                                    <span className="badge bg-success-transparent">Completed</span>
                                                </td>
                                                <td className="border-bottom-0">
                                                    <div className="avatar-list-stacked">
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/12.jpg" alt="img" />
                                                        </span>
                                                        <span className="avatar avatar-sm avatar-rounded">
                                                            <img src="/assets/images/faces/2.jpg" alt="img" />
                                                        </span>
                                                        <a className="avatar avatar-sm bg-primary avatar-rounded text-fixed-white" href="javascript:void(0);">
                                                            +2
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="border-bottom-0">
                                                    $15,000.00
                                                </td>
                                                <td>
                                                    <div className="btn-list">
                                                        <button className="ti-btn ti-btn-icon ti-btn-primary-light ti-btn-sm">
                                                            <i className="ti ti-edit"></i>
                                                        </button>
                                                        <button className="ti-btn ti-btn-icon ti-btn-danger-light ti-btn-sm">
                                                            <i className="ti ti-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="box-footer">
                                <div className="flex flex-wrap gap-2 items-center"> 
                                    <div> Showing 6 Entries <i className="bi bi-arrow-right ms-2 fw-semibold"></i> </div> 
                                    <div className="ms-auto"> 
                                        <nav aria-label="Page navigation" className="pagination-style-5">
                                            <ul className="ti-pagination mb-0!">
                                                <li className="page-item disabled">
                                                    <a aria-label="Previous page" className="page-link" href="javascript:void(0);">
                                                        Prev
                                                    </a>
                                                </li>
                                                <li className="page-item"><a className="page-link" href="javascript:void(0);">1</a></li>
                                                <li className="page-item active"><a className="page-link active" href="javascript:void(0);">2</a></li>
                                                <li className="page-item">
                                                    <a aria-label="More pages" className="page-link" href="javascript:void(0);">
                                                        …
                                                    </a>
                                                </li>
                                                <li className="page-item"><a className="page-link" href="javascript:void(0);">17</a></li>
                                                <li className="page-item">
                                                    <a aria-label="Next page" className="page-link" href="javascript:void(0);">
                                                    Next
                                                    </a>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div> 
                                </div> 
                            </div>
                        </div>
                    </div>
                </div>
                {/* End:: row-3 */}
  </>
  )
}
