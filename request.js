var mqtt = require('mqtt')
var client  = mqtt.connect('https://mqtt.egat.co.th',{
    username: "RNA80PBG47rmKVAhMlcJ"
})

client.on('connect', function () {
    console.log('Client connected!');
    client.publish('v1/devices/me/attributes', process.env.ATTRIBUTES);
    console.log('Attributes published!');
    client.publish('v1/devices/me/telemetry', process.env.TELEMETRY);
    console.log('Telemetry published!');
    client.end();
});