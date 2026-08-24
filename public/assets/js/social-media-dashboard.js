const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-main').trim();
(function () {
    "use strict";
    
    /*  Profile Visits chart */
    var options = {
        series: [
            {
                name: "Facebook",
                data: [45, 30, 49, 45, 36, 42, 30, 35, 35, 54, 29, 36],
                // data: [45, 30, 49, 45, 36, 42, 30],
            },
            {
                name: "Instagram",
                data: [30, 35, 35, 30, 45, 25, 36, 54, 36, 29, 49, 42],
                // data: [30, 35, 35, 30, 45, 25, 36],
            },
            {
                name: "Twitter",
                data: [45, 30, 49, 30, 45, 25, 36, 54, 36, 29, 49, 42],
                // data: [45, 30, 49, 30, 45, 25, 36],
            },
        ],
        chart: {
            type: "bar",
            height: 300,
            toolbar: {
                show: false,
            },
            dropShadow: {
                enabled: false,
            },
            stacked: true,
        },
        plotOptions: {
            bar: {
                columnWidth: "30%",
                borderRadiusApplication: "around",
                borderRadiusWhenStacked: "all",
                borderRadius: 3,
            },
        },
        responsive: [
            {
                breakpoint: 500,
                options: {
                    plotOptions: {
                        bar: {
                            columnWidth: "60%",
                        },
                    },
                },
            },
        ],
        fill: {
            opacity: 1,
          },
        stroke: {
            show: true,
            curve: "smooth",
            lineCap: "butt",
            width: [5, 5, 5],
            dashArray: 0,
        },
        grid: {
            borderColor: "#f5f4f4",
            strokeDashArray: 5,
            yaxis: {
                lines: {
                    show: true, 
                },
            },
        },
        colors: ["var(--color-primary)", `rgba(${color},0.5)`, `rgba(${color},0.3)`],
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
            position: "top",
            markers: {
                size: 4,
                strokeWidth: 0,
                strokeColor: '#fff',
                fillColors: undefined,
                radius: 5,
                customHTML: undefined,
                onClick: undefined,
                offsetX: 0,
                offsetY: 0
              },
        },
        yaxis: {
            title: {
                style: {
                    color: "#adb5be",
                    fontSize: "14px",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    cssClass: "apexcharts-yaxis-label",
                },
            },
            axisBorder: {
                show: true,
                color: "rgba(119, 119, 142, 0.05)",
                offsetX: 0,
                offsetY: 0,
            },
            axisTicks: {
                show: true,
                borderType: "solid",
                color: "rgba(119, 119, 142, 0.05)",
                width: 6,
                offsetX: 0,
                offsetY: 0,
            },
            labels: {
                formatter: function (y) {
                    return y.toFixed(0) + "";
                },
            },
        },
        xaxis: {
            type: "month",
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "sep",
                "oct",
                "nov",
                "dec",
            ],
            axisBorder: {
                show: false,
                color: "rgba(119, 119, 142, 0.05)",
                offsetX: 0,
                offsetY: 0,
            },
            axisTicks: {
                show: false,
                borderType: "solid",
                color: "rgba(119, 119, 142, 0.05)",
                width: 6,
                offsetX: 0,
                offsetY: 0,
            },
            labels: {
                rotate: -90,
            },
        },
    };
    var chart = new ApexCharts(document.querySelector("#profile-visits"), options);
    chart.render();
    /*  Profile Visits chart */

    /* Audience Reached Charts */
    var options = {
        series: [1200, 750],
        labels: ["Female", "Male"],
        chart: {
            height: 280,
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
            width: 2,
            dashArray: 0,
        },
        grid: {
            padding: {
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
            }
        },
        fill: {
            opacity: 1,
          },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '82%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '20px',
                            color: '#495057',
                            fontFamily: "Montserrat, sans-serif",
                            offsetY: 0
                        },
                        value: {
                            show: true,
                            fontSize: '22px',
                            color: undefined,
                            offsetY: 10,
                            fontWeight: 600,
                            fontFamily: "Montserrat, sans-serif",
                            formatter: function (val) {
                                return val + "%"
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Audience',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#495057',
                            formatter: function (w) {
                                return 1950
                            }
                        }
                    }
                }
            }
        },

        colors: ["var(--color-primary)", "var(--color-success)"],

    };
    var chart = new ApexCharts(document.querySelector("#audience-reached"), options);
    chart.render();

    /* Visitors-map */
    var markers = [
        { name: 'Russia', coords: [61.5240, 105.3188] },
        { name: 'Egypt', coords: [26.8206, 30.8025] },
        { name: 'Greenland', coords: [71.7069, -42.6043], offsets: [2, 10] },
        { name: 'Canada', coords: [56, -106], offsets: [-7, 12] },
    ]

    var lines = [
        { from: 'Russia', to: 'Egypt', style: { stroke: '#abb0b7', strokeWidth: 1.5 } },
        { from: 'Canada', to: 'Russia', style: { stroke: '#abb0b7', strokeWidth: 1.5 } },
    ]

    new jsVectorMap({
        map: 'world_merc',
        selector: document.querySelector('#visitors-map'),
        // -------- Labels --------
        labels: {
            markers: {
                render: function (marker) {
                    return marker.name
                },
                offsets: function (index) {
                    return markers[index].offsets || [0, 0]
                }
            },
        },
        // -------- Marker and label style --------
        markers: markers,
        lines: lines,
        lineStyle: {
            animation: true,
            strokeDasharray: "6 3 6",
        },
        markerStyle: {
            initial: {
                r: 6,
                fill: 'var(--color-primary)',
                stroke: '#fff',
                strokeWidth: 3,
            }
        },
        markerLabelStyle: {
            initial: {
                fontSize: 13,
                fontWeight: 500,
                fill: '#35373e',
            },
        },
    })
    /* Visitors-map */

})()