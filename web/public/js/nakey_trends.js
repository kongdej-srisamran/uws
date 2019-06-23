const pm_max = 300
const pm_min = 0

var pmChart = new Chart(document.getElementById('pmChart').getContext('2d'), {
    type: 'line',
    data: {
        datasets: [
            {
                label: "PM10",
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                fill: false
            },
            {
                label: "PM2.5",
                data: [],
                borderColor: 'rgb(2, 255, 200)',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
          display: true,
          text: "Particulate Matter (PM10 and PM2.5) Trends",
        },
        legend: {
          display: true
        },
        
        scales: {
            yAxes: [
                {
                    display: true,
                    position: 'left',
                    ticks: {
                        callback: function(value, index, values) {
                            return value;
                        }
                    },
                    scaleLabel:{
                        display: true,
                        labelString: 'Concentration, ug/m3',
                        fontColor: "#546372"
                    }
                }   
            ]
        }
    }

});

var humChart = new Chart(document.getElementById('humChart').getContext('2d'), {
    type: 'line',
    data: {
        datasets: [
            {
                label: "Humidity",
                data: [],
                borderColor: 'rgb(218, 51, 79)',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
          display: true,
          text: "Humidity",
        },
        legend: {
          display: false
        },
        scales: {
            yAxes: [
                {
                    display: true,
                    position: 'left',
                    scaleLabel:{
                        display: true,
                        labelString: '%',
                        fontColor: "#546372"
                    }
                }   
            ]
        }
    }

});

var tempChart = new Chart(document.getElementById('tempChart').getContext('2d'), {
    type: 'line',
    data: {
        datasets: [
            {
                label: "Temperature",
                data: [],
                borderColor: 'rgb(250, 50, 230)',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
          display: true,
          text: "Temperature",
        },
        legend: {
          display: false
        },
        scales: {
            yAxes: [
                {
                    display: true,
                    position: 'left',
                    scaleLabel:{
                        display: true,
                        labelString: 'C',
                        fontColor: "#546372"
                    }
                }   
            ]
        }
    }

});

var rainChart = new Chart(document.getElementById('rainChart').getContext('2d'), {
    type: 'line',
    data: {
        datasets: [
            {
                label: "Rain",
                data: [],
                borderColor: 'rgb(20, 100, 255)',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
          display: true,
          text: "Rain",
        },
        legend: {
          display: false
        },
        scales: {
            yAxes: [
                {
                    display: true,
                    position: 'left',
                    scaleLabel:{
                        display: true,
                        labelString: '%',
                        fontColor: "#546372"
                    }
                }   
            ]
        }
    }

});

var batChart = new Chart(document.getElementById('batChart').getContext('2d'), {
    type: 'line',
    data: {
        datasets: [
            {
                label: "Battery",
                data: [],
                borderColor: 'rgb(255, 50, 30)',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
          display: true,
          text: "Battery",
        },
        legend: {
          display: false
        },
        scales: {
            yAxes: [
                {
                    display: true,
                    position: 'left',
                    scaleLabel:{
                        display: true,
                        labelString: 'Volt',
                        fontColor: "#546372"
                    }
                }   
            ]
        }
    }

});

function getFeedChart(duration, item) {
    
    console.log(item)
    document.getElementById("duration").innerHTML=item
 
    var url = "https://api.netpie.io/feed/TRUCK?apikey=RmfLR19BnbaGIRH4R2bOH0lP3D0szEdT&"+duration;
    console.log(url)
    $.getJSON( url, function( data ) {
        //console.log(data.data)
        var pm25_data = []
        var pm10_data = []
        var temp_data = []
        var hum_data = []
        var rain_data = []
        var bat_data = []
        var label = []
        
        for (let i=0; i<data.data.length; i++ ) {
            if(data.data[i].attr == 'PM10') {
                for (let j=0; j< data.data[i].values.length; j++) {
                    if (data.data[i].values[j][1] != '0' && parseFloat(data.data[i].values[j][1]) < pm_max) {
                        label.push(getFormattedDate(data.data[i].values[j][0]))
                        pm10_data.push(data.data[i].values[j][1].toFixed(2))
                    }
                }
            }
            if(data.data[i].attr == 'PM25') {
                for (let j=0; j< data.data[i].values.length; j++) {
                    if (data.data[i].values[j][1] != '0' && parseFloat(data.data[i].values[j][1]) < pm_max) {
                        pm25_data.push(data.data[i].values[j][1].toFixed(2))
                    }
                }
            }
            if(data.data[i].attr == 'Temp') {
                for (let j=0; j< data.data[i].values.length; j++) {
                    if (data.data[i].values[j][1] != '0') {
                        temp_data.push(data.data[i].values[j][1].toFixed(2))
                    }
                }
            }
            if(data.data[i].attr == 'Humidity') {
                for (let j=0; j< data.data[i].values.length; j++) {
                    if (data.data[i].values[j][1] != '0') {
                        hum_data.push(data.data[i].values[j][1].toFixed(2))
                    }
                }
            }
            if(data.data[i].attr == 'Rain') {
                for (let j=0; j< data.data[i].values.length; j++) {
                    rain_data.push(data.data[i].values[j][1].toFixed(2))
                }
            }
            if(data.data[i].attr == 'Bat') {
                for (let j=0; j< data.data[i].values.length; j++) {
                    if (data.data[i].values[j][1] != '0') {
                        bat_data.push(data.data[i].values[j][1].toFixed(2))
                    }
                }
            }
        }

        pmChart.data.labels = label;
        pmChart.data.datasets[0].data = pm10_data;
        pmChart.data.datasets[1].data = pm25_data;
        pmChart.update();
        drawChart(tempChart,label,temp_data)
        drawChart(humChart,label,hum_data)
        drawChart(rainChart,label,rain_data)
        drawChart(batChart,label,bat_data)
    })
}


function drawChart(chart,label,data) {
    chart.data.labels = label;
    chart.data.datasets[0].data = data;
    chart.update();
}

function getFormattedDate(d) {
    var date = new Date(d);
    var dateFormat =  (date.getDate().toString().length == 1? "0":'' ) + date.getDate() +'/'+ ((date.getMonth()+ 1).toString().length == 1? "0":'' ) + (date.getMonth()+1) + "/" + date.getFullYear()
    var hours = ((date.getHours()%12).toString().length == 1?'0':'') + "" + (date.getHours()%12);
    var minuts = ((date.getMinutes()).toString().length == 1?'0':'') + "" + (date.getMinutes());
    var seconds = ((date.getSeconds()).toString().length == 1?'0':'') + "" + (date.getSeconds());
    var format = (date.getHours() >= 12 && date.getHours()%12 != 0) ? 'PM':'AM'
    var str = dateFormat + ' '+hours + ':' + minuts  + format

    return str;
}


$(document).ready(function() {
    let duration = "granularity=10minutes&since=12hours"
    getFeedChart(duration,'12 Hours')
});

 
