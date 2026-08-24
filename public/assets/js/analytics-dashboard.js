(function () {
    'use strict';

    var options = {
        series: [
            {
                name: "Followers vs Sessions",
                type: "rangeBar",
                data: [
                    { x: "Jan", y: [2200, 4800] },
                    { x: "Feb", y: [2800, 5200] },
                    { x: "Mar", y: [3100, 5700] },
                    { x: "Apr", y: [2600, 4300] },
                    { x: "May", y: [3800, 6400] },
                    { x: "Jun", y: [4200, 6900] },
                    { x: "Jul", y: [3500, 6100] },
                    { x: "Aug", y: [4600, 7200] },
                    { x: "Sep", y: [3900, 6700] },
                    { x: "Oct", y: [5000, 7800] },
                    { x: "Nov", y: [4300, 7100] },
                    { x: "Dec", y: [5600, 8500] }
                ]
            },
            {
                name: "Viewers",
                type: "line",
                data: [
                    { x: "Jan", y: 3900 },
                    { x: "Feb", y: 4600 },
                    { x: "Mar", y: 5200 },
                    { x: "Apr", y: 3700 },
                    { x: "May", y: 5800 },
                    { x: "Jun", y: 6300 },
                    { x: "Jul", y: 5400 },
                    { x: "Aug", y: 6600 },
                    { x: "Sep", y: 6100 },
                    { x: "Oct", y: 7200 },
                    { x: "Nov", y: 6500 },
                    { x: "Dec", y: 7900 }
                ]
            }
        ],

        chart: {
            type: "rangeBar",
            height: 335,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            fontFamily: "Inter, sans-serif"
        },

        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "10%",
                borderRadius: 4,
                isDumbbell: true,
                dumbbellColors: [["var(--color-primary)", "var(--color-success)"]]
            }
        },

        colors: ["var(--color-primary)", "#f59e0b"],

        stroke: {
            width: [0, 3],
            curve: "smooth",
            dashArray: [0, 4],
            lineCap: "round"
        },

        markers: {
            size: [9, 5],
            strokeWidth: 2,
            strokeColors: "#ffffff",
            hover: {
                size: 7
            }
        },

        fill: {
            type: ["gradient", "solid"],
            gradient: {
                type: "vertical",
                gradientToColors: ["var(--color-success)"],
                shadeIntensity: 0.4,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },

        grid: {
            borderColor: "#eef1f6",
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            },
            padding: {
                top: -5,
                right: 15,
                bottom: 0,
                left: 10
            }
        },

        dataLabels: {
            enabled: false
        },

        legend: {
            show: false,
            position: "top",
            horizontalAlign: "right",
            fontSize: "12px",
            fontWeight: 500,
            labels: {
                colors: "#4b5563"
            },
            markers: {
                width: 8,
                height: 8,
                radius: 12
            },
            itemMargin: {
                horizontal: 10,
                vertical: 0
            }
        },

        xaxis: {
            type: "category",
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            labels: {
                style: {
                    colors: "#6b7280",
                    fontSize: "12px",
                    fontWeight: 500
                }
            }
        },

        yaxis: {
            min: 2000,
            max: 9000,
            tickAmount: 7,
            labels: {
                style: {
                    colors: "#6b7280",
                    fontSize: "11px",
                    fontWeight: 500
                },
                formatter: function (val) {
                    return (val / 1000).toFixed(0) + "K";
                }
            }
        },

        tooltip: {
            shared: true,
            intersect: false,
            theme: "light",
            y: {
                formatter: function (val) {
                    return val.toLocaleString();
                }
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#profitchart"), options);
    chart.render();

    /* daily-sales chart */
    var options = {
        series: [{
            name: 'Sales',
            data: [90, 130, 170, 135, 180, 260, 350]
        }],
        chart: {
            height: 265,
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
            sparkline: { enabled: false }
        },
        colors: ["var(--color-primary)"],
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.2,
                opacityTo: 0.6,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: [0],
            discrete: [{
                seriesIndex: 0,
                dataPointIndex: 6,
                fillColor: '#ffffff',
                strokeColor: 'var(--color-primary)',
                size: 6,
                strokeWidth: 3
            }]
        },
        grid: {
            show: true,
            borderColor: 'rgba(0,0,0,0.06)',
            strokeDashArray: 3,
            xaxis: {
                lines: { show: false }
            },
            yaxis: {
                lines: { show: true }
            },
            padding: {
                top: -20,
                right: 20,
                bottom: 0,
                left: 10
            }
        },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: {
                style: {
                    colors: '#8b909a',
                    fontSize: '12px'
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
            tooltip: { enabled: false }
        },
        yaxis: {
            min: 0,
            max: 360,
            tickAmount: 4,
            labels: {
                formatter: function (value) {
                    if (value === 0) return '';
                    return '' + value;
                },
                style: {
                    colors: '#8b909a',
                    fontSize: '12px'
                }
            }
        },
        annotations: {
            xaxis: [{
                x: 'Jul',
                strokeDashArray: 0,
                borderColor: 'rgba(0, 90, 80, 0.35)',
                label: {
                    borderColor: 'transparent',
                    style: {
                        color: 'transparent',
                        background: 'transparent'
                    }
                }
            }],
            points: [{
                x: 'Jul',
                y: 160,
                marker: {
                    size: 0
                },
                label: {
                    borderColor: 'rgba(0,0,0,0.04)',
                    borderWidth: 1,
                    offsetY: -55,
                    style: {
                        color: '#111827',
                        background: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: {
                            left: 10,
                            right: 10,
                            top: 6,
                            bottom: 6
                        }
                    },
                    text: 'July, 2026  $150K   +3.4%'
                }
            }]
        },
        tooltip: {
            enabled: true,
            theme: 'light',
            y: {
                formatter: function (value) {
                    return '' + value + 'K';
                }
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#daily-sales"), options);
    chart.render();


    /* Visitors By Device */
    var options = {
        series: [4289, 3565, 2964, 1573],
        labels: ["websit", "Facebook", "Instagram", "Twitter"],
        chart: {
            height: 220,
            type: 'donut',
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
            position: 'bottom',
            markers: {
                size: 4,
                shape: 'circle',
            },
        },
        stroke: {
            show: true,
            curve: 'smooth',
            lineCap: 'round',
            colors: "#fff",
            width: 0,
            dashArray: 0,
        },
        plotOptions: {
            pie: {
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
                            offsetY: -5
                        },
                        value: {
                            show: true,
                            fontSize: '22px',
                            color: undefined,
                            offsetY: 5,
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
        colors: ["var(--color-primary)", "var(--color-secondary)", "var(--color-warning)", "var(--color-success)"],
    };
    var chart = new ApexCharts(document.querySelector("#visitors-device"), options);
    chart.render();
    /* Visitors By Device */

    /* sessions by device */
    var options = {
        series: [
            {
                name: "Tablet",
                data: [[10, 35, 80]]
            },
            {
                name: "Mobile",
                data: [[22, 10, 80]]
            },
            {
                name: "Desktop",
                data: [[25, 25, 150]]
            },
        ],
        chart: {
            height: 250,
            type: "bubble",
            offsetY: -15,
            toolbar: { show: false },
            parentHeightOffset: 0,
            sparkline: {
                enabled: true
            }
        },
        grid: {
            show: false,
            padding: {
                top: -20,
                right: 0,
                bottom: -20,
                left: 0
            }
        },
        plotOptions: {
            bubble: {
                minBubbleRadius: 25,
                maxBubbleRadius: 120
            }
        },
        colors: ["var(--color-primary)", "var(--color-warning)", "var(--color-success)"],
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            fontSize: '13px',
            labels: {
                colors: '#959595',
            },
            markers: {
                size: 4,
            },
        },
        xaxis: {
            min: 0,
            max: 45,
            labels: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
        },
        yaxis: {
            min: 0,
            max: 45,
            labels: {
                show: false,
            },
        },
        tooltip: {
            enabled: true,
            theme: "dark",
        }
    };
    var chart1 = new ApexCharts(document.querySelector("#sessions-device"), options);
    chart1.render();

})();