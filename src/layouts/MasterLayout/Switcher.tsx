const Switcher = () => {
  return (
   <>
     <div className="overflow-hidden nav-pattern">
         <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" width="1500" height="210" preserveAspectRatio="none" viewBox="0 0 1500 210">
             <g clip-path="url(&quot;#SvgjsClipPath1035&quot;)" fill="none">
                 <circle r="35" cx="14.67" cy="34.92" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="158.25" cy="138.25" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="261.54" cy="267.32" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="443.19" cy="405.59" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="531.32" cy="593.65" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="724.85" cy="700.09" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="872.11" cy="857.17" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="968.97" cy="964.22" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="1137.73" cy="1122.02" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="35" cx="1228.94" cy="1254.14" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="36.285" cx="1206.86" cy="147.33" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="22.21" cx="837.31" cy="167.41" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="54.315" cx="813.12" cy="147.4" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="63.72" cx="896.08" cy="95.33" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="19.885" cx="178.72" cy="126.94" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="39.555" cx="221.51" cy="129.08" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="56.675" cx="763.71" cy="20.39" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="67.425" cx="1440.2" cy="134.63" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="45.81" cx="294.17" cy="18.44" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="39.82" cx="1223.19" cy="103.01" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="61.335" cx="165.9" cy="100.29" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="62.25" cx="579.23" cy="130.38" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="21.145" cx="1095.32" cy="171.8" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="25.665" cx="988.98" cy="75.19" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="48.56" cx="314.19" cy="38.22" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="65.905" cx="1352.26" cy="108.43" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="51.035" cx="388.64" cy="207.04" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="24.93" cx="998.64" cy="140.59" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="21.58" cx="417.5" cy="200.39" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="26.45" cx="1106.53" cy="88.61" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="44.19" cx="883.58" cy="105.13" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
                 <circle r="39.67" cx="488.63" cy="100.52" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"></circle>
             </g>
             <defs>
                 <clipPath id="SvgjsClipPath1035">
                     <rect width="1500" height="210" x="0" y="0"></rect>
                 </clipPath>
             </defs>
         </svg>
     </div>
     
     {/* <!-- Apps Tools Modal --> */}
     
     <div className="modal fade" id="toolAppsModal" tabindex="-1" aria-labelledby="toolAppsModalLabel" aria-hidden="true">
         <div className="modal-dialog modal-xl modal-dialog-centered">
             <div className="modal-content border-0 shadow-lg">
                 <div className="modal-header d-flex align-items-center">
                     <div className="avatar bg-primary-subtle size-10 rounded-circle me-3 flex-shrink-0">
                         <i className="mgc_grid_line text-primary"></i>
                     </div>
                     <div className="flex-grow-1">
                         <h6 className="modal-title mb-1" id="toolAppsModalLabel">App Integration Center</h6>
                         <p className="text-muted small mb-0">Connect and manage your favorite tools and services</p>
                     </div>
                     <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                 </div>
                 <div className="modal-body">
                     <div className="mb-4">
                         <div className="position-relative">
                             <label htmlFor="toolAppsSearch" className="form-label d-none">Search</label>
                             <div className="position-relative">
                                 <input type="text" className="form-control ps-9 search-input" id="toolAppsSearch" placeholder="Search apps and tools..." />
                                 <i className="mgc_search_3_line text-muted position-absolute top-50 start-0 ms-3 translate-middle-y"></i>
                             </div>
                             <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                 <span className="badge bg-light text-dark" id="selectedCount">0 selected</span>
                             </div>
                         </div>
                     </div>
                     {/* <!-- Categories Filter --> */}
                     <ul className="nav nav-pills flex-wrap gap-2 category-filter mb-3">
                         <li className="nav-item">
                             <button type="button" className="nav-link active" data-category="all">All Apps</button>
                         </li>
                         <li className="nav-item">
                             <button type="button" className="nav-link" data-category="social">Social</button>
                         </li>
                         <li className="nav-item">
                             <button type="button" className="nav-link" data-category="development">Development</button>
                         </li>
                         <li className="nav-item">
                             <button type="button" className="nav-link" data-category="productivity">Productivity</button>
                         </li>
                         <li className="nav-item">
                             <button type="button" className="nav-link" data-category="entertainment">Entertainment</button>
                         </li>
                     </ul>
     
                     <div className="mb-4 d-none" id="selectedAppsSummary">
                         <div className="d-flex align-items-center mb-3">
                             <h6 className="mb-0 text-success flex-grow-1 d-flex align-items-center">
                                 <i className="mgc_check_circle_line me-2"></i>
                                 Selected Apps
                             </h6>
                             <button type="button" className="btn btn-sm btn-sub-danger avatar flex-shrink-0" id="clearAllSelected">
                                 <i className="mgc_close_fill me-1"></i>
                                 Clear All
                             </button>
                         </div>
                         <div className="row g-2" id="selectedAppsList">
                             {/* <!-- Selected apps here --> */}
                         </div>
                     </div>
     
                     <div className="row gx-5" id="appsGrid">
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="social" data-name="twitter">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,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" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover"/>
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">X Twitter</h6>
                                                 <p className="text-muted fs-15">Social Media</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="twitterApp" id="twitterApp" />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="productivity" data-name="slack">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,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" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover" />
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">Slack</h6>
                                                 <p className="text-muted fs-15">Communication</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="slackApp" id="slackApp" />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="development" data-name="github">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAACBQAAAgUBU8S2FQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAASuSURBVHic5ZtNaF1FFMd/5zWpoVVpLIoVUluK2KZRUhBr3FixiNaqK13WIpSCEBSLWMRFQAOCi+Ku4AeCC0HFjRClK6ErNdDSlgrBz4A2VoXSYpI2aY6Lmacvz3fz7py5976x7w+HR9o5d875z7kz587MEVUlCyKyEdgJ7ACG/e+tmQppYAY4AZz0v1+p6nRma1X9jwA9wBiwAOj/XBa8Lz0tfW3h/CAwmYDhRcskMLgiAcA+YC4BY8uSOWBfSwL8yF/LzjeSMLiMANw7fy2GfZZM4ueEOgFjCRhVtYypKgJsBL73UdBNWAS21HDrfLc5D87nnTVcctOt2FHDZXjdimEBzpF+elsWZgQ3I3YtYie/x4A/gPuBJ4BdgEQ+sx2WgC+Az4FvcKvYRzEPtK6j0y2+I7YB7wKXI56bJVeA94GtTX0KbhBMz415BT5R1ada/YeI3Aa8ChwEav6fF4EzwE/AhQYBWNcgm4Ah/o1OBd4BXs/6rBWRz4C9Rj/MI3Ko1edl0+iMAKPAfUBfu/YNen1eZxQYydH+5Qg/zIq78jpUtuDmHpMf9fC04KYI3aJhtiWGgO0RukXDbEsMAUMRukXDbEsMAXdE6BYNsy0xBByN0C0aUbZYZs/jgHR69m9Kho5bfLEkQleAYVX91kR3SRCRbbizgNUhepZX4EhqzgN4m46E6lkIOGbQqQrBtlkIOGPQqQrBtoUScF5Vz4d2UhW8bUH2hRKQ8ujXEWRjKAG/BLbvBIJsDCVgILB9JxBkYygBWwLbdwJBNoYmQkvAGlW9HGRSRRCR64BZAgY2NAJquC2rVLGJQJ8seUDKr0GwbRYCBg06VSHYNsvH0I/Anaq6ENpZmRCRXmCKwFfUEgGbgWcMemXjWQzzk/VcIKkoEJHVwHcY8hTrjlBqUXCAiCTNei5wCXgygd2gp3Frf+UHI4pLjA53cBvstUj7owmoywdAf4XO3wx8WpDtbRv8ALwBvIX71s5qNwu8B9xTouMjnuz5gpzPtSn6JbBbVa+KyF7cEfg40LuCziRue+o0cAqYUtXFNv0sg1/Xt+IOPe4CHqGk+0x5mDoG9OPeuwHgOeBqTl3F3dpueVk5Y6TX4I7RCxnlNpK74VngdtxB5Gbc0pNHbxYYMoT7ntQIUFw49+D23kdxlyDa6XwY8c5/nBoBCrzkjVvvf4+2ab8/goAXUiTgInCDN3A/8CDwIvB1U7s/cfeF1kcQ8HCKBCjwZpOhdwOP4+aIB4ANXvZELnsDZRNQw9XYhOKQiOxu+HsKOKWqPwP34uYJBbJrdfLh90j9dpgBmMDG3q/A9rKSHh8BfUbb8spEDXeiasEG4LSITIjIQyLS19xARNYan10VTvbgkhQrBHjUCyJyARdWvbjEqV9E1qrqXKylJeFEFQUT16vqXxZFH1VlkecKJtTdvhwvqRMo/+6wFeOqOl2fbMosmroxwUlwedGU76yssrl1iRGwrGzunz1BVT2Lu9w8nxUzRqwq+HkxmAcOel8dWrBedOnsLYlEQPvS2YaOiyqe/g1YFZkMXYy0YcXiafGdtERE+fwSrhbgsKq+naP9SjY8D7yC2wfMs6IElc//DQqq+yFfNaV8AAAAAElFTkSuQmCC" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover" />
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">GitHub</h6>
                                                 <p className="text-muted fs-15">Development</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="githubApp" id="githubApp" />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="entertainment" data-name="youtube">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,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" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover" />
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">YouTube</h6>
                                                 <p className="text-muted fs-15">Video Platform</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="youtubeApp" id="youtubeApp" / >
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="productivity" data-name="windows">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,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" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover" />
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">Windows 11</h6>
                                                 <p className="text-muted fs-15">Operating System</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="windowApp" id="windowApp" / >
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="productivity" data-name="paypal">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAB2AAAAdgB+lymcgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAiGSURBVHic3ZtdjFtHFcf/M3Nt37v2fuVjm+Akm22atM22KUqoKCqoLZAWkqhR4KVIBCEqPsQDPAAl4iG8gSqkqFLVF3jlIy9FKAooRQKhgqKkqgAhqjQKysd6N9nsksTr9b2+HzNzeHB2Y6/t67F9vUvyk/bhzp47M+fMxzlz7pjBkILn5VMqfUwI2s8538IZd8DAmWkFfYII0KSVUnQnlPJ8FOpfBXBPP7Zx46LJ+237f7McvSgEf1NwtouxtVa3PVJquJWworT+NZF4fceYfSlOvqVGhQVaZ1vqHSslPvb/r3Y9RISyFyCSOgLYG6zsHJ+YYH4z2aa6zRSj/Y4tTnHO7P52tX8QEUplH0oTQDjHGb6wfWP2xko5vrJgdiH40oBjnbmflQcAxhiyTubuA57RwHuXb5b3NMjVPswUo/0DjnWGsUbD3K+U3ABSqqXHaUb09MRYbnapYFnRa0UatW1x6kFSHgAyKVH7uAWMnS4UyFkqWFZ2IKX+KO7zad8My6ofTwL2hbZ3bOmZAVVXl05b79xvu70JRIQ7pcrK4jIj2jkxlpvlACAEf/NBVB4AWHNHlwNjxwGAFTwvnxP29P0Q5HSD0hoLi01DADeEt5mnVPrYg6o8UI0MW5DNUPaAJQTtT7LBt37xJ5z87Xn4ftR1HZm0hY0bBrFzxyZ89vndeP5TjyNdv5sbE0Sq5f+I0afZLV+VBefZbjtby4eXbuDoN36eRFV1bMuvww++ewDPPL2jo/ciqbDoBq0FCOc4Z9xpLdEZFy5eT6qqOqZmbuM7P/wlTr593vgdIoJXCeOFGB7maBIOd8vVqf8mVVUDRMCJt87gz+9eMJAlLHpB9RwQzzBPcv/rpwGAqhF+euI07hS9ljJSKiyU/bjNr7bGTKJh7+Wr80lW15Tigoe3T71/r4Cqri4IJUpugJIbQLcf+eqrlOD09/0Ic/OlpKqL5Xe//ztuL3jVv5KHhUUfbiWsPfQYoRQlZ4BrhVvGlu+Vm3MLWGgMbztGaZ2MAaRU+PA/DbmGvjJz/U7PdUipYfVSQSQV/CBCJDWurML6ryXVZWC0BBEhlKo7A2hN8PwIYSSXywrTt80a9kugyAWRyS69AiYAYYFbA7Cz6c7fryGMFEBd7AFhVHUztcoDwNTMrbbvkoqgw8XulK9WAMgAFJXw2r89TJVl+3ea1gMEQfVdYwMQAW4lRNkLQFS/2SlNmJkxWJOqTWRmiB7ZgKtlhW/9dRY3vM6N4IcSSlcHwcgAREDZCxCEzRubvVlEZOKCqMsRW0H0xJMAgDuBxk/+Ybb0lpBSo1JzUGtrAK0JJdePVdB4/asEDJAZQPTUveTu+/M+LhbNZpbWBLcSALg3g2MNsBxTq/g1a2wA3bsBwk98sqHs7M2mCY86tCaUm0SJLb0AEbDohW2VB4CpaYMzABGgO4vUVqLz44j2PNFQPu3G5x6k1HC9AJoaA7WWBvB889DSZAZUR7+HSDE3DP/w4ab/slqd6AjwA4lKELVsu6kBwki13PCaMW3gAtHL9B8cgfvlo4DVfLy25VJ1z0RU1SG4t9u3oqFGIoLbLpFQw+2ii8VyTNZlCd1Fiowx6O2PoHLwAMBbR377NqQhpYbSGlJqhLIa5JjQYAC3Ejb4+Tj64wEYaMNDCJ57Diqfj5XMDwhsZAqLbnf7S50BIqmqIWIHFAoG0x+IjwF4NcRFNge5dRzRnieh1683qvbIVqenWxp1BvCDzqdpYcZsBuhNH4H/0uegc4nkXwEAO3IWXtyc6amOZQNIqRAZpZHqMXGB2snAO/IywJNLQDmC4fu7c609gCHLPfI72PVrmTLYA/T6dYkqnxEMP94zhPFsT6d5AHdngNaEqMO1DwC+H+LWrfZ3kdTwUOc9a8Fmh+O13YN4dCjVXtgACwDCSHYVohSmbxt5G0rAAI5gOLTFwSvjDhyRXCrbAmB2kmvCNUMXqEc6N8CAYBjNcExkBfatT+PZDWnkUsnf3bBAsR8QYylMm7lANdTeAK/uyOFQPoNMgqNrAo+k6jpCNzGAnbVBdnz66tHhFL64zV515QGAS4PTXisKBmeA7NhoW5mdg73v5t3CDb6fNUVJjeuzC23l0uuG28qMD6zdvSyu25yWWnF9tghp4Dr5aPv1vy0Bf94tvNuvOTM3zD5MyOHBtjJraoBuN0DHaZ+XF5yhNDgSKzOcYhhOrd0VHW56bl7JnsktePngXtiZ5hHZYC6DV7/2AuZZ/OgmEc72Ars87wYAevvM0oKLxRBf/ctsrMyhvINv70ruhNgpHEDfvmkX2iQrAWB7rrdvfL3AOVMcwJV+NZC12ru3x0b6MvmMYECFA/hnvxr4+JiDw9tzsEWjIRzBcXTXEB5fQwNwIa6wK/PeKwT6zVp1IowUXM8gqdoHbMs6wT6Yo5zDvFkAa7ITEQHFxYpxFjcpGGMksplNfHKMlQGcXNXW6zoCZNKrvxGmLH7hqU2DcxwAiMTrALq/29ojdtqCwQ/YEoMB4LC+CdzNCVZ/WsbeWLUerIBzDiezegFRKmWdnRwf+htQkxRlZec4COdWrRcrsG0LIsHEaSsEZ2U71J9fel5ucWKC+Qx0BECh771oCkMumwHv429ROWM6lUp9ZufO9cvBX53JJ8Zys9B0CMB033oRA+f9MwLjTKVtcWRy6/B7dW2uFHz4ody/lNR7AXo38V4YIDjHYNZOdDkIzsuC4dnJ/Oiplf9raepLlyjDR7wfMeB7WJMYgeD7EpWg+3sFDIBlibPCHX1pcpKVW8nEcmWuvAmMHSfgK1gDQyitEQQKYRQZx0qMM7IEuzBgpb7+SH7obKysaUc+mKPcACoHNaMXGPBRABMARtCno3QDRIikRqQUlCRo0iCq3mfgjGnGmcs4plJc/MG3xM/2bh40urr6P+L+l+wNhDdNAAAAAElFTkSuQmCC" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover" />
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">PayPal</h6>
                                                 <p className="text-muted fs-15">Payment</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="paypalApp" id="paypalApp" />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="entertainment" data-name="twitch">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,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" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover" />
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">Twitch</h6>
                                                 <p className="text-muted fs-15">Streaming</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="twitchApp" id="twitchApp" />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="col-xl-3 col-lg-4 col-md-6 app-item" data-category="development" data-name="linux">
                             <div className="card app-card shadow-none card-h-100">
                                 <div className="card-body px-6 py-7">
                                     <div className="form-check check-primary ps-0">
                                         <div className="text-center">
                                             <div className="app-icon mb-4">
                                                 <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAHYAAAB2AH6XKZyAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAADfpJREFUeJzFm3t0VMd9xz/33n1Ku6vV+y2MZARIvLGd4lBBbKCYxzGPAjZqeJmTkxjbbR23tiFJCTlJ6uM6tlOc5gTcuM6JHxAbY3zimlq0Rg4SYCwnYISQhCywJCTQe9+7d6d/rCQksavdlbTwPWeO9t6Z+5vv/GbmN7/5zQhuLZKAp4CPgTrAAfQA54D9wFJAvsWcbhm+A3QDIkz6Elh4eyjGDv9K+IYLq9Xa/1sFHr89VMcfpUTQeEA88cQTYtWqVUJRlP53O2JNTomx/Hjgj31/wyI/P58JEyZgMBhoaGgAWAQcBZpiRzG2eIQIe1+r1YrVq1cLs9ksdDqd0Ov1/XknAem2sB8HHCJCBUiSNFL+klgRjPWSUxRpQSHESNnfHjuV2wM7fb2o0WiExWIZcQSkpqaKvLy8YPkXYkUwlnMrjoACKCoqIjU1laqqKjweDy6Xa6BQcnIypaWlFBYWUllZydGjR+nt7cXpdA6W5emTp8aQ77gjDhDTpk0TZWVl4uTJSvHSSy8KnU430LNms1ns2rVLfPLJJ6K6ulqUlx8XO3fuHLwMDk6ZsSAZSxvgB1i27AHy8nL4+usrPPbYDjZs2DBQYN26deze/SNU1cevf/0fJCQksHLlcrKysoLJ08WCpCYWQvsgAIqKinn00cfo6uqktbWNJUsWceTIEdLT08nJyaGnp4cVK1aSlZXFhQs1vPPOQebOncuVK1duCddYjgAVwGaz0dzcRHX1BT788L+5dq2d3p4u6mprqKys4PLlKzgcDhoaGigvL6em5iImkymYPEMsSMZaAf7a2lqWL1+OzWZjVl43RdLTtB5T6DmVwHPfqcTgPkBOdgaqqmI0GiksnNTvBQ6HMRYkY+1hdRYWFlorK09w9tA25qW/j4gHEa+gjTPj9gqMRi92TyKV5yeROeWf6LInsGDBQnw+33BZJUD5eBOMpQ0A6KmtvWh95ydzWH/3ZRQZ/FLf3JDAGJ8DopN43VXun9GM8B6nzSZTNMHHX+pvkpUeC4Kx9gS7Vs6GhRMv35QhKdlAHIheAISAT8sFRpuPZdODypoaC4KxVkD3ipk3v5QUA5IUD6IVULHZ4NMPBYVagacDjp0NKmthLAjGWgGde96DE+e19A5y7ITfi993GZezh88qfNQeU5lsAVmGC+3Z1F2PA2D+/PksXboUnU4HsADIHW+CsY4HLOtxMfPe1c/SfO4LWrs8NLVDfaOfljonjnon2RqVhDjoULM44fsuasF3sTtcfPnleVwuF2vWrKW4uJhTp07JBEJqn4wnwViPABNARm4hxruewd6pJ1mGyfGCQrNKuhXcPonTXQuozfolmUVLycnJZu3av0VRFNra2igr+xhVVft3i48D1vEkGOvNUItGo7FUVJygq6uT9oYzOM7+J0ZvM4pOj8c8FU3+KpJyZ2AymZg+fTpGY2C537RpM2+88WYwuX8A1o0XyVgq4HXg2w89tIH9+/dx6tQpVDWwmVNVFVmWkSQJSZLIyMhk0qQ7UZQbM/L8+WpmzZqN3+8PJvtvCITKxoyYKECW5Z06nW6PXq9X/vznL8jJyaajo4OzZ88OaVBiYiIFBQWYzeagctatW8+hQ+8Fy+oisDt0Bcu83VhJYCcoXn11v/D5PAOpq6tDVFWdEWfOnBZNTVeG5AVLH3zw/khhskO3rYUjYCqBXhHz588P28BwyW7vFUlJiSMp4dmxEh7PVSCdwLzUA+zc+UzQQmFif0PgcDhYuXLlSEV+CqyPWGAQjJcCZOB3QA6A2WzmvvvuC1rQ7XYPGMNQEEL0hcVc3HPPPSMVlYDXgLtGwRkYv83QdmBx/8PUqVNpablKUlIiWq0WRVGQJAmfz4fH40EIgV6vR5IkVFXF6XTicrmw2ex4PB5U1Yckyej1ekpKSjCZTNhstlB1G4H/AmYB3miJj8cI0AE/HvwiPj4eu92O2+1GlmUURUGWZXQ6HV6vF6PROLAMajQazGYzqamp5ObmkJKSjE6nx+Gw09vbg8Fg4LXXfjvwvdUa1A8qAv5+HNoyKjxIX1jbarUKWZbFwYNvC6fTHtSwhXo/PLndTtHQcElUVZ0RLS1NYtu2rQIQRqNRFBQUCI1GM9wgXiPgfN1y7AdEfn6+BxBbt24RHo9rzCtAf+rouC5qai6IxsYGYTabB84YZsyYGUwJMT9MHQ4JuJydna2mpKQIg8EgGhu/GrfG9yeHwyZ6errEjh2PCkAsWbJEWCwWMWfO3OEKOBNtA8ZqA+4FctPS0rqvX7/O9u2PkJ0dNKQNRLcEDoZOpyMuLo6NGx8mLy8Pk8lEXl4eXq9neAB1DjBpVJWMEvssFovIyMhQAfH555+F7cmxjASPxzX4EoUwGo1i9uzZw0fBD6JpwFhGQDJQmpaW1nH16lW5qGgqM2bMGPEDrzfqVWoIZFlm8uTJA89Op3Ng9zgI90clcwx8niKwBpsASktLRyzs9/vDOkCRYMqUyUOetVrt8CLfIIpTpNEqIAXYodfrcbvdOggcgY0Ev9+PJI1985mXl3eT3GEwArMjlTdaBTwLmIUQOBwOLBYLxcXFI34ghECWx+53aTQ3nFeDwYDTGXRHXBixvFFwSAe+BwHrrCgK+fn5YRs3XgoYHDTJycmlsfGrYMUiDp6OhtFa+o6pSkpKsFqt5OWFr08IMS5TYLAhtVoTuHbtWrBiMbUBA1aooqKC1NRULBZL2I/Gywb0N1iSJEZwKzoilTeaKdCSnQzPPQJn6jr5n5qOiKz7aJ2gAbi+Al067e3taLVapk+fjhB+ioqK0Gq1uN1uWltb6ezsBLj5KGq88OBcvtH4GkKUBdKJXwRugVy4UD2iE9Pb2y16e7tH5QB5HV8LcVwR4rhWXDoQJyak3xwdKigoEIsXLxbZaQY/gVUqIkQ9BXat4rHMtBvP82bC2uJzlJQsoKKiIuR3iqKMehRUvf8voKhg8GL3O2hsvbmMLMtotVqe3eSRPEcDgZlIEJUCTu1hi1ZLqVY/9P3TGwFXG4sWLeH3v38j6LdarXbUq0BTXQ1+J+CAhtrgZZqbm/n0//7Iwwv99HbzQaSyQ9qAqt1YfQrPAPlAghDkIFF0R97NZY0mOPA0fGuXmy1btlJfX88Pf/iDIUZPkiQMhugveXi9Xnx+Gb8KsgYSQ9hRj9vOwR9Bkgmud5B1YDe69bvxhJMfUgFehX/PzeXvUvpO5f1q4PBSow9e/t67YPXd8O5pwZ49P6G2tpZ9+34zqkb3o7m5hatXW+h13rgsMSkLVs6BI5/fKDcpA17eDkvnB54tKUgZl7gTOB+ujpAKkGXuTs8GKcJRq9XA3qegfDtc64U333yLurp6Dh8+RFpaWngBQWC32wEQkm6Ah9EMz2+Gjd+EujaYmAHziiA99QZXXRxMmcJzBM4oRkTI5ikKRLtsp6XBzzffeD59+jSrV6/F4wk7EoOi3+31eH0DjTPEQUICzC2GNQvgr6aBOR6Mw0KFyamsqP4VC8LVEVIBTg9Nvih3r4qA0tUwa8KNdydPnuTIkYht0hD07/QaLtUPOD26eLBYITEeUkyQmggpmYHpORiyAnfcwbHa34x8zzikAtwemr3OULkhIEAnwzs/Bd2gydXS0hKloAA0GoW33nqb660t+Ad1RpwVkrMgNRcsKSCFuOVgiEO+cxKvd7/LuVB1hFSAx4vb446etOyH3Gz42fZMCgry2bjxYTZv3hS9IGDv3ld48cWXyEgA/7BLY1KkU1QCcyLFH+/kpWDZIY2gx0vSzbGGyKAVsHVJC99a/ztmlmwI/8Ew+P1+nnzy++zd+woGbWCoi6Cn5JGh/TK0dRD0iCnoCDiwDsVgoMSYMMoaBSRYoPGDrVxtDLsSDUFLSwsPPLCcvXtfAcBiBGtcYE5HC9ULTRfhoz8hvCrPBysTVAFSOmvyc0iOdAkMBkWCBTN9vPwP36T8ePj7jT09Pbzwwi+YNm0GZWVlA+8tBkiKCzhBYSHAbYPuK3DpczhyGN47Tnuvm4c27wt+nB5UrFtlm0kTmHcRVRwCWgVKCu2UrrkfU9okli1bxsyZM8nKyiQ+Pp6uri5qai5y4sQJPvroaNDzP7MeEozheTg7ofMydHfDF1/D5Q56ZJm9GsELTx4MvT0OKtbrQ7Y7QWkEjQG0RtDGBbzAaHwDvx/SEiDTAmcu1nLx4suRf9wHvRaMWvB5hq4s/VA9gYY72uHLFjh5CQ8Sv5R0/Hz3gfBxgaAKcPjZcfwcL+SmsTTTii7VAlInIIFGG1BKv2JC9YzPDT4X+FSQxxAHkQG3DzouQdLEQL1CBa8z0Ou2a+DzQdkFqG6hXFHY+vyH3HzRNgSC0t/xKnXAg7u3YNDVsChez4aMJBYnmUhPTYB0S8D1BVD0YDCDznTDUHmdYGsL/K5qAIeXK8D7QD2B/wF0ELhJYgASgEQgD5gATCMQdVIAfH6ougx3pMDVIKu5ywt/+Ayaenj5WjLfP3gwun+riapv/nEF2XhZIAlKks0sTrGQPykTCrPAoOsbDSKwcQJoaIMfv43H5WLWx7VUR1FVPDATmFecwfdykyhYMxfumxqwK/240gGHv0Bct/HPv/0T/xZNW/oxpiDdpnlkSxJr/X4emZXPjDkTITcF7C74rB7ercTvcPH4/9bxq9HW8ddTydSqlCsyBXE6mJwJcTq4boPWHrxahe1vnOL10coft2tyq2YxS1XZ5vOz0KeSoPr5i0/lxeP1HBur7AfuxOKWeEKSWa3ITFRkXFqZY5KGnx2uCr/lHQn/D3b8N3urPcwLAAAAAElFTkSuQmCC" loading="lazy" alt="Img 30" className="rounded size-8 object-fit-cover"/>
                                             </div>
                                             <div className="flex-grow-1">
                                                 <h6 className="mb-0">Linux</h6>
                                                 <p className="text-muted fs-15">Operating System</p>
                                             </div>
                                             <input className="form-check-input rounded-pill" type="checkbox" name="linuxApp" id="linuxApp"/>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                     <div className="text-center py-5 d-none" id="noResults">
                         <i data-lucide="search-x" className="size-16 text-muted mb-3"></i>
                         <h6 className="text-muted">No apps found</h6>
                         <p className="text-muted small">Try adjusting your search terms or category filter</p>
                     </div>
                     <div className="text-center py-5 d-none" id="allSelectedMessage">
                         <i data-lucide="check-circle" className="size-16 text-success mb-3"></i>
                         <h6 className="text-success">All apps selected!</h6>
                         <p className="text-muted small">You have selected all available apps. Click "Deselect All" to see them again.</p>
                     </div>
                 </div>
                 <div className="modal-footer border-0 pt-0">
                     <div className="d-flex justify-content-between w-100">
                         <button type="button" className="btn avatar btn-sub-danger" data-bs-dismiss="modal">
                             <i className="mgc_close_fill me-1"></i>
                             Cancel
                         </button>
                         <div className="d-flex gap-2">
                             <button type="button" className="btn avatar btn-sub-primary" id="selectAllBtn">
                                 <i className="mgc_checkbox_line me-1"></i>
                                 Select All
                             </button>
                             <button type="button" className="btn avatar btn-success" id="saveAppsBtn">
                                 <i className="mgc_save_2_line me-1"></i>
                                 Save Changes
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
     </div>
     
     {/* <!-- Modal --> */}
     <div className="modal fade" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel" aria-hidden="true">
         <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
             <div className="modal-content">
                 <div className="modal-header">
                     <h6 className="mb-0" id="settingsModalLabel">Alloce Customize</h6>
                     <button type="button" className="btn-close link" data-bs-dismiss="modal" aria-label="Close"></button>
                 </div>
                 <div className="modal-body setting-modal">
                     <div>
                         <div className="py-4 px-5 border bg-light bg-opacity-25 rounded mb-5">
                             <ul className="nav nav-underline border-bottom mb-7" id="pills-tab" role="tablist">
                                 <li className="nav-item" role="presentation">
                                     <button className="nav-link px-7 py-10px rounded-1 active" id="pills-layout-tab" data-bs-toggle="pill" data-bs-target="#pills-layout" type="button" role="tab" aria-controls="pills-layout" aria-selected="true">Layout Styles</button>
                                 </li>
                                 <li className="nav-item" role="presentation">
                                     <button className="nav-link px-7 py-10px rounded-1" id="pills-theme-tab" data-bs-toggle="pill" data-bs-target="#pills-theme" type="button" role="tab" aria-controls="pills-theme" aria-selected="false">Theme Styles</button>
                                 </li>
                             </ul>
     
                             <div className="tab-content" id="pills-tabContent">
                                 <div className="tab-pane fade show active" id="pills-layout" role="tabpanel" aria-labelledby="pills-layout-tab" tabindex="0">
                                     <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-5">
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="defaultLayout" name="data-layout" type="radio" value="default" className="d-none form-check-input"/>
                                                 <label htmlFor="defaultLayout" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <span className="d-block h-100">
                                                         <span className="setting-widget-wrapper">
                                                             <span className="bg-danger"></span>
                                                             <span className="bg-success"></span>
                                                             <span className="bg-warning"></span>
                                                         </span>
                                                         <span className="d-flex flex-column h-100">
                                                             <span className="row g-0 setting-widget-content">
                                                                 <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                                 <span className="col-10 p-1">
                                                                     <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                     <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                                     <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                                     <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                     <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                                 </span>
                                                             </span>
                                                         </span>
                                                     </span>
                                                 </label>
                                                 <label htmlFor="defaultLayout" className="cursor-pointer form-label d-block text-center">Default</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="horizontalLayout" name="data-layout" type="radio" value="horizontal" className="d-none form-check-input"/>
                                                 <label htmlFor="horizontalLayout" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <span className="d-block h-100">
                                                         <span className="setting-widget-wrapper">
                                                             <span className="bg-danger"></span>
                                                             <span className="bg-success"></span>
                                                             <span className="bg-warning"></span>
                                                         </span>
                                                         <span className="d-block h-2 bg-body-tertiary bg-opacity-50"></span>
                                                         <span className="row g-0 setting-widget-content">
                                                             <span className="d-inline-block cols-12 p-2">
                                                                 <span className="d-block w-25 custom-height-element bg-body-tertiary rounded"></span>
                                                                 <span className="d-block w-50 custom-height-element mt-1 bg-body-tertiary rounded"></span>
                                                                 <span className="d-block w-100 custom-height-element mt-1 bg-body-tertiary rounded"></span>
                                                                 <span className="d-block w-25 custom-height-element mt-1 bg-body-tertiary rounded"></span>
                                                                 <span className="d-block w-75 custom-height-element mt-1 bg-body-tertiary rounded"></span>
                                                             </span>
                                                         </span>
                                                     </span>
                                                 </label>
                                                 <label htmlFor="horizontalLayout" className="cursor-pointer form-label d-block text-center">Horizontal</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="modernLayout" name="data-layout" type="radio" value="modern" className="d-none form-check-input"/>
                                                 <label htmlFor="modernLayout" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <span className="d-block h-100">
                                                         <span className="d-flex flex-column h-100">
                                                             <span className="row g-0 setting-widget-content h-100">
                                                                 <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                                 <span className="col-10">
                                                                     <span className="setting-widget-wrapper">
                                                                         <span className="bg-danger"></span>
                                                                         <span className="bg-success"></span>
                                                                         <span className="bg-warning"></span>
                                                                     </span>
                                                                     <span className="d-block p-1">
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                                     </span>
                                                                 </span>
                                                             </span>
                                                         </span>
                                                     </span>
                                                 </label>
                                                 <label htmlFor="modernLayout" className="cursor-pointer form-label d-block text-center">Modern</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="boxedLayout" name="data-layout" type="radio" value="boxed" className="d-none form-check-input"/>
                                                 <label htmlFor="boxedLayout" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant px-5 py-3">
                                                     <span className="d-block h-100">
                                                         <span className="d-flex flex-column h-100">
                                                             <span className="setting-widget-wrapper">
                                                                 <span className="bg-danger"></span>
                                                                 <span className="bg-success"></span>
                                                                 <span className="bg-warning"></span>
                                                             </span>
                                                             <span className="row g-0 setting-widget-content h-100">
                                                                 <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                                 <span className="col-10">
                                                                     <span className="d-block p-1">
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                                     </span>
                                                                 </span>
                                                             </span>
                                                         </span>
                                                     </span>
                                                 </label>
                                                 <label htmlFor="boxedLayout" className="cursor-pointer form-label d-block text-center">Boxed</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="semiboxLayout" name="data-layout" type="radio" value="semibox" className="d-none form-check-input"/>
                                                 <label htmlFor="semiboxLayout" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant p-1">
                                                     <span className="d-block h-100">
                                                         <span className="d-flex flex-column h-100">
                                                             <span className="setting-widget-wrapper">
                                                                 <span className="bg-danger"></span>
                                                                 <span className="bg-success"></span>
                                                                 <span className="bg-warning"></span>
                                                             </span>
                                                             <span className="row g-0 setting-widget-content h-100">
                                                                 <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                                 <span className="col-10">
                                                                     <span className="d-block p-1">
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                                     </span>
                                                                 </span>
                                                             </span>
                                                         </span>
                                                     </span>
                                                 </label>
                                                 <label htmlFor="semiboxLayout" className="cursor-pointer form-label d-block text-center">Semibox</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="neoLayout" name="data-layout" type="radio" value="neo" className="d-none form-check-input"/>
                                                 <label htmlFor="neoLayout" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <span className="d-block h-100">
                                                         <span className="d-flex flex-column h-100">
                                                             <span className="setting-widget-wrapper">
                                                                 <span className="bg-danger"></span>
                                                                 <span className="bg-success"></span>
                                                                 <span className="bg-warning"></span>
                                                             </span>
                                                             <span className="row g-0 setting-widget-content h-100">
                                                                 <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                                 <span className="col-10 border border-2 border-light rounded">
                                                                     <span className="d-block p-1">
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                                         <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                                     </span>
                                                                 </span>
                                                             </span>
                                                         </span>
                                                     </span>
                                                 </label>
                                                 <label htmlFor="creativeLayout" className="cursor-pointer form-label d-block text-center">Neo</label>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="tab-pane fade" id="pills-theme" role="tabpanel" aria-labelledby="pills-theme-tab" tabindex="0">
                                     <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-5">
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="defaultTheme" name="data-theme" type="radio" value="default" className="d-none form-check-input"/>
                                                 <label htmlFor="defaultTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-default.webp" alt="Dashboard Ecommerce" className="img-fluid" />
                                                 </label>
                                                 <label htmlFor="defaultTheme" className="cursor-pointer form-label d-block text-center">Default Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="minimalTheme" name="data-theme" type="radio" value="minimal" className="d-none form-check-input"/>
                                                 <label htmlFor="minimalTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-minimal.webp" alt="Demos Minimal" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="minimalTheme" className="cursor-pointer form-label d-block text-center">Minimal Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="materialTheme" name="data-theme" type="radio" value="material" className="d-none form-check-input"/>
                                                 <label htmlFor="materialTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-material.webp" alt="Demos Material" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="materialTheme" className="cursor-pointer form-label d-block text-center">Material Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="primeTheme" name="data-theme" type="radio" value="prime" className="d-none form-check-input"/>
                                                 <label htmlFor="primeTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-prime.webp" alt="Demos Prime" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="primeTheme" className="cursor-pointer form-label d-block text-center">Prime Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="elegantTheme" name="data-theme" type="radio" value="elegant" className="d-none form-check-input"/>
                                                 <label htmlFor="elegantTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-elegant.webp" alt="Demos Elegant" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="elegantTheme" className="cursor-pointer form-label d-block text-center">Elegant Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="edgeTheme" name="data-theme" type="radio" value="edge" className="d-none form-check-input"/>
                                                 <label htmlFor="edgeTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-edge.webp" alt="Demos Edge" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="edgeTheme" className="cursor-pointer form-label d-block text-center">Edge Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="retroTheme" name="data-theme" type="radio" value="retro" className="d-none form-check-input"/>
                                                 <label htmlFor="retroTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-retro.webp" alt="Demos Retro" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="retroTheme" className="cursor-pointer form-label d-block text-center">Retro Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="corporateTheme" name="data-theme" type="radio" value="corporate" className="d-none form-check-input"/>
                                                 <label htmlFor="corporateTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-corporate.webp" alt="Demos Corporate" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="corporateTheme" className="cursor-pointer form-label d-block text-center">Corporate Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="vertexTheme" name="data-theme" type="radio" value="vertex" className="d-none form-check-input"/>
                                                 <label htmlFor="vertexTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-vertex.webp" alt="Demos Vertex" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="vertexTheme" className="cursor-pointer form-label d-block text-center">Vertex Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="sparkleTheme" name="data-theme" type="radio" value="sparkle" className="d-none form-check-input"/>
                                                 <label htmlFor="sparkleTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-sparkle.webp" alt="Demos Sparkle" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="sparkleTheme" className="cursor-pointer form-label d-block text-center">Sparkle Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="flatTheme" name="data-theme" type="radio" value="flat" className="d-none form-check-input"/>
                                                 <label htmlFor="flatTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-flat.webp" alt="Demos Flat" className="img-fluid"/>
                                                 </label>
                                                 <label htmlFor="flatTheme" className="cursor-pointer form-label d-block text-center">Flat Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="visionTheme" name="data-theme" type="radio" value="vision" className="d-none form-check-input"/>
                                                 <label htmlFor="visionTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-vision.webp" alt="Demos Vision" className="img-fluid"/  >
                                                 </label>
                                                 <label htmlFor="visionTheme" className="cursor-pointer form-label d-block text-center">Vision Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="creativeTheme" name="data-theme" type="radio" value="creative" className="d-none form-check-input"/>
                                                 <label htmlFor="creativeTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-creative.webp" alt="Demos Creative" className="img-fluid" />
                                                 </label>
                                                 <label htmlFor="creativeTheme" className="cursor-pointer form-label d-block text-center">Creative Theme</label>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex-column gap-0 form-check check-primary">
                                                 <input id="modernTheme" name="data-theme" type="radio" value="modern" className="d-none form-check-input" />
                                                 <label htmlFor="modernTheme" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                                     <img src="/assets/images/demos-modern.webp" alt="Demos Modern" className="img-fluid" />
                                                 </label>
                                                 <label htmlFor="modernTheme" className="cursor-pointer form-label d-block text-center">Modern Theme</label>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
     
                         <div id="profileSidebar">
                             <h6 className="mb-2 mt-3">Profile Widgets</h6>
                             <div className="d-flex align-items-center gap-2">
                                 <label htmlFor="profileWidgetsSwitch" className="form-label cursor-pointer flex-grow-1 mb-0">Profile Widget Sidebar</label>
                                 <div className="form-switch switch-outline-primary flex-shrink-0">
                                     <input type="checkbox" name="data-profile-sidebar" value="true" id="profileWidgetsSwitch"/>
                                     <label className="label" htmlFor="profileWidgetsSwitch"></label>
                                 </div>
                             </div>
                         </div>
                         <div id="navigationType">
                             <h6 className="my-3">Navigation Type</h6>
                             <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-5">
                                 <div>
                                     <div className="form-check radio-primary ps-7">
                                         <input className="form-check-input" type="radio" name="data-nav-type" value="default" id="defaultType"/>
                                         <label className="form-check-label" htmlFor="defaultType">
                                             Default
                                         </label>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="form-check radio-primary ps-7">
                                         <input className="form-check-input" type="radio" name="data-nav-type" value="floating" id="floatingType"/>
                                         <label className="form-check-label" htmlFor="floatingType">
                                             Floating
                                         </label>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="form-check radio-primary ps-7">
                                         <input className="form-check-input" type="radio" name="data-nav-type" value="boxed" id="boxedType"/>
                                         <label className="form-check-label" htmlFor="boxedType">
                                             Boxed
                                         </label>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="form-check radio-primary ps-7">
                                         <input className="form-check-input" type="radio" name="data-nav-type" value="pattern" id="patternType"/>
                                         <label className="form-check-label" htmlFor="patternType">
                                             Pattern
                                         </label>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div id="sidebarSizes">
                             <h6 className="my-4">Sidebar Sizes:</h6>
                             <div className="row row-cols-2 row-cols-md-5">
                                 <div>
                                     <div className="flex-column gap-0 form-check check-primary">
                                         <input id="defaultSidebar" name="data-sidebar" type="radio" value="large" className="d-none form-check-input" />
                                         <label htmlFor="defaultSidebar" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                             <span className="d-block h-100">
                                                 <span className="setting-widget-wrapper">
                                                     <span className="bg-danger"></span>
                                                     <span className="bg-success"></span>
                                                     <span className="bg-warning"></span>
                                                 </span>
                                                 <span className="d-flex flex-column h-100">
                                                     <span className="row g-0 setting-widget-content">
                                                         <span className="col-3 bg-body-tertiary bg-opacity-50"></span>
                                                         <span className="col-9 p-1">
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                         </span>
                                                     </span>
                                                 </span>
                                             </span>
                                         </label>
                                         <label htmlFor="defaultSidebar" className="cursor-pointer form-label">Default (Large)</label>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="flex-column gap-0 form-check check-primary">
                                         <input id="mediumSidebar" name="data-sidebar" type="radio" value="medium" className="d-none form-check-input" />
                                         <label htmlFor="mediumSidebar" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                             <span className="d-block h-100">
                                                 <span className="setting-widget-wrapper">
                                                     <span className="bg-danger"></span>
                                                     <span className="bg-success"></span>
                                                     <span className="bg-warning"></span>
                                                 </span>
                                                 <span className="d-flex flex-column h-100">
                                                     <span className="row g-0 setting-widget-content">
                                                         <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                         <span className="col-10 p-1">
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                         </span>
                                                     </span>
                                                 </span>
                                             </span>
                                         </label>
                                         <label htmlFor="mediumSidebar" className="cursor-pointer form-label">Medium</label>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="flex-column gap-0 form-check check-primary">
                                         <input id="smallSidebar" name="data-sidebar" type="radio" value="small" className="d-none form-check-input" />
                                         <label htmlFor="smallSidebar" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                             <span className="d-block h-100">
                                                 <span className="setting-widget-wrapper">
                                                     <span className="bg-danger"></span>
                                                     <span className="bg-success"></span>
                                                     <span className="bg-warning"></span>
                                                 </span>
                                                 <span className="d-flex flex-column h-100">
                                                     <span className="row g-0 setting-widget-content">
                                                         <span className="col-1 bg-body-tertiary bg-opacity-50"></span>
                                                         <span className="col-11 p-1">
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                         </span>
                                                     </span>
                                                 </span>
                                             </span>
                                         </label>
                                         <label htmlFor="smallSidebar" className="cursor-pointer form-label">Small</label>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="flex-column gap-0 form-check check-primary">
                                         <input id="offcanvasSidebar" name="data-sidebar" type="radio" value="offcanvas" className="d-none form-check-input" />
                                         <label htmlFor="offcanvasSidebar" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                             <span className="d-block h-100">
                                                 <span className="setting-widget-wrapper">
                                                     <span className="bg-danger"></span>
                                                     <span className="bg-success"></span>
                                                     <span className="bg-warning"></span>
                                                 </span>
                                                 <span className="d-flex flex-column h-100">
                                                     <span className="row g-0 setting-widget-content">
                                                         <span className="col-3 bg-body-tertiary position-absolute top-0 start-0 w-8 h-100"></span>
                                                         <span className="col-9 p-1">
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                             <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                             <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                         </span>
                                                     </span>
                                                 </span>
                                             </span>
                                         </label>
                                         <label htmlFor="offcanvasSidebar" className="cursor-pointer form-label">Offcanvas</label>
                                     </div>
                                 </div>
                             </div>
                         </div>
     
                         <h6 className="my-4">Layout Modes:</h6>
                         <div className="row row-cols-2 row-cols-md-4">
                             <div>
                                 <div className="flex-column gap-0 form-check check-primary">
                                     <input id="lightMode" name="data-bs-theme" type="radio" value="light" className="d-none form-check-input" />
                                     <label htmlFor="lightMode" className="card mb-3 form-check-label setting-widget setting-vertical-widget border-elegant">
                                         <span className="d-block h-100">
                                             <span className="setting-widget-wrapper">
                                                 <span className="bg-danger"></span>
                                                 <span className="bg-success"></span>
                                                 <span className="bg-warning"></span>
                                             </span>
                                             <span className="d-flex flex-column h-100">
                                                 <span className="row g-0 setting-widget-content">
                                                     <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                     <span className="col-10 p-1">
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                         <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                     </span>
                                                 </span>
                                             </span>
                                         </span>
                                     </label>
                                     <label htmlFor="lightMode" className="cursor-pointer form-label">Light</label>
                                 </div>
                             </div>
                             <div id="blackColor">
                                 <div className="flex-column gap-0 form-check check-primary">
                                     <input id="darkMode" name="data-bs-theme" type="radio" value="dark" className="d-none form-check-input" />
                                     <label htmlFor="darkMode" className="card mb-3 form-check-label setting-widget setting-vertical-widget bg-black border-black">
                                         <span className="d-block h-100">
                                             <span className="setting-widget-wrapper bg-dark bg-opacity-50">
                                                 <span className="d-inline-block bg-danger rounded-circle custom-size-element"></span>
                                                 <span className="d-inline-block bg-success rounded-circle custom-size-element"></span>
                                                 <span className="d-inline-block rounded-circle bg-warning custom-size-element"></span>
                                             </span>
                                             <span className="row g-0 setting-widget-content">
                                                 <span className="custom-height col-2 bg-dark bg-opacity-25"></span>
                                                 <span className="custom-height col-10 p-6px d-inline-block">
                                                     <span className="d-block w-25 custom-height-element bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-50 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-100 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-75 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-25 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                 </span>
                                             </span>
                                         </span>
                                     </label>
                                     <label htmlFor="darkMode" className="cursor-pointer form-label">Dark</label>
                                 </div>
                             </div>
                             <div>
                                 <div className="flex-column gap-0 form-check check-primary">
                                     <input id="blackMode" name="data-bs-theme" type="radio" value="black" className="d-none form-check-input" />
                                     <label htmlFor="blackMode" className="card mb-3 form-check-label setting-widget setting-vertical-widget bg-black border-black">
                                         <span className="d-block h-100">
                                             <span className="setting-widget-wrapper bg-dark bg-opacity-50">
                                                 <span className="d-inline-block bg-danger rounded-circle custom-size-element"></span>
                                                 <span className="d-inline-block bg-success rounded-circle custom-size-element"></span>
                                                 <span className="d-inline-block rounded-circle bg-warning custom-size-element"></span>
                                             </span>
                                             <span className="row g-0 setting-widget-content">
                                                 <span className="custom-height col-2 bg-dark bg-opacity-25"></span>
                                                 <span className="custom-height col-10 p-6px d-inline-block">
                                                     <span className="d-block w-25 custom-height-element bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-50 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-100 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-75 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                     <span className="d-block w-25 custom-height-element mt-1 bg-dark bg-opacity-25 rounded"></span>
                                                 </span>
                                             </span>
                                         </span>
                                     </label>
                                     <label htmlFor="blackMode" className="cursor-pointer form-label">Black</label>
                                 </div>
                             </div>
                             <div>
                                 <div className="flex-column gap-0 form-check check-primary">
                                     <input id="autoMode" name="data-bs-theme" type="radio" value="auto" className="d-none form-check-input" />
                                     <label htmlFor="autoMode" className="card mb-3 form-check-label setting-widget setting-vertical-widget system-mode border-elegant">
                                         <span className="position-relative d-block h-100">
                                             <span className="setting-widget-wrapper bg-body-tertiary bg-opacity-50">
                                                 <span className="d-inline-block bg-danger rounded-circle custom-size-element"></span>
                                                 <span className="d-inline-block bg-success rounded-circle custom-size-element"></span>
                                                 <span className="d-inline-block rounded-circle bg-warning custom-size-element"></span>
                                             </span>
                                             <span className="row setting-widget-content row-cols-12 g-0">
                                                 <span className="row g-0"></span>
                                                 <span className="custom-height col-10 p-6px d-inline-block">
                                                     <span className="d-block custom-width-33 custom-height-element bg-body-tertiary bg-opacity-50 rounded"></span>
                                                     <span className="d-block custom-width-50 custom-height-element mt-1 bg-body-tertiary bg-opacity-50 rounded"></span>
                                                     <span className="d-block custom-width-100 custom-height-element mt-1 bg-body-tertiary bg-opacity-50 rounded"></span>
                                                     <span className="d-block custom-width-33 custom-height-element mt-1 bg-body-tertiary bg-opacity-50 rounded"></span>
                                                     <span className="d-block custom-width-66 custom-height-element mt-1 bg-body-tertiary bg-opacity-50 rounded"></span>
                                                 </span>
                                             </span>
                                         </span>
                                     </label>
                                     <label htmlFor="autoMode" className="cursor-pointer form-label">Default System</label>
                                 </div>
                             </div>
                             <div>
                                 <div className="flex-column gap-0 form-check check-primary">
                                     <input id="blackWhiteMode" name="data-bs-theme" type="radio" value="black-white" className="d-none form-check-input" />
                                     <label htmlFor="blackWhiteMode" className="card mb-3 form-check-label setting-widget setting-vertical-widget grayscale border-elegant">
                                         <span className="d-block h-100">
                                             <span className="setting-widget-wrapper">
                                                 <span className="bg-danger"></span>
                                                 <span className="bg-success"></span>
                                                 <span className="bg-warning"></span>
                                             </span>
                                             <span className="d-flex flex-column h-100">
                                                 <span className="row g-0 setting-widget-content">
                                                     <span className="col-2 bg-body-tertiary bg-opacity-50"></span>
                                                     <span className="col-10 p-1">
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-50"></span>
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-100"></span>
                                                         <span className="d-block mb-1 bg-body-tertiary rounded custom-height-element w-25"></span>
                                                         <span className="d-block bg-body-tertiary rounded custom-height-element w-75"></span>
                                                     </span>
                                                 </span>
                                             </span>
                                         </span>
                                     </label>
                                     <label htmlFor="blackWhiteMode" className="cursor-pointer form-label">Black &amp; White</label>
                                 </div>
                             </div>
                         </div>
                         <div>
                             <h6 className="my-4">Sidebar Colors:</h6>
                             <div className="d-flex flex-wrap align-items-center gap-3">
                                 <div className="form-check check-primary">
                                     <input id="lightSidebarColors" name="data-sidebar-colors" type="radio" value="light" className="d-none form-check-input" />
                                     <label htmlFor="lightSidebarColors" className="bg-body-tertiary rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="darkSidebarColors" name="data-sidebar-colors" type="radio" value="dark" className="d-none form-check-input" />
                                     <label htmlFor="darkSidebarColors" className="sidebar-color-2 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="brandSidebarColors" name="data-sidebar-colors" type="radio" value="brand" className="d-none form-check-input" />
                                     <label htmlFor="brandSidebarColors" className="sidebar-color-3 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="wineSidebarColors" name="data-sidebar-colors" type="radio" value="wine" className="d-none form-check-input" />
                                     <label htmlFor="wineSidebarColors" className="sidebar-color-4 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="greenSidebarColors" name="data-sidebar-colors" type="radio" value="green" className="d-none form-check-input" />
                                     <label htmlFor="greenSidebarColors" className="sidebar-color-5 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                             </div>
                         </div>
                         <div>
                             <h6 className="my-4">Topbar Colors:</h6>
                             <div className="d-flex flex-wrap align-items-center gap-3">
                                 <div className="form-check check-primary">
                                     <input id="lightTopbarColors" name="data-topbar-colors" type="radio" value="light" className="d-none form-check-input" />
                                     <label htmlFor="lightTopbarColors" className="bg-body-tertiary rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="darkTopbarColors" name="data-topbar-colors" type="radio" value="dark" className="d-none form-check-input" />
                                     <label htmlFor="darkTopbarColors" className="sidebar-color-2 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="brandTopbarColors" name="data-topbar-colors" type="radio" value="brand" className="d-none form-check-input" />
                                     <label htmlFor="brandTopbarColors" className="sidebar-color-3 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="wineTopbarColors" name="data-topbar-colors" type="radio" value="wine" className="d-none form-check-input" />
                                     <label htmlFor="wineTopbarColors" className="sidebar-color-4 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="skyTopbarColors" name="data-topbar-colors" type="radio" value="sky" className="d-none form-check-input" />
                                     <label htmlFor="skyTopbarColors" className="sidebar-color-5 rounded-circle form-check-label outline-offset-2 size-10"></label>
                                 </div>
                             </div>
                         </div>
     
                         <h6 className="my-4">Primary Colors:</h6>
                         <div className="d-flex flex-wrap items-center gap-3">
                             <div className="form-check check-primary">
                                 <input id="defaultPrimaryColors" name="data-colors" type="radio" value="default" className="d-none form-check-input" />
                                 <label htmlFor="defaultPrimaryColors" className="theme-color-1 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="tealPrimaryColors" name="data-colors" type="radio" value="teal" className="d-none form-check-input" />
                                 <label htmlFor="tealPrimaryColors" className="theme-color-2 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="purplePrimaryColors" name="data-colors" type="radio" value="purple" className="d-none form-check-input" />
                                 <label htmlFor="purplePrimaryColors" className="theme-color-3 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="rosePrimaryColors" name="data-colors" type="radio" value="rose" className="d-none form-check-input" />
                                 <label htmlFor="rosePrimaryColors" className="theme-color-4 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="slatePrimaryColors" name="data-colors" type="radio" value="slate" className="d-none form-check-input" />
                                 <label htmlFor="slatePrimaryColors" className="theme-color-5 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="amberPrimaryColors" name="data-colors" type="radio" value="amber" className="d-none form-check-input" />
                                 <label htmlFor="amberPrimaryColors" className="theme-color-6 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="orchidPrimaryColors" name="data-colors" type="radio" value="orchid" className="d-none form-check-input" />
                                 <label htmlFor="orchidPrimaryColors" className="theme-color-7 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="olivePrimaryColors" name="data-colors" type="radio" value="olive" className="d-none form-check-input" />
                                 <label htmlFor="olivePrimaryColors" className="theme-color-8 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="orangePrimaryColors" name="data-colors" type="radio" value="orange" className="d-none form-check-input" />
                                 <label htmlFor="orangePrimaryColors" className="theme-color-9 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                             <div className="form-check check-primary">
                                 <input id="indigoPrimaryColors" name="data-colors" type="radio" value="indigo" className="d-none form-check-input" />
                                 <label htmlFor="indigoPrimaryColors" className="theme-color-10 rounded-circle form-check-label outline-offset-2 size-10"></label>
                             </div>
                         </div>
                         <div id="sidebarImageSection">
                             <h6 className="my-4">Sidebar Image:</h6>
                             <div className="d-flex flex-wrap align-items-center gap-3">
                                 <div className="form-check check-primary">
                                     <input id="image0SidebarBg" name="data-sidebar-image" type="radio" value="none" className="d-none form-check-input" />
                                     <label htmlFor="image0SidebarBg" className="sidebar-image-none rounded-1 form-check-label outline-offset-2">
                                         <span className="h-24 w-14 avatar text-center fs-13 text-muted rounded-1 bg-light border">No Image</span>
                                     </label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="image1SidebarBg" name="data-sidebar-image" type="radio" value="image-1" className="d-none form-check-input" />
                                     <label htmlFor="image1SidebarBg" className="sidebar-image-1 rounded-1 form-check-label outline-offset-2">
                                         <img src="/assets/images/img-1.webp" alt="Image 1" className="h-24 w-14 object-fit-cover rounded-1"/>
                                     </label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="image2SidebarBg" name="data-sidebar-image" type="radio" value="image-2" className="d-none form-check-input" />
                                     <label htmlFor="image2SidebarBg" className="sidebar-image-2 rounded-1 form-check-label outline-offset-2">
                                         <img src="/assets/images/img-2.webp" alt="Image 2" className="h-24 w-14 object-fit-cover rounded-1"/>
                                     </label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="image3SidebarBg" name="data-sidebar-image" type="radio" value="image-3" className="d-none form-check-input" />
                                     <label htmlFor="image3SidebarBg" className="sidebar-image-3 rounded-1 form-check-label outline-offset-2">
                                         <img src="/assets/images/img-3.webp" alt="Image 3" className="h-24 w-14 object-fit-cover rounded-1"  />
                                     </label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="image4SidebarBg" name="data-sidebar-image" type="radio" value="image-4" className="d-none form-check-input" />
                                     <label htmlFor="image4SidebarBg" className="sidebar-image-4 rounded-1 form-check-label outline-offset-2">
                                         <img src="/assets/images/img-4.webp" alt="Image 4" className="h-24 w-14 object-fit-cover rounded-1"/>
                                     </label>
                                 </div>
                                 <div className="form-check check-primary">
                                     <input id="image5SidebarBg" name="data-sidebar-image" type="radio" value="image-5" className="d-none form-check-input" />
                                     <label htmlFor="image5SidebarBg" className="sidebar-image-5 rounded-1 form-check-label outline-offset-2">
                                         <img src="/assets/images/img-5.webp" alt="Image 5" className="h-24 w-14 object-fit-cover rounded-1"/>
                                     </label>
                                 </div>
                             </div>
                         </div>
     
                     </div>
                 </div>
                 <div className="d-flex align-items-center justify-content-end gap-2 modal-footer">
                     <button type="button" className="btn btn-light" id="resetLayout"><i data-lucide="rotate-ccw" className="d-inline-block me-1 size-4"></i> Reset Layouts</button>
                     <a href="#!" className="btn btn-danger"><i data-lucide="shopping-bag" className="d-inline-block ms-1 size-4"></i> Buy Now</a>
                 </div>
             </div>
         </div>
     </div>
   </>
  );
}

export default Switcher