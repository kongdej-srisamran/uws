// Initialize Firebase
var config = {
    apiKey: "AIzaSyAl7YECh5S4DuxUdTABlvcWXP0nZklNGjE",
    databaseURL: "https://uws-egat.firebaseio.com",
};
firebase.initializeApp(config);

const pm_max = 300
const pm_min = 0

const duration = 3   // x hours
const average = 5       // average x minute

const from_timestamp = Math.round(new Date() / 1000) - 60 * 60 * duration
const to_timestamp = Math.round(new Date() / 1000)

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

const text = (id, text) => {
    document.getElementById(id).innerHTML = text;
}

// id,min,max,title,decimals,label
var gPm25 = gauge('gPm25', 0, 80, 'PM 2.5', 2, 'ug/m3')
var gPm10 = gauge('gPm10', 0, 150, 'PM 10', 2, 'ug/m3')
var gBat = gauge('gBat', 0, 15, 'Battery', 2, 'Volts')
var gTemperature = gauge('gTemperature', 10, 50, 'Temperature', 2, 'C')

var ctx = document.getElementById('myChart').getContext('2d');

var chart = new Chart(ctx, {
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
                borderColor: 'rgb(255, 99, 13)',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: " PM2.5 & PM10 Trends (" + duration + " Hours / " + average + " Minutes)",
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


// Listen child added on firebase-realtime database
var ref = firebase.database().ref('data').limitToLast(1);

ref.on('child_added', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        //console.log(childKey, '=', childData)
        if (childKey == 'pm25') {
            gPm25.refresh(childData);
        }
        else if (childKey == 'pm10') {
            gPm10.refresh(childData);
        }
        else if (childKey == 'battery') {
            gBat.refresh(childData);
        }
        else if (childKey == 'temperature') {
            gTemperature.refresh(childData);
        }
        else if (childKey == 'timestamp') {
            text('data_updated', childData)
        }
        else if (childKey == 'wind_direction') {
            let dir = '0';
            if (childData == 'N') dir = '0'
            else if (childData == 'NE') dir = '45'
            else if (childData == 'E') dir = '90'
            else if (childData == 'SE') dir = '135'
            else if (childData == 'S') dir = '180'
            else if (childData == 'SW') dir = '225'
            else if (childData == 'W') dir = '270'
            else if (childData == 'NW') dir = '315'
            text(childKey, '<img src="assets/img/winddirection.png"  style="width:48px;transform:rotate(' + dir + 'deg)">' + childData)
        }
        else {
            text(childKey, childData)
        }
    });
});

for (let t = from_timestamp; t < to_timestamp; t += average * 60) {
    let from_datetime = formatDateByTimestamp(t * 1000)
    let to_datetime = formatDateByTimestamp((t + average * 60) * 1000)
   // console.log(from_datetime, '-', to_datetime)
    var ref = firebase.database().ref('data').orderByChild('timestamp').startAt(from_datetime).endAt(to_datetime)
    let sum_pm25 = 0, sum_pm10 = 0, n = 0
    ref.once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().pm25 < pm_max && childSnapshot.val().pm10 < pm_max) {
                sum_pm25 += parseFloat(childSnapshot.val().pm25)
                sum_pm10 += parseFloat(childSnapshot.val().pm10)
                n++;
            }
        });
    }).then(() => {
        let datetime = formatDateByTimestamp((t+average*60)*1000)
        if (n) {
            chart.data.datasets[0].data.push(parseFloat(sum_pm10 / n).toFixed(2))
            chart.data.datasets[1].data.push(parseFloat(sum_pm25 / n).toFixed(2))
        }
        else {
            chart.data.datasets[0].data.push(0)
            chart.data.datasets[1].data.push(0)
        }
        chart.data.labels.push(datetime)
        chart.update()       
    }).catch(error => {
        console.log(error);
    });
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

function updateChart() {
    const from = formatDateByTimestamp(Math.round(new Date()) - 1000*60*average)
    const to = formatDateByTimestamp(Math.round(new Date()))
    console.log(from,'-',to)
    let ref = firebase.database().ref('data').orderByChild('timestamp').startAt(from).endAt(to)
    let sum_pm25 = 0, sum_pm10 = 0, n = 0
    ref.once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().pm25 < pm_max && childSnapshot.val().pm10 < pm_max) {
                sum_pm25 += parseFloat(childSnapshot.val().pm25)
                sum_pm10 += parseFloat(childSnapshot.val().pm10)
                n++;
            }
        });
    }).then(() => {

        if (n) {
            chart.data.datasets[0].data.push(parseFloat(sum_pm10 / n).toFixed(2))
            chart.data.datasets[1].data.push(parseFloat(sum_pm25 / n).toFixed(2))
        }
        else {
            chart.data.datasets[0].data.push(0)
            chart.data.datasets[1].data.push(0)
        }
        chart.data.labels.push(to)
        chart.data.datasets[0].data.shift()
        chart.data.datasets[1].data.shift()
        chart.data.labels.shift()
        chart.update()       
    }).catch(error => {
        console.log(error);
    });    
}

$(document).ready(function() {
    setInterval(updateChart, average*60*1000);
});