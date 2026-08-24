(function () {
    "use strict";
  
    var options = {
      series: [{
        name: 'Hours',
        data: [20, 35, 66, 40, 30, 55, 45]
      }],
      chart: {
        height: 285,
        fontFamily: 'Poppins, Arial, sans-serif',
        type: 'area',
        toolbar: {
          show: false
        }
      },
      grid: {
        show: false,
        borderColor: '#f2f6f7',
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        position: 'top',
        fontSize: '13px',
      },
      colors: ["var(--color-primary)"],
      stroke: {
        width: [2],
        curve: 'smooth',
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.5,
          opacityTo: 0.2,
          stops: [0, 60],
          colorStops: [
            [
              {
                offset: 0,
                color: 'var(--color-primary)',
                opacity: 0.4
              },
              {
                offset: 50,
                color: 'var(--color-primary)',
                opacity: 0.2
              },
              {
                offset: 100,
                color: 'var(--color-primary)',
                opacity: 0
              }
            ],
          ]
        },
      },
      yaxis: {
        min:0,
      },
      tooltip: {
        enabled: true,
        theme: "dark",
      },
      labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    };
    var chart3 = new ApexCharts(document.querySelector("#podcast-activity"), options);
    chart3.render();
  
  })()
  