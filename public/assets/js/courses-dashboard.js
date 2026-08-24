(function () {
  "use strict";

 /* Visitors Analysis */
 var options = {
  series: [
    {
      name: "This Week",
      data: [25, 50, 30, 55, 20, 45, 30]
    },
    {
      name: "Previous Week",
      data: [35, 25, 40, 30, 45, 35, 60]
    }
  ],
  chart: {
    height: 244,
    type: 'line',
    offsetY: 20,
    offsetX: 5,
    toolbar: {
      show: false
    },
    dropShadow: {
      enabled: true,
      enabledOnSeries: undefined,
      top: 7,
      left: 0,
      blur: 1,
      color: ["transparent", "rgb(140, 210, 46)"],
      opacity: 0.05,
    },
  },
  colors: ['var(--color-primary)', 'var(--color-success)'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
    dashArray: [0, 3],
  },
  grid: {
    show: false,
    borderColor: '#f9f9fb87',
    row: {
      colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
    },
  },
  yaxis: {
    show: false,
    min:0,
  },
  xaxis: {
    type: "week",
    offsetY: -20,
    categories: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    axisBorder: {
      color: 'rgba(119, 119, 142, 0.15)',
      offsetX: 0,
      offsetY: 0,
    },
    axisTicks: {
      color: 'rgba(119, 119, 142, 0.05)',
      width: 6,
      offsetX: 0,
      offsetY: 0
    },
    labels: {
      show: true,
      style: {
        colors: "#010101",
      }
    }
  },
  fill: {
    opacity: 1,
  },
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'right',
    floating: true,
    offsetY: -25,
    offsetX: -5
  },
  tooltip: {
    theme: "dark",
  }
};
var chart = new ApexCharts(document.querySelector("#visitors-report"), options);
chart.render();
/* Visitors Analysis */

 /* student Analysis */
 var options = {
  series: [{
      name: 'This Year',
      type: 'column',
      data: [50 , , 150, , 100, , 170, , 120, , 150, , 130, , 90, , 100 , , 120 , , 80 , , 70]
    },{  
      name: 'Last Year',
      type: 'area',
      data: [220 , 195, 280, 180, 250, 195, 250, 170, 290 , 190 , 220 , 190 , 230 , 250 , 190 , 225 , 225, 270,270 ,150,150,200,200]
    }],
    chart: {
      height: 360,
      type: 'area',
      stacked: false,
      toolbar: {
        show: false,
      }
    },
  grid: {
      borderColor: '#f2f6f7',
      borderColor: "#f1f1f1",
      strokeDashArray: 2,
      xaxis: {
          lines: {
              show: true
          }
      },
      yaxis: {
          lines: {
              show: false
          }
      }
  },
  dataLabels: {
      enabled: false
  },
  legend: {
      position: 'top'
  },
  colors: ["var(--color-primary)", "var(--color-secondary)"],
  stroke: {
      width: [0, 2, 5],
      curve: 'stepline'
    },
  labels: ['Jan', , 'Feb',  , 'Mar', , 'Apr', , 'May', , 'Jun', , 'Jul', , 'Aug', , 'Sep', , 'Oct', , 'Nov', , 'Dec'],
  legend: {
      show: true,
      position: 'top'
  },
  fill: {
      type: ["solid","gradient"],
      opacity:1,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "var(--color-secondary)",
            opacity: 0.2
          },
          {
            offset: 20,
            color: "var(--color-secondary)",
            opacity: 0.1
          },
          {
            offset: 60,
            color: "var(--color-secondary)",
            opacity: 0
          },
          {
            offset: 100,
            color: "var(--color-secondary)",
            opacity: 0
          }
        ]
      }
    },   
  plotOptions: {
      bar: {
          columnWidth: "35%",
          borderRadius: 2
      }
  },
  tooltip: {
    enabled: true,
    theme: "dark",
  }
};
var chart1 = new ApexCharts(document.querySelector("#student-analytics"), options);
chart1.render();
/* student Analysis */

})();