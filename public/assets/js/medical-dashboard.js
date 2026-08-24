(function () {
    "use strict";

    /* Available Doctors Scroll */
    var myElement = document.getElementById('available-doctors');
    new SimpleBar(myElement, { autoHide: true });
    /* Available Doctors Scroll */

    /* Patients Statistics */
    var options = {
       chart: {
        type: 'line',
        height: 360,
        toolbar: {
            show: false
        },
        zoom: {
            enabled: false
        }
    },

    series: [
        {
            type: 'line',
            name: 'Active Patients',
            data: [42, 58, 50, 66, 61, 78, 68, 54, 46, 57, 63, 52]
        },
        {
            name: 'New Patients',
            data: [68, 44, 62, 48, 64, 45, 56, 78, 60, 72, 58, 74]
        }
    ],

    colors: ['var(--color-primary)', 'var(--color-secondary)'],

    stroke: {
        width: [3.5, 3],
        curve: 'smooth',
        lineCap: 'round'
    },

    markers: {
        size: 5,
        strokeWidth: 3,
        hover: {
            size: 7
        }
    },

    grid: {
        borderColor: 'transparent',
        // strokeDashArray: 6,
        padding: {
            left: 10,
            right: 10
        },
        row: {
            colors: ['var(--color-light)', 'transparent'],
            opacity: 1
        },

        yaxis: {
            lines: {
                show: false
            }
        },
    },

    dataLabels: {
        enabled: false
    },
    fill: {
    type: 'gradient',
    gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.18,
        opacityTo: 0.02,
        stops: [0, 100],

        colorStops: [

            [
                {
                    offset: 0,
                    color: "var(--color-primary)",
                    opacity: 0.28
                },
                {
                    offset: 25,
                    color: "var(--color-primary)",
                    opacity: 0.75
                },
                {
                    offset: 45,
                    color: "var(--color-primary)",
                    opacity: 1
                },
                {
                    offset: 75,
                    color: "var(--color-primary)",
                    opacity: 0.75
                },
                {
                    offset: 100,
                    color: "var(--color-primary)",
                    opacity: 0
                }
            ],

            [
                {
                    offset: 0,
                    color: "var(--color-secondary)",
                    opacity: 0.24
                },
                {
                    offset: 25,
                    color: "var(--color-secondary)",
                    opacity: 0.75
                },
                {
                    offset: 45,
                    color: "var(--color-secondary)",
                    opacity: 1
                },
                {
                    offset: 75,
                    color: "var(--color-secondary)",
                    opacity: 0.75
                },
                {
                    offset: 100,
                    color: "var(--color-secondary)",
                    opacity: 0
                }
            ]

        ]
    }
},

    xaxis: {
        categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],

        axisBorder: {
            show: false
        },

        axisTicks: {
            show: false
        },

        labels: {
            style: {
                colors:'#94a3b8',
                fontSize:'12px'
            }
        }
    },

    yaxis: {

        min: 20,
        max: 90,
        tickAmount: 5,

        labels: {
            style: {
                colors:'#94a3b8',
                fontSize:'12px'
            }
        }
    },

    legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        offsetY: 5,
        markers: {
            size: 5,
        }
    },
    };
    var chart = new ApexCharts(document.querySelector("#patients-statistics"), options);
    chart.render();
    /* Patients Statistics */

    /* Patients Visits */
    // var options = {
    //   series: [
    //     {
    //       name: "Out Patients",
    //       data: [950, 792, 501, 800, 500, 500, 280]
    //     },
    //     {
    //       name: "In Patients",
    //       data: [480, 403, 150, 523, 150, 150, 100]
    //     }
    //   ],

    //   chart: {
    //     type: 'bar',
    //     height: 420,
    //     toolbar: {
    //       show: false
    //     },
    //     fontFamily: 'Inter, sans-serif'
    //   },

    //   colors: ['#1f7a72', '#f2c94c'],

    //   plotOptions: {
    //     bar: {
    //       horizontal: false,
    //       columnWidth: '42%',
    //       borderRadius: 6,
    //       endingShape: 'rounded'
    //     }
    //   },

    //   dataLabels: {
    //     enabled: true,
    //     style: {
    //       fontSize: '12px',
    //       fontWeight: 600
    //     },
    //     offsetY: -20
    //   },

    //   stroke: {
    //     show: true,
    //     width: 5,
    //     colors: ['transparent']
    //   },

    //   xaxis: {
    //     categories: [
    //       'Monday',
    //       'Tuesday',
    //       'Wednesday',
    //       'Thursday',
    //       'Friday',
    //       'Saturday',
    //       'Sunday'
    //     ],
    //     labels: {
    //       style: {
    //         colors: '#64748b',
    //         fontSize: '13px',
    //         fontWeight: 500
    //       }
    //     },
    //     axisBorder: {
    //       show: false
    //     },
    //     axisTicks: {
    //       show: false
    //     }
    //   },

    //   yaxis: {
    //     labels: {
    //       style: {
    //         colors: '#94a3b8',
    //         fontSize: '13px'
    //       }
    //     }
    //   },

    //   fill: {
    //     opacity: 1
    //   },

    //   tooltip: {
    //     theme: 'light',
    //     y: {
    //       formatter: function (val) {
    //         return val + " Patients"
    //       }
    //     }
    //   },

    //   legend: {
    //     show: false
    //   },

    //   grid: {
    //     borderColor: '#edf2f7',
    //     strokeDashArray: 4,
    //     padding: {
    //       left: 10,
    //       right: 10
    //     }
    //   },

    //   responsive: [
    //     {
    //       breakpoint: 768,
    //       options: {
    //         plotOptions: {
    //           bar: {
    //             columnWidth: '60%'
    //           }
    //         }
    //       }
    //     }
    //   ]
    // };

    // var chart = new ApexCharts(
    //   document.querySelector("#patientVisitsChart"),
    //   options
    // );
    // chart.render();
    /* Patients Visits */

    /* Top Departments */
    // var options = {
    //     series: [
    //         {
    //             data: [400, 430, 470, 540, 600, 800],
    //             name: "Patients",
    //         },
    //     ],
    //     chart: {
    //         type: "bar",
    //         height: 358,
    //         toolbar: {
    //             show: false,
    //         },
    //     },
    //     fill: {
    //         type: "solid",
    //     },
    //     plotOptions: {
    //         bar: {
    //             borderRadius: 3,
    //             horizontal: true,
    //             columnWidth: "20%",
    //             barHeight: "40%",
    //         },
    //     },
    //     colors: ["var(--primary-color)"],
    //     grid: {
    //         show: false,
    //         enabled: false,
    //         borderColor: "transparent",
    //     },
    //     dataLabels: {
    //         enabled: false,
    //     },
    //     xaxis: {
    //         categories: [
    //             "Dermatologists",
    //             "Cardiologist",
    //             "Gynecologist",
    //             "Dentist",
    //             "Neurosurgeon",
    //             "Orthopedic ",
    //         ],
    //         labels: {
    //             show: true,
    //             style: {
    //                 colors: "#adb5be",
    //                 fontSize: "11px",
    //                 fontWeight: 600,
    //                 cssClass: "apexcharts-xaxis-label",
    //             },
    //         },
    //     },
    //     yaxis: {
    //         labels: {
    //             show: true,
    //             style: {
    //                 colors: "#adb5be",
    //                 fontSize: "11px",
    //                 fontWeight: 600,
    //                 cssClass: "apexcharts-yaxis-label",
    //             },
    //         },
    //     },
    // };
    // var chart1 = new ApexCharts(document.querySelector("#top-departments"), options);
    // chart1.render();
    /* Top Departments */

})();




new Swiper(".medical-swiper", {

    loop: true,

    spaceBetween: 20,

    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },

    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

});


 var options = {
      series: [
        {
          name: "Out Patients",
          data: [950, 792, 501, 800, 500, 500, 280]
        },
        {
          name: "In Patients",
          data: [480, 403, 150, 523, 150, 150, 100]
        }
      ],

      chart: {
        type: 'bar',
        height: 360,
        toolbar: {
          show: false
        },
        fontFamily: 'Inter, sans-serif'
      },

      colors: ['var(--color-primary)', 'var(--color-secondary)'],

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '48%',
          borderRadius: 3,
          endingShape: 'rounded',
            dataLabels: {
                position: 'top'
            }
        },
      },

      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['var(--color-primary)', 'var(--color-secondary)'] 
        },
        offsetY: -20,
      },

      stroke: {
        show: true,
        width: 6,
        colors: ['transparent']
      },

      xaxis: {
        categories: [
          'Mon',
          'Tues',
          'Wed',
          'Thur',
          'Fri',
          'Sat',
          'Sun'
        ],
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '13px',
            fontWeight: 500
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },

      yaxis: {
        labels: {
          style: {
            colors: '#94a3b8',
            fontSize: '13px'
          }
        }
      },

      fill: {
        opacity: 1
      },

      tooltip: {
        theme: 'light',
        y: {
          formatter: function (val) {
            return val + " Patients"
          }
        }
      },

      legend: {
        show: false
      },

      grid: {
        borderColor: '#edf2f7',
        strokeDashArray: 4,
        padding: {
          left: 10,
          right: 10
        }
      },

      responsive: [
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '60%'
              }
            }
          }
        }
      ]
    };

    var chart = new ApexCharts(
      document.querySelector("#patients-visits"),
      options
    );

    chart.render();


    var options = {
  series: [{
    name: "Patients",
    data: [420, 380, 300, 260, 190, 150]
  }],

  chart: {
    type: 'bar',
    height: 375,
    toolbar: { show: false }
  },

  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 8,
      barHeight: '50%'
    }
  },

  dataLabels: {
    enabled: true,
    style: {
      fontSize: '12px',
      fontWeight: 700,
      colors: ['#fff']
    }
  },

  xaxis: {
    categories: [
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "Pediatrics",
      "Radiology",
      "General"
    ],
    labels: {
      style: {
        colors: '#64748b'
      }
    }
  },

colors: ['var(--color-primary)'],

fill: {
    type: 'gradient',

    gradient: {
        shade: 'dark',
        type: 'horizontal',

        colorStops: [

            [
                {
                    offset: 0,
                    color: "var(--color-primary)",
                    opacity: 0.95
                },
                {
                    offset: 80,
                    color: "var(--color-primary)",
                    opacity: 1
                },
                {
                    offset: 94,
                    color: "var(--color-primary)",
                    opacity: 1
                },
                {
                    offset: 100,
                    color: "var(--color-secondary)",
                    opacity: 1
                }
            ]

        ]
    }
},

  grid: {
    borderColor: '#edf2f7'
  },

  tooltip: {
    y: {
      formatter: function(val){
        return val + " Patients"
      }
    }
  }
};

var chart = new ApexCharts(document.querySelector("#top-departments"), options);
chart.render();