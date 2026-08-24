const color =
    getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary-main")
        ?.trim() || "103,93,176";

(function () {
  "use strict";

  const balance = document.getElementById('balance');
  const showIcon = document.getElementById('showIcon');
  const hideIcon = document.getElementById('hideIcon');

  const actualBalance = '2,14,356.00'; // Your real balance

  // By default, balance is visible
  balance.textContent = actualBalance;
  showIcon.style.display = 'none';
  hideIcon.style.display = 'inline';

  // Hide balance when clicking the eye-off
  hideIcon.addEventListener('click', () => {
      balance.textContent = '***********';
      hideIcon.style.display = 'none';
      showIcon.style.display = 'inline';
  });

  // Show balance when clicking the eye
  showIcon.addEventListener('click', () => {
      balance.textContent = actualBalance;
      showIcon.style.display = 'none';
      hideIcon.style.display = 'inline';
  });


  //finance inflow//
  var options = {
    series: [{
    data: [98, 110, 80, 145, 105, 112, 87, 148, 102]
    }],
    chart: {
    height: 100,
    type: 'area',
    fontFamily: 'Roboto, Arial, sans-serif',
    foreColor: '#5d6162',
    zoom: {
        enabled: false
    },
    sparkline: {
        enabled: true
    }
    },
    tooltip: {
    enabled: true,
    x: {
        show: false
    },
    y: {
        title: {
        formatter: function (seriesName) {
            return ''
        }
        }
    },
    marker: {
        show: false
    }
    },
    dataLabels: {
    enabled: false
    },
    stroke: {
    width: [1.5],
    curve: 'smooth'
    },
    title: {
    text: undefined,
    },
    grid: {
    borderColor: 'transparent',
    },
    xaxis: {
    crosshairs: {
        show: false,
    }
    },
    colors: ["rgb(2,188,156)"],
    fill: {
    type: 'gradient',
    gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
    }
    },
  };
  var chart1 = new ApexCharts(document.querySelector("#inflow-amount"), options);
  chart1.render();
  //finance inflow//

  //spending Breakdown//
  var options = {
    series: [1854, 1287, 684, 367],
    labels: ["Rent", "Groceries", "Movies", "Others"],
    chart: {
        height: 255,
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
    responsive: [{
      breakpoint: 576,
      options: {
          legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            markers: {
              size:4,
            },
            itemMargin: {
              horizontal: 2,
              vertical: 0
            }
          }
      }
    }],
    colors: ["var(--color-primary)", "var(--color-secondary)","var(--color-warning)", "rgba(16, 25, 47, 0.06)"],
};
var chart = new ApexCharts(document.querySelector("#speaning-breakdown"), options);
chart.render();
  //spending Breakdown//


//finance Overview//
var options = {
  series: [
    {
      name: "Investments",
      data: [13, 23, 20, 25, 10, 13, 13, 15, 13, 23, 20, 25],
      type: "column",
    },
    {
      name: "Savings",
      data: [20, 30, 25, 50, 25, 30, 20, 35, 20, 30, 25, 50],
      type: "column",
    },
  ],
  chart: {
    type: "line",
    height: 300,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: true,
    },
    stacked: true,
  },
  grid: {
    show: true,
    borderColor: "rgba(119, 119, 142, 0.1)",
    strokeDashArray: 4,
  },
  fill: {
    opacity: 1,
  },
  colors: ["var(--color-primary)", `rgba(${color},0.1)`],
  stroke: {
    curve: 'smooth',
    width: ['4', '4'],
    dashArray: ['0', '0']
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "40%",
      borderRadius: "3",
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
      show: true,
      style: {
        colors: "#8c9097",
        fontSize: "11px",
        fontWeight: 600,
        cssClass: "apexcharts-xaxis-label",
      },
    },
  },
  legend: {
    show: true,
    position: "bottom",
    offsetX: 0,
    offsetY: 10,
    markers: {
       size:5,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 12,
      customHTML: undefined,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0,
    },
  },
  yaxis: {
    labels: {
      show: true,
      style: {
        colors: "#8c9097",
        fontSize: "11px",
        fontWeight: 600,
        cssClass: "apexcharts-xaxis-label",
      },
    },
  },
};
var chart = new ApexCharts(document.querySelector("#finance-overview"), options);
chart.render();

//finance Overview//

// swiper with pagination
var swiper = new Swiper(".pagination", {
  pagination: {
      el: ".swiper-pagination",
      clickable: true,
  },
  loop: true,
  autoplay: {
      delay: 1500,
      disableOnInteraction: false
  }
});


//recent transaction table//
new gridjs.Grid({
  columns: [
    { name: "ID", width: "100px" },
    {
      name: "Customer",
      width: "220px",
      formatter: (cell) => gridjs.html(`
        <div class="flex items-center gap-2">
          <div class="lh-1">
            <span class="avatar avatar-sm avatar-rounded bg-light">
              <img src="${cell.image}" alt="${cell.name}" class="avatar-img">
            </span>
          </div>
          <div>
            <span class="block fw-semibold">${cell.name}</span>
            <span class="fs-13 block text-muted">${cell.email}</span>
          </div>
        </div>
      `)
    },
    { name: "Description", width: "200px" },
    { name: "Amount", width: "120px" },
    { 
      name: "Type", 
      width: "100px",
      formatter: (cell) => {
        const color = cell === "Credit" ? "success" : "danger";
        return gridjs.html(`<span class="text-${color}">${cell}</span>`);
      }
    },
    { name: "Method", width: "120px" },
    { name: "Date", width: "180px" },
    {
      name: "Status",
      width: "120px",
      formatter: (cell, row) => {
        // row.cell(4) is Type column (0-based index)
        const type = row.cells[4].data;
        const badge = type === "Credit" ? "success" : "danger";
        return gridjs.html(`<span class="badge bg-${badge}-transparent">${badge === "success" ? "Success" : "Danger"}</span>`);
      }
    },
    {
      name: "Actions",
      width: "100px",
      formatter: () => gridjs.html(`
        <div class="ti-dropdown hs-dropdown inline-flex custom-invoice"> 
          <a aria-label="anchor" href="javascript:void(0);" class="ti-btn ti-btn-icon ti-btn-sm ti-btn-light ti-dropdown-toggle m-0 p-0 hs-dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fe fe-more-vertical"></i> 
          </a> 
          <ul class="ti-dropdown-menu  hs-dropdown-menu hidden"> 
              <li><a class="ti-dropdown-item inline-flex items-center" href="javascript:void(0);"> <i class="ri-eye-line me-2"></i>View</a></li> 
              <li><a class="ti-dropdown-item inline-flex items-center" href="javascript:void(0);"> <i class="ri-pencil-line me-2"></i>Edit</a></li> 
              <li><a class="ti-dropdown-item inline-flex items-center" href="javascript:void(0);"> <i class="ri-delete-bin-line me-2"></i>Delete</a></li> 
          </ul> 
        </div>
      `)
    }
  ],

  data: [
    ["#TX105", { name: "Ava Johnson", email: "ava.johnson@example.com", image: "../assets/images/faces/1.jpg" }, "Monthly Subscription", "$349.99", "Credit", "credit card", "09 May,26 10:15 am", "", ""],
    ["#TX104", { name: "Ethan Wilson", email: "ethan.wilson@example.com", image: "../assets/images/faces/2.jpg" }, "Refund Issued", "-$75.00", "Debit", "credit card", "08 May,26 03:42 pm", "", ""],
    ["#TX103", { name: "GlobalPay", email: "support@globalpay.com", image: "../assets/images/faces/3.jpg" }, "Wallet Recharge", "$500.00", "Credit", "PayPal", "08 May,26 01:25 pm", "", ""],
    ["#TX102", { name: "Mia Roberts", email: "mia.roberts@example.com", image: "../assets/images/faces/4.jpg" }, "Service Fee", "-$29.99", "Debit", "Stripe", "07 May,26 09:11 am", "", ""],
    ["#TX106", { name: "Lucas Kim", email: "lucas.kim@example.com", image: "../assets/images/faces/5.jpg" }, "Invoice Payment", "$420.50", "Credit", "credit card", "06 May,26 08:45 pm", "", ""],
    ["#TX107", { name: "ShopEase", email: "contact@shopease.com", image: "../assets/images/faces/6.jpg" }, "POS Payment", "-£45.00", "Debit", "credit card", "05 May,26 02:30 pm", "", ""],
  ],

  style: { table: { "white-space": "nowrap" } },
  pagination: true,
  sort: true,
  resizable: true
}).render(document.getElementById("grid-wide"));

})();