// for NFTs Statistics
var options = {
    series: [{
      name: 'Price',
      type: 'line',
      data: [54, 64, 40, 50, 60, 80, 60, 70, 62, 50, 45, 40,]
    }, {
      name: 'Volume',
      type: 'area',
      data: [55, 44, 57, 44, 50, 50, 65, 45, 32, 50, 60, 32,]
    }],
    chart: {
      height: 320,
      type: 'line',
      stacked: false,
      toolbar: {
        show: false
      },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 4,
        blur: 4,
        color: "var(--primary01)",
        opacity: 0,
      },
    },
    colors: ["var(--color-secondary)", "var(--color-primary)"],
    grid: {
      show: true,
      borderColor: 'rgba(119, 119, 142, 0.1)',
      strokeDashArray: 4,
    },
    stroke: {
      width: [2, 2],
      curve: "smooth",
      dashArray: [5,0]
    },
    plotOptions: {
      bar: {
        columnWidth: '25%',
        borderRadius: 5,
      }
    },
    fill: {
      type: ["solid","gradient"],
      gradient: {
        type:"vertical",
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "var(--color-primary)",
            opacity: 0.2
          },
          {
            offset: 20,
            color: "var(--color-primary)",
            opacity: 0.1
          },
          {
            offset: 60,
            color: "var(--color-primary)",
            opacity: 0
          },
          {
            offset: 100,
            color: "var(--color-primary)",
            opacity: 0
          }
        ]
      }
    },
    labels: [
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
      "Dec"
    ],
    markers: {
      size: 0,
    },
    legend: {
      show: true,
      position: 'top',
      fontFamily: "Montserrat",
      markers: {
        width: 10,
        height: 10,
      }
    },
    xaxis: {
      fontFamily: "Montserrat",
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
    yaxis: {
      min:10,
      title: {
        text: 'Growth',
        style: {
          color: '	#adb5be',
          fontSize: '14px',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          cssClass: 'apexcharts-yaxis-label',
        },
      },
      labels: {
        formatter: function (y) {
          return y.toFixed(0) + "";
        }
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== "undefined") {
            return y.toFixed(0) + " Hours";
          }
          return y;

        }
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#nft-statistics"), options);
  chart.render();
// for NFTs Statistics


/* for trending-creator1 */
var spark1 = {
    chart: {
        type: 'line',
        height: 23,
        width: 80,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.05
        }
    },
    tooltip: {
        enabled: false
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        gradient: {
            enabled: false
        }
    },
    series: [{
        name: 'Value',
        data: [54, 38, 56, 24, 65,45,34,56]
    }],
    yaxis: {
        min: 0,
        show: false
    },
    xaxis: {
        show: false,
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
    },
    colors: ['var(--color-primary)'],

}
var spark1 = new ApexCharts(document.querySelector("#trending-creator1"), spark1);
spark1.render();
/* for trending-creator1 */

/* for trending-creator2 */
var spark2 = {
    chart: {
        type: 'line',
        height: 23,
        width: 80,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.05
        }
    },
    tooltip: {
        enabled: false
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        gradient: {
            enabled: false
        }
    },
    series: [{
        name: 'Value',
        data: [54, 38,45,34,56,56, 24, 65]
    }],
    yaxis: {
        min: 0,
        show: false
    },
    xaxis: {
        show: false,
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
    },
    colors: ['var(--color-secondary)'],

}
var spark2 = new ApexCharts(document.querySelector("#trending-creator2"), spark2);
spark2.render();
/* for trending-creator2 */

/* for trending-creator3 */
var spark3 = {
    chart: {
        type: 'line',
        height: 23,
        width: 80,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.05
        }
    },
    tooltip: {
        enabled: false
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        gradient: {
            enabled: false
        }
    },
    series: [{
        name: 'Value',
        data: [54, 38,56, 24, 65,45,34,56]
    }],
    yaxis: {
        min: 0,
        show: false
    },
    xaxis: {
        show: false,
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
    },
    colors: ['var(--color-success)'],

}
var spark3 = new ApexCharts(document.querySelector("#trending-creator3"), spark3);
spark3.render();
/* for trending-creator3 */

/* for trending-creator4 */
var spark4 = {
    chart: {
        type: 'line',
        height: 23,
        width: 80,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.05
        }
    },
    tooltip: {
        enabled: false
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        gradient: {
            enabled: false
        }
    },
    series: [{
        name: 'Value',
        data: [54, 65,45,34,56, 38,56, 24]
    }],
    yaxis: {
        min: 0,
        show: false
    },
    xaxis: {
        show: false,
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
    },
    colors: ['var(--color-warning)'],

}
var spark4 = new ApexCharts(document.querySelector("#trending-creator4"), spark4);
spark4.render();
/* for trending-creator4 */

/* for trending-creator5 */
var spark5 = {
    chart: {
        type: 'line',
        height: 23,
        width: 80,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.05
        }
    },
    tooltip: {
        enabled: false
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        gradient: {
            enabled: false
        }
    },
    series: [{
        name: 'Value',
        data: [54,56, 38,56, 24, 65,45,34]
    }],
    yaxis: {
        min: 0,
        show: false
    },
    xaxis: {
        show: false,
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
    },
    colors: ['var(--color-danger)'],

}
var spark5 = new ApexCharts(document.querySelector("#trending-creator5"), spark5);
spark5.render();
/* for trending-creator5 */

/* for trending-creator6 */
var spark6 = {
    chart: {
        type: 'line',
        height: 23,
        width: 80,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.05
        }
    },
    tooltip: {
        enabled: false
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        gradient: {
            enabled: false
        }
    },
    series: [{
        name: 'Value',
        data: [54, 38, 56, 24, 65,45,34,56]
    }],
    yaxis: {
        min: 0,
        show: false
    },
    xaxis: {
        show: false,
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
    },
    colors: ['var(--color-teal)'],

}
var spark5 = new ApexCharts(document.querySelector("#trending-creator6"), spark6);
spark5.render();
/* for trending-creator6 */


/* for trending-creator7 */
var spark6 = {
    chart: {
        type: 'line',
        height: 23,
        width: 80,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.05
        }
    },
    tooltip: {
        enabled: false
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        gradient: {
            enabled: false
        }
    },
    series: [{
        name: 'Value',
        data: [54, 38,45,34,56,56, 24, 65]
    }],
    yaxis: {
        min: 0,
        show: false
    },
    xaxis: {
        show: false,
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
    },
    colors: ['var(--color-orange)'],

}
var spark5 = new ApexCharts(document.querySelector("#trending-creator7"), spark6);
spark5.render();
/* for trending-creator7 */