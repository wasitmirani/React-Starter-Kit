const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-main').trim();
(function () {
    'use strict';

    /* Sales Revenue */
    var options2 = {
        series: [
            {
                name: 'Orders',
                data: [136, 150, 158, 115, 102, 156, 135, 151, 125, 68, 164, 163],
                type: 'column',
            }, 
            {
                name: 'Sales',
                data: [99, 15, 36, 63, 42, 105, 78, 51, 32, 62, 76, 32],
                type: 'column',
            }, 
            {
                name: 'Profit',
                data: [128, 148, 39, 152, 169, 129, 112, 148, 150, 117, 198, 120],
                type: 'line',
            }
        ],
        chart: {
            height: 412,
            type: 'line',
            stacked: true,
            toolbar: {
                show: false,
            },
            background: 'none',
            fill: "#fff",
        },
        plotOptions: {
            bar: {
            horizontal: false,
            columnWidth: "27%",
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
        fill: {
            opacity: 1,
        },
        colors: ["var(--color-primary)", "var(--color-success)", `rgba(${color},0.3)`],
        background: 'transparent',
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: [4, 4, 2],
            dashArray: [0, 0, 6]
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: true,
            position: 'top',
            markers: {
                width: 8,
                height: 8,
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            show: false,
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
            }
        },
        yaxis: {
            show: false,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            }
        },
    };
    var chart4 = new ApexCharts(document.querySelector("#sale-stats"), options2);
    chart4.render();
    /* Sales Revenue */
    
    /* Top Categories */
    var options = {
        series: [46000, 28500, 24500, 19600],
        labels: ["Mobile", "Desktop", "Tablet", "Others"],
        chart: {
            height: 250,
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
            width: 3,
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
        colors: ["var(--color-primary)", "var(--color-success)", "var(--color-secondary)", "var(--color-warning)"],
    };
    var chart = new ApexCharts(document.querySelector("#top-categories"), options);
    chart.render();
    /* Top Categories */

    /* conversions chart */
    var options = {
        chart: {
            type: 'radialBar',
            height: 238,
            sparkline: {
                enabled: true
            }
        },
    
        series: [65.2],
    
        colors: ['var(--color-primary)'],
    
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
    
                hollow: {
                    size: '58%',
                },
    
                track: {
                    background: 'rgba(var(--light-rgb), 1)',
                    strokeWidth: '100%',
                    margin: 10
                },
    
                dataLabels: {
                    show: false
                }
            }
        },
        fill: {
            opacity: 1,
        },
    
        stroke: {
            lineCap: 'round',
            // dashArray: 6
        }
    };
    var chart = new ApexCharts(document.querySelector("#conversionChart"), options);
    chart.render();
    /* conversions chart */
})();

/* Visitors By Country Map */
var markers = [
    {
        name: "USA",
        coords: [40.3, -101.38],
    },
    {
        name: 'Greenland',
        coords: [72, -42],
    },
    {
        name: "Mauritius",
        coords: [-20.2, 57.5],
    }, 
        {
        name: "India",
        coords: [20.5937, 78.9629],
    }, 
    {
        name: "Vatican City",
        coords: [41.9, 12.45],
    },  
    {
        name: "Russia",
        coords: [61.5240, 105.3188],
    },
    {
        name: "Singapore",
        coords: [1.3, 103.8],
    },
    {
        name: 'Brazil',
        coords: [-14.2350, -51.9253],
        style: {
            fill: '#000'
        }
    },
];
var map = new jsVectorMap({
    map: "world_merc",
    selector: "#visitors-countries",
    markersSelectable: true,
    zoomOnScroll: false,
    zoomButtons: false,

    onMarkerSelected(index, isSelected, selectedMarkers) {
        console.log(index, isSelected, selectedMarkers);
    },

    // -------- Labels --------//
    labels: {
        markers: {
            render: function (marker) {
                return marker.name;
            },
        },
    },

    regionStyle: {
        initial: {
            fill: `rgba(${color},0.1)`,
        },
    },

    // -------- Marker and label style --------//
    markers: markers,
    markerStyle: {
        hover: {
            stroke: "var(--color-primary)",
            strokeWidth: 0,
            fill: "#FFF",
        },
        selected: {
            fill: "var(--color-success)",
        },
    },
    markerLabelStyle: {
        initial: {
            fontFamily: "Poppins",
            fontSize: 13,
            fontWeight: 500,
            fill: "var(--color-success)",
        },
    },
});
/* Visitors By Country Map */