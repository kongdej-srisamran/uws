const request = require('request')

const LINETOKEN = 'stjoBJHuQDnWazExkD4PBl3kaBfrmjKMRy7SUUJtxJS'

var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://uws-egat.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("data");
ref.orderByChild("timestamp").limitToLast(1).once("value", function (snapshot) {
    snapshot.forEach(function (data) {
        console.log(data.val().temperature);
        sendMsg(data.val().pm25)
    });
})

const sendMsg = (text) => {
    request({
        method: 'POST',
        uri: 'https://notify-api.line.me/api/notify',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            bearer: LINETOKEN, //token
        },
        form: {
            message: text,
        },
    }, (err, httpResponse, body) => {
        if (err) {
            console.log(err)
        } else {
            console.log(body)
        }
        process.exit(1)
    })
}

