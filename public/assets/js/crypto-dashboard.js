
(function () {
  "use strict";

  /* Crypto chart*/
  var ts2 = 1484418600000;
  var dates = [];
  var spikes = [5, -5, 3, -3, 8, -8]
  for (var i = 0; i < 120; i++) {
      ts2 = ts2 + 86400000;
      var innerArr = [ts2, dataSeries[1][i].value];
      dates.push(innerArr)
  }
  var options = {
      series: [{
          name: 'BTC',
          data: dates
      }],
      chart: {
          type: 'area',
          stacked: false,
          height: 340,
          zoom: {
              type: 'x',
              enabled: true,
              autoScaleYaxis: true
          },
          toolbar: {
            show: false,
          }
      },
      dataLabels: {
          enabled: false
      },
      markers: {
          size: 0,
      },
      stroke: {
          width: 2,
      },
      fill: {
          type: 'gradient',
          gradient: {
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.5,
              opacityTo: 0,
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
              ]
          },
      },
      grid: {
          borderColor: '#f2f5f7',
          strokeDashArray: 4,
      },
      colors: ["var(--color-primary)"],
      yaxis: {
          min:0,
          labels: {
              formatter: function (val) {
                  return (val / 1000000).toFixed(0);
              },
              show: true,
              style: {
                  colors: "#8c9097",
                  fontSize: '11px',
                  fontWeight: 600,
                  cssClass: 'apexcharts-yaxis-label',
              },
          },

      },
      xaxis: {
          type: 'datetime',
          labels: {
              show: true,
              style: {
                  colors: "#8c9097",
                  fontSize: '11px',
                  fontWeight: 600,
                  cssClass: 'apexcharts-xaxis-label',
              },
          },
      },
      tooltip: {
          shared: false,
          y: {
              formatter: function (val) {
                  return (val / 1000000).toFixed(0)
              }
          }
      }
  };
  var chart = new ApexCharts(document.querySelector("#crypto-chart"), options);
  chart.render();

  /* Crypto donut chart */
  var options = {
    series: [44, 55, 41, 17, 15],
    chart: {
      height: 200,
      type: "donut",
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
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
                          label: 'Total Assets',
                          fontSize: '14px',
                          fontFamily:  "'Google Sans', sans-serif",
                          fontWeight: 500,
                          color: '#495057',
                      }
                  }
              }
      },
    },
    dataLabels: {
      enabled: false,
    },
    // fill: {
    //   type: "gradient",
    // },
    legend: {
      formatter: function (val, opts) {
        return val + " - " + opts.w.globals.series[opts.seriesIndex];
      },
    },
    colors: ["var(--color-primary)","var(--color-secondary)", "var(--color-success)","var(--color-warning)", "var(--color-light)"],
    labels: ["Bitcoin", "Ethereum", "Litecoin", "Dash", "Tether"],
    title: {
      // text: "Gradient Donut with custom Start-angle",
      align: "left",
      style: {
        fontSize: "13px",
        fontWeight: "bold",
        color: "#8c9097",
      },
    },
    legend: {
      show: false,
      position: "bottom",
        markers: {
            size: 4,
            strokeWidth: 0,
            strokeColor: '#fff',
            fillColors: undefined,
            radius: 12,
            customHTML: undefined,
            onClick: undefined,
            offsetX: 0,
            offsetY: 0
        },
    },
  };
  var chart = new ApexCharts(document.querySelector("#crypto-donut"), options);
  chart.render();
  
})();