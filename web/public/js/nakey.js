// Initialize Firebase
var config = {
    apiKey: "AIzaSyAl7YECh5S4DuxUdTABlvcWXP0nZklNGjE",
    databaseURL: "https://uws-egat.firebaseio.com",
};
firebase.initializeApp(config);
var ref = firebase.database().ref('data').limitToLast(1);

const pm_max = 300
const pm_min = 0

const gauge = (id, min, max, title, decimals, label) => new JustGage({
    id: id,
    min: min,
    max: max,
    title: title,
    relativeGaugeSize: true,
    decimals: decimals,
    counter: true,
    formatNumber: true,
    label: label
})

// id,min,max,title,decimals,label
var gPm25 = gauge('gPm25', 0, 80, 'PM 2.5', 2, 'ug/m3')
var gPm10 = gauge('gPm10', 0, 150, 'PM 10', 2, 'ug/m3')
//var gRain = gauge('gRain', 0, 100, 'Rain', 0, '%')
//var gTemp = gauge('gTemp', 10, 50, 'Temperature', 2, 'C')
//var gHum = gauge('gHum', 0, 100, 'Humidity', 0, '%')
var gBat = gauge('gBat', 0, 15, 'Battery', 2, 'Volts')
var gPressure = gauge('gPressure', 0, 100000, 'Pressure', 0, 'mBar')

const getFormattedDate = (d) => {
    var date = new Date(d);
    var dateFormat = (date.getDate().toString().length == 1 ? "0" : '') + date.getDate() + '/' + ((date.getMonth() + 1).toString().length == 1 ? "0" : '') + (date.getMonth() + 1) + "/" + date.getFullYear()
    var hours = ((date.getHours() % 12).toString().length == 1 ? '0' : '') + "" + (date.getHours() % 12);
    var minuts = ((date.getMinutes()).toString().length == 1 ? '0' : '') + "" + (date.getMinutes());
    var seconds = ((date.getSeconds()).toString().length == 1 ? '0' : '') + "" + (date.getSeconds());
    var format = (date.getHours() >= 12 && date.getHours() % 12 != 0) ? 'PM' : 'AM'
    var str = dateFormat + ' ' + hours + ':' + minuts + format

    return str;
}

var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
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
                    id: 'y-axis-1',
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

function fx(raw) {
    let coefficient = 0.595366756
    let intercept = 9.277364156
    return parseFloat(raw)
    //return (parseFloat(raw) * coefficient) + intercept
}

function getFeedChart() {
    var url = "https://api.netpie.io/feed/TRUCK?apikey=RmfLR19BnbaGIRH4R2bOH0lP3D0szEdT&granularity=10minutes&since=12hours";
    $.getJSON(url, function (data) {
        //console.log(data.data)
        var pm25_data = []
        var pm10_data = []
        var label = []
        for (let i = 0; i < data.data.length; i++) {
            if (data.data[i].attr == 'PM10') {
                for (let j = 0; j < data.data[i].values.length; j++) {
                    if (data.data[i].values[j][1] != '0' && parseFloat(data.data[i].values[j][1]) < pm_max) {
                        label.push(getFormattedDate(data.data[i].values[j][0]))
                        pm10_data.push(data.data[i].values[j][1].toFixed(2))
                    }
                }
            }
            if (data.data[i].attr == 'PM25') {
                for (let j = 0; j < data.data[i].values.length; j++) {
                    if (data.data[i].values[j][1] != '0' && parseFloat(data.data[i].values[j][1]) < pm_max) {
                        pm25_data.push(data.data[i].values[j][1].toFixed(2))
                    }
                }
            }
        }
        //console.log(label)
        //console.log(pm10_data)
        for (let i = 0; i < label.length; i++) {
            chart.data.labels.push(label[i])
            chart.data.datasets[0].data.push(pm10_data[i])
            chart.data.datasets[1].data.push(pm25_data[i])
            chart.update();
        }

    })
}


function updateFeedChart() {
    var url = "https://api.netpie.io/feed/TRUCK?apikey=RmfLR19BnbaGIRH4R2bOH0lP3D0szEdT&granularity=10minutes&since=12hours";
    $.getJSON(url, function (data) {
        console.log(data.data)
        pm25_data = []
        pm10_data = []
        label = []
        for (let i = 0; i < data.lastest_data.length; i++) {
            if (data.lastest_data[i].attr == 'PM10') {
                for (let j = 0; j < data.lastest_data[i].values.length; j++) {
                    if (data.lastest_data[i].values[j][1] != '0' && parseFloat(data.lastest_data[i].values[j][1]) < pm_max) {
                        label.push(getFormattedDate(data.lastest_data[i].values[j][0]))
                        pm10_data.push(data.lastest_data[i].values[j][1].toFixed(2))
                    }
                }
            }
            if (data.lastest_data[i].attr == 'PM25') {
                for (let j = 0; j < data.lastest_data[i].values.length; j++) {
                    if (data.lastest_data[i].values[j][1] != '0' && parseFloat(data.lastest_data[i].values[j][1]) < pm_max) {
                        pm25_data.push(data.lastest_data[i].values[j][1].toFixed(2))
                    }
                }
            }
        }
        console.log(label)
        console.log(pm10_data)
        chart.data.labels.push(label[0])
        chart.data.datasets[0].data.push(pm10_data[0])
        chart.data.datasets[1].data.push(pm25_data[0])
        chart.update();
    })
}

const FEEDID = "TRUCK"
const APIKEY = "RmfLR19BnbaGIRH4R2bOH0lP3D0szEdT"

function getFeedFilter(gran, since, tag) {
    var url = "https://api.netpie.io/feed/" + FEEDID
    url += "?apikey=" + APIKEY
    url += "&granularity=" + gran
    url += "&since=" + since
    url += "&filter=" + tag
    $.getJSON(url, function (data) {
        console.log(data)
        var i = 0, cnt = 0, pm25_sum = 0
        for (i = 0; i < data.data.length; i++) {
            if (data.data[i].attr == 'PM25') {
                //console.log(data.data[i].values)
                data.data[i].values.map(row => {
                    if (row[1] != '0') {
                        pm25_sum += fx(row[1])
                        console.log(fx(row[1]))
                        cnt++
                        pm25_date = row[0]
                    }
                })
            }
        }
    })
}

/*
function getFeed() {
    var url = "https://api.netpie.io/feed/TRUCK?apikey=RmfLR19BnbaGIRH4R2bOH0lP3D0szEdT&granularity=1minutes&since=60minutes";

    $.getJSON(url, function (data) {
        for (i = 0; i < data.lastest_data.length; i++) {
            if (data.lastest_data[i].attr == 'PM10') {
                gPm10.refresh(data.lastest_data[i].values[0][1]);
                document.getElementById("pm10_date").innerHTML = getFormattedDate(data.lastest_data[i].values[0][0]);
            }
            if (data.lastest_data[i].attr == 'PM25') {
                gPm25.refresh(fx(data.lastest_data[i].values[0][1]));
                document.getElementById("pm25_date").innerHTML = getFormattedDate(data.lastest_data[i].values[0][0]);
            }
            if (data.lastest_data[i].attr == 'Rain') {
                gRain.refresh(data.lastest_data[i].values[0][1]);
                document.getElementById("rain_date").innerHTML = getFormattedDate(data.lastest_data[i].values[0][0]);
            }
            if (data.lastest_data[i].attr == 'Temp') {
                gTemp.refresh(data.lastest_data[i].values[0][1]);
                document.getElementById("temp_date").innerHTML = getFormattedDate(data.lastest_data[i].values[0][0]);
            }
            if (data.lastest_data[i].attr == 'Humidity') {
                gHum.refresh(data.lastest_data[i].values[0][1]);
                document.getElementById("hum_date").innerHTML = getFormattedDate(data.lastest_data[i].values[0][0]);
            }
            if (data.lastest_data[i].attr == 'Bat') {
                gBat.refresh(data.lastest_data[i].values[0][1]);
                document.getElementById("bat_date").innerHTML = getFormattedDate(data.lastest_data[i].values[0][0]);
            }
        }
    });
}
*/

ref.on('child_added', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        console.log(childKey, '=', childData)
        if (childKey == 'pm25') {
            gPm25.refresh(fx(childData));
        }
        else if (childKey == 'pm10') {
            gPm10.refresh(childData);
        }
//       else if (childKey == 'rain') {
//            gRain.refresh(childData);
//        }
//        else if (childKey == 'temperature') {
//            gTemp.refresh(childData);
//        }
//        else if (childKey == 'humidity') {
//            gHum.refresh(childData);
//        }
        else if (childKey == 'battery') {
            gBat.refresh(childData);
        }
        else if (childKey == 'presssure') {
            gPressure.refresh(childData);
        }


    });
});

/*
$(document).ready(function () {
    getFeed()
    getFeedChart()
    setInterval(getFeed, 10000);
    setInterval(updateFeedChart, 600000);
});
*/

