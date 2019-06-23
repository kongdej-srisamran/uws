const config = require('../config.js');
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://uws-egat.firebaseio.com"
});

var db = admin.database();

const sendVal = (client, event) => {

    return new Promise(function (resolve, reject) {
        var ref = db.ref("data");
        ref.orderByChild("timestamp").limitToLast(1).once("value", function (snapshot) {
            snapshot.forEach(function(data) {
                console.log(data.val());
                client.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: 'Temperature = '+data.val().temperature
                    }
                ])
            });
        });


        resolve()
    })
}

module.exports = {
    sendVal
};