const line = require('@line/bot-sdk');
const firebaseDb = require('../lib/firebasedb');

const config = require('../config.js');

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type === 'message' && event.message.text) {
    firebaseDb.sendVal(client,event)
  }
}

const webhook = (req, res) => {
  console.log(`User id: ${req.body.events[0].source.userId}`);
  res.json({ status: 'ok' });
  return Promise
    .all(req.body.events.map(handleEvent))
    .catch((e) => {
      console.log(e);
    });
};

module.exports = webhook;
