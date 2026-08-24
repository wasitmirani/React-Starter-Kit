(function () {
    "use strict";

    /* Task Activity */
    var options = {
        series: [44, 55, 67, 83],
        chart: { 
            height: 310, 
            type: "radialBar" 
        },
        plotOptions: {
            circle: { dataLabels: { showOn: "hover" } },
            radialBar: {
                track: { 
                    margin: 13, 
                    background: "rgba(244, 246, 250)" 
                },
                hollow: { 
                    size: "25%",
                },
                dataLabels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '20px',
                        color: '#495057',
                        offsetY: -5,
                        fontFamily: "Google Sans, sans-serif",
                    },
                    value: {
                        show: true,
                        fontSize: '22px',
                        color: undefined,
                        offsetY: 5,
                        fontWeight: 600,
                        fontFamily: "Google Sans, sans-serif",
                    },
                    total: {
                        show: true,
                        showAlways: true,
                        label: 'Total',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#495057',
                        fontFamily: "Google Sans, sans-serif",
                    }
                }
            }
        },
        stroke: {
            lineCap: "round",
        },
        colors: ["var(--color-primary)","var(--color-success)" , "var(--color-warning)", "var(--color-secondary)" ],
        labels: ['On-Going', 'Completed', 'Todo-Tasks', 'Pending'],
    };
    var chart = new ApexCharts(document.querySelector("#task-activity"), options);
    chart.render();
    /* Task Activity */

    /* Projects Overview */
    var options4 = {
        series: [
            {
                type: "bar",
                name: "Projects",
                data: [
                    {
                        x: "Jan",
                        y: 320,
                    },
                    {
                        x: "Feb",
                        y: 400,
                    },
                    {
                        x: "Mar",
                        y: 250,
                    },
                    {
                        x: "Apr",
                        y: 360,
                    },
                    {
                        x: "May",
                        y: 420,
                    },
                    {
                        x: "Jun",
                        y: 560,
                    },
                    {
                        x: "Jul",
                        y: 580,
                    },
                    {
                        x: "Aug",
                        y: 620,
                    },
                    {
                        x: "Sep",
                        y: 680,
                    },
                    {
                        x: "Oct",
                        y: 710,
                    },
                    {
                        x: "Nov",
                        y: 760,
                    },
                    {
                        x: "Dec",
                        y: 800,
                    },
                ],
            },
            {
                type: "area",
                name: "Revenue",
                data: [
                    {
                        x: "Jan",
                        y: 580,
                    },
                    {
                        x: "Feb",
                        y: 700,
                    },
                    {
                        x: "Mar",
                        y: 580,
                    },
                    {
                        x: "Apr",
                        y: 740,
                    },
                    {
                        x: "May",
                        y: 880,
                    },
                    {
                        x: "Jun",
                        y: 720,
                    },
                    {
                        x: "Jul",
                        y: 900,
                    },
                    {
                        x: "Aug",
                        y: 1000,
                    },
                    {
                        x: "Sep",
                        y: 850,
                    },
                    {
                        x: "Oct",
                        y: 950,
                    },
                    {
                        x: "Nov",
                        y: 850,
                    },
                    {
                        x: "Dec",
                        y: 960,
                    },
                ],
            },
            {
                type: "bar",
                name: "Tasks",
                chart: {
                    dropShadow: {
                        enabled: true,
                        enabledOnSeries: undefined,
                        top: 5,
                        left: 0,
                        blur: 3,
                        color: "#000",
                        opacity: 0.1,
                    },
                },
                data: [
                    {
                        x: "Jan",
                        y: 180,
                    },
                    {
                        x: "Feb",
                        y: 250,
                    },
                    {
                        x: "Mar",
                        y: 180,
                    },
                    {
                        x: "Apr",
                        y: 250,
                    },
                    {
                        x: "May",
                        y: 300,
                    },
                    {
                        x: "Jun",
                        y: 360,
                    },
                    {
                        x: "Jul",
                        y: 380,
                    },
                    {
                        x: "Aug",
                        y: 420,
                    },
                    {
                        x: "Sep",
                        y: 480,
                    },
                    {
                        x: "Oct",
                        y: 560,
                    },
                    {
                        x: "Nov",
                        y: 580,
                    },
                    {
                        x: "Dec",
                        y: 600,
                    },
                ],
            },
        ],
        chart: {
            type: "area",
            height: 430,
            animations: {
                speed: 100
            },
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
            dropShadow: {
                enabled: true,
                enabledOnSeries: undefined,
                top: 6,
                left: 1,
                blur: 4,
                color: ['transparent', '#000', 'transparent'],
                opacity: 0.12
            },
        },
        colors: ["var(--color-primary)", "var(--color-secondary)", "var(--color-warning)"],
        dataLabels: {
            enabled: false,
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
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100],
                colorStops: [
                    [
                        {
                            offset: 0,
                            color: "var(--color-primary)",
                            opacity: 1
                        },
                        {
                            offset: 75,
                            color: "var(--color-primary)",
                            opacity: 1
                        },
                        {
                            offset: 100,
                            color: "var(--color-primary)",
                            opacity: 1
                        }
                    ],
                    [
                        {
                            offset: 0,
                            color: "var(--color-secondary)",
                            opacity: 0.1
                        },
                        {
                            offset: 75,
                            color: "var(--color-secondary)",
                            opacity: 0.05
                        },
                        {
                            offset: 100,
                            color: "var(--color-secondary)",
                            opacity: 0
                        }
                    ],
                    [
                        {
                            offset: 0,
                            color: "var(--color-warning)",
                            opacity: 1
                        },
                        {
                            offset: 75,
                            color: "var(--color-warning)",
                            opacity: 1
                        },
                        {
                            offset: 100,
                            color: "var(--color-warning)",
                            opacity: 1
                        }
                    ],
                ]
            }
        },
        stroke: {
            curve: ["smooth", "smooth", "smooth"],
            width: [0, 2, 0],
            dashArray: [0, 3, 0],
        },
        xaxis: {
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return "$" + value;
                },
            },
        },
        plotOptions: {
            bar: {
                columnWidth: "30%",
                borderRadius: "2",
            },
        },
        tooltip: {
            y: [
                {
                    formatter: function (e) {
                        return void 0 !== e ? e.toFixed(0) : e;
                    },
                },
                {
                    formatter: function (e) {
                        return void 0 !== e ? e.toFixed(0) : e;
                    },
                },
                {
                    formatter: function (e) {
                        return void 0 !== e ? e.toFixed(0) : e;
                    },
                },
            ],
        },
        legend: {
            show: true,
            position: "top",
            markers: {
                size: 4,
                strokeWidth: 0,
            },
        },
    };
    var chart4 = new ApexCharts(document.querySelector("#projects-overview"), options4);
    chart4.render();
    /* Projects Overview */

        /* task-activity */
        var options = {
            series: [1754, 634, 878, 470],
            labels: ["Designing", "Developing", "UI Testing", "Bugs Fixing"],
            chart: {
                height: 176,
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
            plotOptions: {
                pie: {
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
                                offsetY: 20
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
            // grid: {
            //     padding: {
            //         bottom: -100
            //     }
            // },
            colors: ["var(--color-primary)", "var(--color-secondary)", "var(--color-success)", "var(--color-warning)"],
        };
        var chart = new ApexCharts(document.querySelector("#task-overview"), options);
        chart.render();

     // deault swiper
     var swiper = new Swiper(".swiper-task", {
        loop: true,
        slidesPerView: 1,     
        spaceBetween: 10,  
        autoplay: {
            delay: 1500,
            disableOnInteraction: false,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 5,
            },
            640: {
                slidesPerView: 1,
                spaceBetween: 5,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 5,
            },
            1024: {
                slidesPerView: 2,
                spaceBetween: 20,
            }
        },
    });

})();