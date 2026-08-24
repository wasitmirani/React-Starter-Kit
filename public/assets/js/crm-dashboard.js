const color =
    getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary-main")
        ?.trim() || "103,93,176";

const primaryColor = "#675db0";
const successRgb = "2,188,156";
const secondaryRgb = "66,159,213";
const warningRgb = "219,153,27";

(function () {
    "use strict";

    // Total Customers
    const customerEl = document.querySelector("#crm-total-customers");

    if (customerEl) {
        const options1 = {
            chart: {
                type: "bar",
                height: 75,
                width: 75,
                sparkline: {
                    enabled: true,
                },
                toolbar: {
                    show: false,
                },
            },
            series: [
                {
                    data: [8, 11, 15, 17, 10],
                },
            ],
            plotOptions: {
                bar: {
                    columnWidth: "60%",
                    borderRadius: 1,
                    distributed: true,
                },
            },
            colors: [
                `rgba(${color},0.1)`,
                `rgba(${color},0.1)`,
                primaryColor,
                `rgba(${color},0.1)`,
                `rgba(${color},0.1)`,
            ],
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
        };

        window.crmtotalCustomers = new ApexCharts(customerEl, options1);
        window.crmtotalCustomers.render();
    }

    // Total Deals
    const dealsEl = document.querySelector("#crm-total-deals");

    if (dealsEl) {
        const options2 = {
            chart: {
                type: "bar",
                height: 75,
                width: 75,
                sparkline: {
                    enabled: true,
                },
                toolbar: {
                    show: false,
                },
            },
            series: [
                {
                    data: [32, 63, 59, 45, 72],
                },
            ],
            plotOptions: {
                bar: {
                    columnWidth: "60%",
                    borderRadius: 1,
                    distributed: true,
                },
            },
            colors: [
                `rgba(${successRgb},0.1)`,
                `rgba(${successRgb},0.1)`,
                `rgba(${successRgb},1)`,
                `rgba(${successRgb},0.1)`,
                `rgba(${successRgb},0.1)`,
            ],
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
        };

        window.crmtotalDeals = new ApexCharts(dealsEl, options2);
        window.crmtotalDeals.render();
    }

    // Total Revenue
    const revenueEl = document.querySelector("#crm-total-revenue");

    if (revenueEl) {
        const options3 = {
            chart: {
                type: "bar",
                height: 75,
                width: 75,
                sparkline: {
                    enabled: true,
                },
                toolbar: {
                    show: false,
                },
            },
            series: [
                {
                    data: [8, 11, 15, 17, 10],
                },
            ],
            plotOptions: {
                bar: {
                    columnWidth: "60%",
                    borderRadius: 1,
                    distributed: true,
                },
            },
            colors: [
                `rgba(${secondaryRgb},0.1)`,
                `rgba(${secondaryRgb},1)`,
                `rgba(${secondaryRgb},0.1)`,
                `rgba(${secondaryRgb},0.1)`,
                `rgba(${secondaryRgb},0.1)`,
            ],
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
        };

        window.crmtotalRevenue = new ApexCharts(revenueEl, options3);
        window.crmtotalRevenue.render();
    }

    // Total Conversion
    const conversionEl = document.querySelector("#crm-total-conversion");

    if (conversionEl) {
        const options4 = {
            chart: {
                type: "bar",
                height: 75,
                width: 75,
                sparkline: {
                    enabled: true,
                },
                toolbar: {
                    show: false,
                },
            },
            series: [
                {
                    data: [8, 11, 15, 17, 10],
                },
            ],
            plotOptions: {
                bar: {
                    columnWidth: "60%",
                    borderRadius: 1,
                    distributed: true,
                },
            },
            colors: [
                `rgba(${warningRgb},0.1)`,
                `rgba(${warningRgb},0.1)`,
                `rgba(${warningRgb},0.1)`,
                `rgba(${warningRgb},1)`,
                `rgba(${warningRgb},0.1)`,
            ],
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
        };

        window.crmtotalConversion = new ApexCharts(conversionEl, options4);

        window.crmtotalConversion.render();
    }

       //Revenue Chart//
       var options = {
        series: [
            {
              name: 'Actual',
              data: [
                {
                  x: 'Jan',
                  y: 120,
                  goals: [
                    {
                      name: 'Expected',
                      value: 140,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Feb',
                  y: 150,
                  goals: [
                    {
                      name: 'Expected',
                      value: 160,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Jan',
                  y: 170,
                  goals: [
                    {
                      name: 'Expected',
                      value: 180,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Mar',
                  y: 120,
                  goals: [
                    {
                      name: 'Expected',
                      value: 140,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Apr',
                  y: 150,
                  goals: [
                    {
                      name: 'Expected',
                      value: 160,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'May',
                  y: 170,
                  goals: [
                    {
                      name: 'Expected',
                      value: 180,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Jun',
                  y: 140,
                  goals: [
                    {
                      name: 'Expected',
                      value: 150,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Jul',
                  y: 100,
                  goals: [
                    {
                      name: 'Expected',
                      value: 110,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Aug',
                  y: 110,
                  goals: [
                    {
                      name: 'Expected',
                      value: 120,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Sep',
                  y: 150,
                  goals: [
                    {
                      name: 'Expected',
                      value: 160,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Oct',
                  y: 120,
                  goals: [
                    {
                      name: 'Expected',
                      value: 130,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Nov',
                  y: 90,
                  goals: [
                    {
                      name: 'Expected',
                      value: 100,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                },
                {
                  x: 'Dec',
                  y: 180,
                  goals: [
                    {
                      name: 'Expected',
                      value: 190,
                      strokeHeight: 3,
                      strokeLineCap: 'round',
                      strokeColor: 'var(--color-primary)'
                    }
                  ]
                }
              ]
            }
        ],
        chart: {
            height: 343,
            type: 'bar'
        },
        plotOptions: {
            bar: {
                columnWidth: "40%",
                borderRadius: 2,
                borderRadiusApplication: "end",
                borderRadiusWhenStacked: "last"
            }
        },
        colors: [`rgba(${color},0.3)`],
        dataLabels: {
            enabled:false,
        },
        legend: {
            show: true,
            position: 'top',
            showForSingleSeries: true,
            customLegendItems: ['Actual', 'Expected'],
            markers: {
              fillColors: [`rgba(${color},0.3)`, 'var(--color-primary)']
            }
        },
    };
    var chart = new ApexCharts(document.querySelector("#crmRevenueChart"), options);
    chart.render();
    //Revenue Chart//

        //leads Sources//
        var options = {
            series: [18235, 12743, 8369, 16458],
            labels: ["Mobile", "Desktop", "Laptop", "Tablet"],
            chart: {
              height: 310,
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
              width: 0,
              dashArray: 0,
            },
            stroke: {
              width: 2,
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
                      fontFamily: "Montserrat, sans-serif",
                      offsetY: -45
                    },
                    value: {
                      show: true,
                      fontSize: '22px',
                      color: undefined,
                      offsetY: -35,
                      fontWeight: 600,
                      fontFamily: "Montserrat, sans-serif",
                      formatter: function (val) {
                        return val + "%"
                      }
                    },
                    total: {
                      show: true,
                      showAlways: true,
                      label: 'Total Visitors',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#495057',
                    }
                  }
                }
              }
            },
            grid: {
              enabled:false,
              show: false,
              padding: {
                bottom: -160
              }
            },
            colors: ["var(--color-primary)", "var(--color-secondary)", "var(--color-success)", "var(--color-warning)"],
          };
          var chart = new ApexCharts(document.querySelector("#leads-sources"), options);
          chart.render();
          //leads Sources//


})();
