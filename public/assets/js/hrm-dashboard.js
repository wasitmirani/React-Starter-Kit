const successcolor = getComputedStyle(document.documentElement).getPropertyValue('--color-success-main').trim();
(function () {
  'use strict';

  /* Attedance Summary */
    var options = {

      chart: {
          type: 'bar',
          height: 365,
          toolbar: {
              show: false
          },
      },
      series: [
          {
              type: 'area',
              name: 'Absent',
              data: [48, 57, 44, 52, 73, 68, 49, 39, 81, 54, 46, 63]
          },
          {
            type: 'line',
              name: 'Present',
              data: [212, 93, 176, 138, 227, 252, 215, 144, 209, 29, 82, 198]
          },
          
          {
              name: 'Total Employees',
              data: [260, 150, 220, 190, 300, 320, 264, 183, 290, 83, 128, 261]
          }
      ],

      colors: [`rgba(${successcolor},0.2)`,  'var(--color-warning)', 'var(--color-primary)'],

      plotOptions: {
          bar: {
              borderRadius: 3,
              columnWidth: '30%',
          }
      },

      dataLabels: {
          enabled: false
      },
      stroke: {
          curve: 'smooth',
          width: [0, 1.6, 4],
          dashArray: [0, 5, 0]
      },

      fill: {
        opacity: 1,
      },

      grid: {
          borderColor: '#f1f5f9',
          strokeDashArray: 3
      },

      xaxis: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",],

          axisBorder: {
              show: false
          },

          axisTicks: {
              show: false
          },

          labels: {
              style: {
                  colors: '#94a3b8',
                  fontSize: '11px'
              }
          }
      },

      yaxis: {
          tickAmount: 5,
          max: 350,
          min: 0,

          labels: {

              style: {
                  colors: '#94a3b8',
                  fontSize: '11px'
              },
              formatter: function (value) {
                return value.toFixed(0);
              }
          }
      },

      legend: {
          show: true,
          position: 'bottom',
          horizontalAlign: 'center',
          labels: {
              colors: '#64748b'
          },
          markers: {
              radius: 4,
              size: 5,
              shape: 'circle'
          }
      },
       tooltip: {
        shared: true,
        intersect: false,
        theme: 'light',
        y: {
            formatter: function (val) {
                return val + " Employees";
            }
        }
    },

  };

  var chart = new ApexCharts(
      document.querySelector("#attendancesummaryChart"),
      options
  );

  chart.render();
  /* Attedance Summary */

  /* Daily attendence Overview */
  var options = {
    series: [1754, 878, 470],
    labels: ["Present", "Late", "Absent"],
    chart: {
      height: 260,
      type: 'donut',
    },
    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },
    stroke: {
      show: true,
      curve: 'smooth',
      lineCap: 'round',
      colors: "#fff",
      width: 4,
      dashArray: 0,
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
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
              offsetY: -30
            },
            value: {
              show: true,
              fontSize: '15px',
              color: undefined,
              offsetY: -25,
              formatter: function (val) {
                return val + "%"
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '22px',
              fontWeight: 600,
              color: '#495057',
            }

          }
        }
      }
    },
    
    grid: {
      padding: {
        bottom: -100
      }
    },
    colors: ["var(--color-primary)", "var(--color-success)", "var(--color-secondary)"],
  };
  var chart = new ApexCharts(document.querySelector("#daily-attendance-overview"), options);
  chart.render();
  /* Daily attendence Overview */

  /* Employee By Department */
  var options = {
  series: [
    {
      name: 'New Employees',
      data: [462, 451, 350, 530, 470, 500, 485]
    },
    {
      name: 'Existing Employees',
      data: [200, 180, 150, 220, 210, 190, 170]
    }
  ],

  chart: {
    type: 'bar',
    height: 375,
    stacked: true,
    toolbar: {
      show: false
    }
  },

  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '40%',
      borderRadius: 2
    }
  },

  legend: {
    show: true,
    position: 'bottom',
    markers: {
      size: 5,
      shape: 'circle'
    }
  },

  dataLabels: {
    enabled: false
  },
  fill: {
    opacity: 1,
  },
  grid: {
    borderColor: '#ffffff',
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: false
      }
    }
  },

  colors: [
    "var(--color-primary)",
    "var(--color-success)"
  ],

  xaxis: {
    categories: [
      'IT & Dev',
      'Marketing',
      'Operations',
      'Finance',
      'Sales',
      'Support Team',
      'HR'
    ],

    axisBorder: {
      show: true,
      color: '#c7cacd'
    },

    axisTicks: {
      show: true,
      borderType: 'solid',
      color: '#c7cacd',
      width: 6
    },

    labels: {
      rotate: -90
    }
  },
  stroke: {
    width: 3,
  },

  tooltip: {
    theme: "dark"
  }
};

// chart.render();
  var chart = new ApexCharts(document.querySelector("#employee-department"), options);
  chart.render();
  /* Employee By Department */

})();