const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-main').trim();
(function () {
    "use strict";


    /* Total Students */
    var options = {
        series: [
            {
                data: [59, 28, 73, 22, 73, 38, 59],
            },
        ],
        chart: {
            type: "line",
            width: 85,
            height: 40,
            sparkline: {
                enabled: true,
            },
        },
        stroke: {
            curve: 'smooth',
            width: [1.5]
        },
        colors: ["var(--color-primary)"],
        xaxis: {
            crosshairs: {
                width: 1,
            },
        },
        tooltip: {
            fixed: {
                enabled: false,
            },
            x: {
                show: false,
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return "";
                    },
                },
            },
            marker: {
                show: false,
            },
        },
    };
    var chart = new ApexCharts(document.querySelector("#total-students"), options);
    chart.render();
    /* Total Students */

    /* Total Teachers */
    var options = {
        series: [
            {
                data: [59, 28, 73, 22, 73, 38, 59],
            },
        ],
        chart: {
            type: "line",
            width: 80,
            height: 30,
            sparkline: {
                enabled: true,
            },
        },
        stroke: {
            curve: 'smooth',
            width: [1.5]
        },
        colors: ["var(--color-success)"],
        xaxis: {
            crosshairs: {
                width: 1,
            },
        },
        tooltip: {
            fixed: {
                enabled: false,
            },
            x: {
                show: false,
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return "";
                    },
                },
            },
            marker: {
                show: false,
            },
        },
    };
    var chart = new ApexCharts(document.querySelector("#total-teachers"), options);
    chart.render();
    /* Total Teachers */

    /* Total Awards */
    var options = {
        series: [
            {
                data: [59, 28, 73, 22, 73, 38, 59],
            },
        ],
        chart: {
            type: "line",
            width: 80,
            height: 30,
            sparkline: {
                enabled: true,
            },
        },
        stroke: {
            curve: 'smooth',
            width: [1.5]
        },
        colors: ["var(--color-secondary)"],
        xaxis: {
            crosshairs: {
                width: 1,
            },
        },
        tooltip: {
            fixed: {
                enabled: false,
            },
            x: {
                show: false,
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return "";
                    },
                },
            },
            marker: {
                show: false,
            },
        },
    };
    var chart = new ApexCharts(document.querySelector("#total-awards"), options);
    chart.render();
    /* Total Awards */

    /* Earning */
    var options = {
        series: [
            {
                data: [59, 28, 73, 22, 73, 38, 59],
            },
        ],
        chart: {
            type: "line",
            width: 80,
            height: 30,
            sparkline: {
                enabled: true,
            },
        },
        stroke: {
            curve: 'smooth',
            width: [1.5]
        },
        colors: ["var(--color-warning)"],
        xaxis: {
            crosshairs: {
                width: 1,
            },
        },
        tooltip: {
            fixed: {
                enabled: false,
            },
            x: {
                show: false,
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return "";
                    },
                },
            },
            marker: {
                show: false,
            },
        },
    };
    var chart = new ApexCharts(document.querySelector("#earning"), options);
    chart.render();
    /* Earning */

    /* School Revenue */
    var options = {

        series: [
            {
                name: 'Total Fees',
                type: 'bar',
                data: [80200, 54000, 65000, 61500, 73000, 68800, 76700, 73600, 83400, 78900, 75200, 87800]
            },
            {
                name: 'Pending Fees',
                type: 'bar',
                data: [9200, 12000, 14000, 13500, 11000, 9800, 8700, 9600, 7400, 6900, 6200, 5800]
            },
            {
                name: 'Collected Fees',
                type: 'bar',
                data: [71000, 42000, 51000, 48000, 62000, 59000, 68000, 64000, 76000, 72000, 69000, 82000]
            },
        ],

        chart: {
            height: 323,
            stacked: true,
            toolbar: {
                show: false
            }
        },

        colors: [
            'var(--color-primary)',
            `rgba(${color},0.2)`,
            'var(--color-success)',
        ],

        stroke: {
            curve: 'smooth',
            width: [3, 3, 3]
        },

        fill: {
            opacity: 1,
        },

        plotOptions: {
            distributed: false,
            bar: {
                borderRadius: 5,
                columnWidth: '25%'
            }
        },

        dataLabels: {
            enabled: false
        },

        grid: {
            borderColor: '#eef2f7',
            strokeDashArray: 4
        },

        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            markers: {
                width: 8,
                size: 5,
                height: 8,
                radius: 12
            }
        },

        xaxis: {
            categories: [
                'Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec'
            ],

            axisBorder: {
                show: false
            },

            axisTicks: {
                show: false
            },

            labels: {
                style: {
                    colors: '#94a3b8'
                }
            }
        },

        yaxis: {
            tickcount: 4,
            labels: {
                formatter: function(val) {
                    return '$' + (val / 1000).toFixed(0) + 'k';
                },

                style: {
                    colors: '#94a3b8'
                }
            }
        },

        tooltip: {
            theme: 'light',
            y: {
                formatter: function(val) {
                    return '$' + val.toLocaleString();
                }
            }
        }

    };

    var chart = new ApexCharts(document.querySelector("#school-revenue"), options);
        chart.render();
    /* School Revenue */

    /* Overall Attendance */
    
    var sourceOptions = {

        series: [90,75,85],

        chart: {
            type: 'radialBar',
            height: 300
        },
        stroke: {
            lineCap: 'round',
        },

        plotOptions: {
            radialBar: {
                hollow: {
                    size: '50%'
                },
                track: {
                    background: '#edf2f7',
                    margin: 11
                },
                dataLabels: {
                    fill: 'var(--color-light)',
                    name: {
                        show: true, 
                        fontSize: '16px',
                        offsetY: -10
                    },
                    value: {
                        show: true,
                        fontSize: '22px',
                        fontWeight: 700,
                        offsetY: 5,
                        formatter: function (val) {
                            return val + "%" 
                        }
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: function (w) {
                            return w.config.series.reduce((a, b) => a + b, 0)
                        }
                    }
                }
            }
        },

        fill: {
            opacity: 1,
        },

        colors: ['var(--color-primary)',`rgba(${color},0.7)`,`rgba(${color},0.3)`],

        labels: ['Girls','Boys','Staff']

    };

    new ApexCharts(document.querySelector("#overall-attendance"), sourceOptions).render();

    /* Overall Attendance */

    /* Student Performance */
    var options = {
        series: [
            {
                name: "Girls",
                data: [86,50, 83, 44, 44, 57, 88],
            },
            {
                type: "line",
                name: "Boys",
                data: [21, 56, 34, 34, 55, 37, 56],
            },
        ],
        chart: {
            // stacked: true,
            type: "area",
            height: 317,
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: "smooth",
            width: 2,
            dashArray: [ 0, 5],
        },
        fill: {
            type:["gradient", "solid"],
            opacity: 1,
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
                            opacity: 0.02
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
                            color: "var(--color-success)",
                            opacity: 0.15
                        },
                        {
                            offset: 75,
                            color: "var(--color-success)",
                            opacity: 0.08
                        },
                        {
                            offset: 100,
                            color: 'var(--color-success)',
                            opacity: 0.02
                        }
                    ],
                ]
            },
        },
        grid: {
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
        colors: ["var(--color-primary)", "var(--color-success) "],
        plotOptions: {
            bar: {
                borderRadius: 2,
                borderRadiusApplication: "end",
                borderRadiusWhenStacked: "all",
                columnWidth: "25%",
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: true,
            position: "top",
            fontFamily: "Mulish",
            markers: {
                width: 10,
                height: 10,
            },
        },
        xaxis: {
            type: "month",
            categories: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                rotate: -90,
            },
        },
    };
    var chart = new ApexCharts(document.querySelector("#student-performance"), options);
    chart.render();
    /* Student Performance */

})();