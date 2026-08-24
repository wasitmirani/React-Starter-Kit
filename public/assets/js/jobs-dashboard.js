const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-main').trim();
(function () {
    "use strict";
  
    /* vacancyOverview Chart */
    var options = {
      series: [{
          name: "Applications",
          data: [75, 78, 38, 39, 38, 73, 73, 53, 53, 16, 16, 53]
      },
      {
          name: "Shotlisted",
          data: [35, 35, 62, 63, 13, 13, 60, 60, 41, 41, 82, 82]
      }
      ],
      chart: {
        toolbar: {
            show: false
        },
        height: 370,
        type: 'line',
        zoom: {
            enabled: false
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 5,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.15
        },
        animations: {
          enabled: true,
          easing: 'linear',
          speed: 1200,
          animateGradually: {
            enabled: true,
            delay: 120
          },
          dynamicAnimation: {
            enabled: true,
            speed: 800
          }
        }
      },
      grid: {
        show: true,
        borderColor: 'rgba(244, 246, 250, 0.9)',
  
        xaxis: {
            lines: {
                show: true
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
        column: {
            colors: [
                'rgba(244, 246, 250, 0.9)',
                'rgba(255, 255, 255, 0)'
            ],
            opacity: 1
        }
      },
      dataLabels: {
          enabled: false
      },
      stroke: {
          width: [2, 2],
          curve: ['smooth', 'smooth'],
          lineCap: 'butt',
          dashArray: [0, 0]
      },
      title: {
          text: undefined,
      },
      fill: {
        opacity: 1,
      },
      legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'center',
          fontWeight: 600,
          fontSize: '11px',
          tooltipHoverFormatter: function (val, opts) {
              return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
          },
          labels: {
              colors: '#74767c',
          },
          markers: {
              size:5,
              strokeWidth: 0,
              radius: 12,
              offsetX: 0,
              offsetY: 0
          },
      },
      markers: {
          discrete: [{
              seriesIndex: 0,
              dataPointIndex: 5,
              fillColor: 'var(--color-primary)',
              strokeColor: '#fff',
              size: 4,
              shape: "circle"
          },
          {
              seriesIndex: 0,
              dataPointIndex: 11,
              fillColor: 'var(--color-primary)',
              strokeColor: '#fff',
              size: 4,
              shape: "circle"
          },
          {
              seriesIndex: 1,
              dataPointIndex: 10,
              fillColor: 'var(--color-success)',
              strokeColor: '#fff',
              size: 4,
              shape: "circle"
          }, {
              seriesIndex: 1,
              dataPointIndex: 4,
              fillColor: 'var(--color-success)',
              strokeColor: '#fff',
              size: 4,
              shape: "circle"
          }],
          hover: {
              sizeOffset: 6
          }
      },
      yaxis: {
          title: {
              style: {
                  color: '#adb5be',
                  fontSize: '14px',
                  fontFamily: 'poppins, sans-serif',
                  fontWeight: 600,
                  cssClass: 'apexcharts-yaxis-label',
              },
          },
          labels: {
              formatter: function (y) {
                  return y.toFixed(0) + "";
              },
              show: true,
              style: {
                  colors: "#8c9097",
                  fontSize: '11px',
                  fontWeight: 600,
                  cssClass: 'apexcharts-xaxis-label',
              },
          }
      },
      xaxis: {
          type: 'day',
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          axisBorder: {
              show: false,
              color: 'rgba(119, 119, 142, 0.05)',
              offsetX: 0,
              offsetY: 0,
          },
          axisTicks: {
              show: false,
              borderType: 'solid',
              color: 'rgba(119, 119, 142, 0.05)',
              width: 6,
              offsetX: 0,
              offsetY: 0
          },
          labels: {
              rotate: -90,
              style: {
                  colors: "#8c9097",
                  fontSize: '11px',
                  fontWeight: 600,
                  cssClass: 'apexcharts-xaxis-label',
              },
          }
      },
      tooltip: {
          y: [
              {
                  title: {
                      formatter: function (val) {
                          return val
                      }
                  }
              },
              {
                  title: {
                      formatter: function (val) {
                          return val
                      }
                  }
              },
              {
                  title: {
                      formatter: function (val) {
                          return val;
                      }
                  }
              }
          ]
      },
      colors: ["var(--color-primary)", "var(--color-success)"],
    };
    document.querySelector("#vacancyOverview").innerHTML = " ";
    var chart1 = new ApexCharts(document.querySelector("#vacancyOverview"), options);
    chart1.render();
    /* vacancyOverview Chart */
  
    /*candidate Start*/
    const candidateoptions = {
      chart: {
        type: "bar",
        height: 300,
        // stacked: true,
        toolbar: {
          show: false
        },
      },
      series: [
        {
          name: "Men",
          data: [8, 11, 15, 17, 10, 16, 14]
        },
        {
          name: "Women",
          data: [10, 8, 6, 18, 15, 10, 7]
        },
      ],
      plotOptions: {
        bar: {
          columnWidth: "30%",
          borderRadius: 5,
          // distributed: true,
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "last"
        }
      },
      colors: [`rgba(${color},0.2)`,"var(--color-primary)"],
      dataLabels: {enabled: false},
      grid: { borderColor: 'rgba(167, 180, 201 ,0.2)', strokeDashArray: 3, xaxis: { lines: { show: false } } },
      xaxis: {
        categories: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "12px",
            fontWeight: 500
          }
        }
      },
  
      yaxis: {
        show: true,
        min: 0,
        max: 18,
        stepSize:6
      },

      fill: {
        opacity: 1,
      },
  
      legend: {
        show: false
      },
  
      tooltip: {
        enabled: true,
      }
    };
    document.getElementById('candidate').innerHTML = '';
    var candidatechart = new ApexCharts(document.querySelector("#candidate"), candidateoptions);
    candidatechart.render();
    /*candidate End*/
    
    /* Recent Jobs Scroll */
    var myElement1 = document.getElementById('recent-activity-list');
    new SimpleBar(myElement1, { autoHide: true });
    /* Recent Jobs Scroll */
  
  })();