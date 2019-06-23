// Initialize Firebase
var config = {
    apiKey: "AIzaSyAl7YECh5S4DuxUdTABlvcWXP0nZklNGjE",
    databaseURL: "https://uws-egat.firebaseio.com",
};
firebase.initializeApp(config);

const pm_max = 300
const pm_min = 0

var pmChart = new Chart(document.getElementById('pmChart').getContext('2d'), {
    type: 'line',
    data: {
        datasets: [
            {
                label: "PM10",
                data: [],
                borderColor: 'rgb(2, 255, 200)',
                fill: false
            },
            {
                label: "PM2.5",
                data: [],
                borderColor: 'rgb(255, 99, 132)',
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
                        callback: function (value, index, values) {
                            return value;
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Concentration, ug/m3',
                        fontColor: "#546372"
                    }
                }
            ]
        }
    }

});

function makeChart(id, datalabel, color, title, ylabel) {
    return new Chart(document.getElementById(id).getContext('2d'), {
        type: 'line',
        data: {
            datasets: [
                {
                    label: datalabel,
                    data: [],
                    borderColor: color,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: title,
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [
                    {
                        display: true,
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: ylabel,
                            fontColor: "#546372"
                        }
                    }
                ]
            }
        }

    });
}

// chartid, datalabel, color, title, unit
var tempChart = makeChart('tempChart', 'Temperature', 'rgb(218,51,79)', 'Temperature', 'C')
var batChart = makeChart('batChart', 'Battery', 'rgb(218,51,79)', 'Battery', 'V')
var windChart = makeChart('windChart', 'Wind Speed', 'rgb(218,51,79)', 'Wind Speed', 'km/h')
var humChart = makeChart('humChart', 'Humidity', 'rgb(218,51,79)', 'Humidity', '%')
var pressureChart = makeChart('pressureChart', 'Pressure', 'rgb(218,51,79)', 'Pressure', 'bar')
var uvChart = makeChart('uvChart', 'UV', 'rgb(218,51,79)', 'UV', 'mw/cm2')
var rainChart = makeChart('rainChart', 'Rain', 'rgb(218,51,79)', 'Rain', 'mm')
var soundChart = makeChart('soundChart', 'Sound', 'rgb(218,51,79)', 'Sound', 'Loud')
var vbChart = makeChart('vbChart', 'Vibration', 'rgb(218,51,79)', 'Vibration', '')

function drawChart(duration,average,item) {
    //const duration = 3   // x hours
    //const average = 10       // average x minute

    const from_timestamp = Math.round(new Date() / 1000) - 60 * 60 * duration
    const to_timestamp = Math.round(new Date() / 1000)
    pmChart.data.datasets[0].data = []
    pmChart.data.datasets[1].data = []
    pmChart.data.labels = []
    tempChart.data.datasets[0].data = []
    tempChart.data.labels = []
    humChart.data.datasets[0].data = []
    humChart.data.labels = []
    batChart.data.datasets[0].data = []
    batChart.data.labels = []
    windChart.data.datasets[0].data = []
    windChart.data.labels = []
    pressureChart.data.datasets[0].data = []
    pressureChart.data.labels = []
    uvChart.data.datasets[0].data = []
    uvChart.data.labels = []
    soundChart.data.datasets[0].data = []
    soundChart.data.labels = []
    vbChart.data.datasets[0].data = []
    vbChart.data.labels = []
    rainChart.data.datasets[0].data = []
    rainChart.data.labels = []

    for (let t = from_timestamp; t < to_timestamp; t += average * 60) {
        let from_datetime = formatDateByTimestamp(t * 1000)
        let to_datetime = formatDateByTimestamp((t + average * 60) * 1000)
        // console.log(from_datetime, '-', to_datetime)
        var ref = firebase.database().ref('data').orderByChild('timestamp').startAt(from_datetime).endAt(to_datetime)
        let sum_pm25 = 0, sum_pm10 = 0, n = 0
        let sum_temp = 0, sum_bat = 0, sum_wind = 0
        let sum_hum = 0, sum_pressure = 0, sum_uv = 0
        let sum_rain = 0, sum_sound = 0, sum_vb = 0
        ref.once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                if (childSnapshot.val().pm25 < pm_max && childSnapshot.val().pm10 < pm_max) {
                    sum_pm25 += parseFloat(childSnapshot.val().pm25)
                    sum_pm10 += parseFloat(childSnapshot.val().pm10)
                    sum_temp += parseFloat(childSnapshot.val().temperature)
                    sum_hum += parseFloat(childSnapshot.val().humidity)
                    sum_bat += parseFloat(childSnapshot.val().battery)
                    sum_wind += parseFloat(childSnapshot.val().wind_speed)
                    sum_pressure += parseFloat(childSnapshot.val().presssure)
                    sum_uv += parseFloat(childSnapshot.val().uv)
                    sum_rain += parseFloat(childSnapshot.val().rain)
                    sum_sound += parseFloat(childSnapshot.val().sound)
                    sum_vb += parseFloat(childSnapshot.val().vibration)
                    n++;
                }
            });
        }).then(() => {
            let datetime = formatDateByTimestamp((t + average * 60) * 1000)
            if (n) {
                pmChart.data.datasets[0].data.push(parseFloat(sum_pm10 / n).toFixed(2))
                pmChart.data.datasets[1].data.push(parseFloat(sum_pm25 / n).toFixed(2))
                tempChart.data.datasets[0].data.push(parseFloat(sum_temp / n).toFixed(2))
                humChart.data.datasets[0].data.push(parseFloat(sum_hum / n).toFixed(2))
                batChart.data.datasets[0].data.push(parseFloat(sum_bat / n).toFixed(2))
                windChart.data.datasets[0].data.push(parseFloat(sum_wind / n).toFixed(2))
                pressureChart.data.datasets[0].data.push(parseFloat(sum_pressure / n).toFixed(2))
                uvChart.data.datasets[0].data.push(parseFloat(sum_uv / n).toFixed(2))
                rainChart.data.datasets[0].data.push(parseFloat(sum_rain / n).toFixed(2))
                soundChart.data.datasets[0].data.push(parseFloat(sum_sound / n).toFixed(2))
                vbChart.data.datasets[0].data.push(parseFloat(sum_vb / n).toFixed(2))
            }
            else {
                pmChart.data.datasets[0].data.push(0)
                pmChart.data.datasets[1].data.push(0)
                tempChart.data.datasets[0].data.push(0)
                humChart.data.datasets[0].data.push(0)
                batChart.data.datasets[0].data.push(0)
                windChart.data.datasets[0].data.push(0)
                pressureChart.data.datasets[0].data.push(0)
                uvChart.data.datasets[0].data.push(0)
                rainChart.data.datasets[0].data.push(0)
                soundChart.data.datasets[0].data.push(0)
                vbChart.data.datasets[0].data.push(0)

            }
            pmChart.data.labels.push(datetime)
            tempChart.data.labels.push(datetime)
            humChart.data.labels.push(datetime)
            batChart.data.labels.push(datetime)
            windChart.data.labels.push(datetime)
            pressureChart.data.labels.push(datetime)
            uvChart.data.labels.push(datetime)
            rainChart.data.labels.push(datetime)
            soundChart.data.labels.push(datetime)
            vbChart.data.labels.push(datetime)
            pmChart.update()
            tempChart.update()
            humChart.update()
            batChart.update()
            windChart.update()
            pressureChart.update()
            uvChart.update()
            rainChart.update()
            soundChart.update()
            vbChart.update()

        }).catch(error => {
            console.log(error);
        });
    }
}


function formatDateByTimestamp(timestamp) {
    var date = new Date(timestamp)
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    var hour = date.getHours().toString();
    hour = hour.length > 1 ? hour : '0' + hour

    var minute = date.getMinutes().toString();
    minute = minute.length > 1 ? minute : '0' + minute

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

function fx(raw) {
    let coefficient = 0.595366756
    let intercept = 9.277364156
    return parseFloat(raw)
    //return (parseFloat(raw) * coefficient) + intercept
}

drawChart(3,10,null)