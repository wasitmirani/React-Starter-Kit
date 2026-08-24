(function () {
  "use strict";
   
  /* Sales Overview */
  var optionsoverview = {
    series: [
      {
        name: "Orders",
        type: "area",
        data: [40, 35, 50, 36, 32, 36, 56, 64, 50, 42, 33, 37, 30, 51, 35, 38, 33, 37,45,34,45,48,52],
      },
      {
        name: "Sales",
        type: "line",
        data: [44, 42, 40, 46, 48, 55, 48, 43, 48, 54, 50, 54, 54, 52, 57, 60, 51, 55,62,65,75,54,50],
      },
    ],
    chart: {
      height: 350,
      type: "line",
      stacked: false,
      toolbar: {
        show: false,
      },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 4,
        color: "#000",
        opacity: 0.1,
      },
    },
    stroke: {
      width: [2.3,2.3],
      curve: "smooth",
      dashArray: [ 0, 5],
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      position: "back",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    colors: ["var(--color-primary)", "var(--color-secondary)"],
    fill: {
      type:["gradient", "solid"],
      gradient: {
        shadeIntensity: 1,
        type: "vertical",
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
            [
                {
                    offset: 0,
                    color: "var(--color-primary)",
                    opacity: 0.15
                },
                {
                    offset: 75,
                    color: "var(--color-primary)",
                    opacity: 0.08
                },
                {
                    offset: 100,
                    color: 'var(--color-primary)',
                    opacity: 0.02
                }
            ],
            [
                {
                    offset: 0,
                    color: "var(--color-secondary)",
                    opacity: 1
                },
                {
                    offset: 75,
                    color: "var(--color-secondary)",
                    opacity: 1
                },
                {
                    offset: 100,
                    color: 'var(--color-secondary)',
                    opacity: 1
                }
            ],
        ]
      }
    },
    labels: ['Jan', " ", 'Feb', " " , 'Mar', "" , 'Apr',"" , 'May', "", 'Jun', "", 'Jul',"", 'Aug',"", 'sep',"", 'oct',"", 'nov',"", 'dec'],
   
    yaxis: {
      title: {
        style: {
          color: '#adb5be',
          fontSize: '14px',
          fontFamily: "Google Sans, sans-serif",
          fontWeight: 600,
          cssClass: 'apexcharts-yaxis-label',
        },
      },
      labels: {
        formatter: function (y) {
          return y.toFixed(0) + "";
        }
      },
      min:10,
    },
    xaxis: {
      type: 'month',
      axisBorder: {
        show: true,
        color: 'rgba(119, 119, 142, 0.05)',
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: true,
        borderType: 'solid',
        color: 'rgba(119, 119, 142, 0.05)',
        width: 6,
        offsetX: 0,
        offsetY: 0
      },
      labels: {
        rotate: -90
      }
    },
    legend: {
      show: true,
      position: 'top',
      offsetY: 30,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  var chartoverview = new ApexCharts(document.querySelector("#sales-statistics"), optionsoverview);
  chartoverview.render();
  /* Sales Overview */

  var options = {
    series: [1854, 1287, 684, 367],
    labels: ["Mobile", "Laptop", "Tablet", "Desktop"],
    chart: {
        height: 210,
        type: 'donut',
    },
    dataLabels: {
        enabled: false,
    },

    legend: {
        show: true,
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'round',
        colors: "#fff",
        width: 3,
        dashArray: 0,
    },
    plotOptions: {
        pie: {
            offsetY: 10,
            expandOnClick: false,
            donut: {
                size: '80%',
                background: 'transparent',
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '20px',
                        color: '#495057',
                        fontFamily: "Google Sans, sans-serif",
                        offsetY: -5
                    },
                    value: {
                        show: true,
                        fontSize: '22px',
                        color: undefined,
                        offsetY: 10,
                        fontWeight: 600,
                        fontFamily:  "'Google Sans', sans-serif",
                        formatter: function (val) {
                            return val + "%"
                        }
                    },
                    total: {
                        show: true,
                        showAlways: true,
                        label: 'Total Visitors',
                        fontSize: '14px',
                        fontFamily:  "'Google Sans', sans-serif",
                        fontWeight: 500,
                        color: '#495057',
                    }
                }
            }
        }
    },
    colors: ["var(--color-primary)", "var(--color-secondary)","var(--color-warning)", "rgba(16, 25, 47, 0.06)"],
};
var chart = new ApexCharts(document.querySelector("#visitors-by-sales"), options);
chart.render();


/* Earning Statistics */
// var options = {
//   series: [{
//     name: 'This Week',
//     data: [300, 200, 350, 150, 250, 325, 250, 270],
//   }, {
//     name: 'Last Week',
//     data: [-180, -225, -180, -280, -125, -200, -125, -150],
//   }],
//   chart: {
//     height: 210,
//     parentHeightOffset: 0,
//     stacked: true,
//     type: "bar",
//     toolbar: { show: false }
//   },
//   grid: {
//     show: false,
//     padding: { top: -40, bottom: -40, left: -10, right: -2 }
//   },
//   colors: ["var(--color-primary)", "var(--color-secondary)"],
//   plotOptions: {
//     bar: {
//       horizontal: false,
//       columnWidth: "30%",
//       borderRadius: 3,
//       startingShape: "rounded",
//       endingShape: "rounded",
//       borderRadiusApplication: "around",
//       borderRadiusWhenStacked: "last"
//     }
//   },
//   stroke: { curve: "smooth", width: 5, lineCap: "round", colors: [e] },
//   dataLabels: { enabled: false },
//   legend: { show: false },
//   xaxis: {
//     labels: { show: false },
//     axisTicks: { show: false },
//     axisBorder: { show: false }
//   },
//   yaxis: { labels: { show: false } },
// };
// var chart = new ApexCharts(document.querySelector("#total-earnings"), options);
// chart.render();


const options12 = {
  series: [
    {
      name: "Profile Activity",
      data: [45, 35, 36, 40, 25, 45, 35, 30, 42, 35],
      type: "column",
    },
    {
      name: "Profile Reached",
      data: [10, 15, 13, 16, 15, 10, 12, 15, 9, 12],
      type: "column",
    },
  ],
  chart: {
    type: "line",
    height: 223,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: true,
    },
    stacked: true,
  },
  grid: {
    show: false,
    borderColor: "rgba(119, 119, 142, 0.1)",
    strokeDashArray: 4,
  },
  colors: ["var(--color-primary)", "var(--color-success)"],
  stroke: {
    curve: 'smooth',
    width: ['4', '4'],
    dashArray: ['0', '0']
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "33%",
      borderRadius: "2",
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    labels: {
      show: false,
      style: {
        colors: "#8c9097",
        fontSize: "11px",
        fontWeight: 600,
        cssClass: "apexcharts-xaxis-label",
      },
    },
  },
  legend: {
    show: false,
  },
  fill: {
    opacity: 1,
  },
  yaxis: {
    labels: {
      show: false,
      style: {
        colors: "#8c9097",
        fontSize: "11px",
        fontWeight: 600,
        cssClass: "apexcharts-xaxis-label",
      },
    },
  },
};
const chart12 = new ApexCharts(document.querySelector("#total-earnings"), options12);
if(chart12) chart12.render();
/* Earning Statistics */

//wide tables
new gridjs.Grid({
  columns: [
    { name: "ID", width: "120px" },

    {
      name: "Customer",
      width: "280px",
      formatter: (cell) => gridjs.html(`
       <div class="flex items-center gap-2">
          <div class="leading-none">
              <span class="avatar avatar-sm avatar-rounded bg-light">
                  <img src="${cell.image}" alt="${cell.name}" class="avatar-img">
              </span>
          </div>
          <div>
              <span class="block font-semibold">${cell.name}</span>
              <span class="text-[13px] block text-gray-500">${cell.email}</span>
          </div>
      </div>
      `)
    },

    {
      name: "Ordered Date",
      width: "180px",
      formatter: (cell) => gridjs.html(`
        <div>${cell.date}</div>
        <div class="text-textmuted text-[13px]">${cell.time}</div>
      `)
    },

    { 
      name: "Price",
      width: "120px"
    },

    {
      name: "Status",
      width: "120px",
      formatter: (cell) => {
        let badge = "success";

        if (cell === "Pending") badge = "warning";
        if (cell === "Overdue") badge = "danger";

        return gridjs.html(`
          <span class="badge bg-${badge}-transparent">${cell}</span>
        `);
      }
    },

    {
      name: "Actions",
      width: "100px",
      formatter: () => gridjs.html(`
        <div class="text-center">
            <div class="ti-dropdown hs-dropdown [--placement:top-right] ti-custom-drop relative inline-block">
                <a href="javascript:void(0);" class="ti-custom-btn ti-btn-icon ti-btn-sm ti-btn-primary-light border border-defaultborder rounded-sm bg-primary-transparent relative!" data-bs-toggle="ti-dropdown" aria-expanded="false">
                    <i class="fe fe-more-vertical"></i>
                </a>
                <ul class="ti-dropdown-menu hs-dropdown-menu ti-custom-menu hidden mt-0 custom-product-drop">
                    <li><a class="ti-dropdown-item inline-flex items-center" href="orders-details.html"><i class="ri-eye-line me-2 leading-none"></i>View</a></li>
                    <li><a class="ti-dropdown-item inline-flex items-center" href="orders-details.html"><i class="ri-pencil-line me-2 leading-none"></i>Edit</a></li>
                    <li><a class="ti-dropdown-item inline-flex items-center btn-delete" href="javascript:void(0);"><i class="ri-delete-bin-line me-2 leading-none"></i>Delete</a></li>
                </ul>
            </div>
        </div>
      `)
    }
  ],

  data: [
    [
      "#SPK231",
      {
        name: "Jane Smith",
        email: "janesmith213@gmail.com",
        image: "../assets/images/faces/5.jpg"
      },
      {
        date: "27 Aug 2024",
        time: "12:45PM"
      },
      "$1,249",
      "Paid",
      ""
    ],
    [
      "#SPK421",
      {
        name: "John Doe",
        email: "jhondoe865@gmail.com",
        image: "../assets/images/faces/8.jpg"
      },
      {
        date: "16 Sep 2024",
        time: "11:15AM"
      },
      "$3,299",
      "Pending",
      ""
    ],
    [
      "#SPK175",
      {
        name: "Emily Davis",
        email: "emileydavis234@gmail.com",
        image: "../assets/images/faces/9.jpg"
      },
      {
        date: "15 Sep 2024",
        time: "04:45PM"
      },
      "$4,799",
      "Overdue",
      ""
    ],
    [
      "#SPK176",
      {
        name: "Leo Phillip",
        email: "leophillip423@gmail.com",
        image: "../assets/images/faces/11.jpg"
      },
      {
        date: "21,Sep 2024",
        time: "02:18PM"
      },
      "$2,499",
      "paid",
      ""
    ],
    [
      "#SPK177",
      {
        name: "Sara Lee",
        email: "saralee765@gmail.com",
        image: "../assets/images/faces/10.jpg"
      },
      {
        date: "19,Oct 2024",
        time: "03:52PM"
      },
      "$3,999",
      "Pending",
      ""
    ]
  ],

  style: {
    table: {
      "white-space": "nowrap"
    }
  },

  pagination: true,
  sort: true,
  resizable: true
}).render(document.getElementById("grid-wide"));
//wide tables

})();