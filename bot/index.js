require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');

const config = require('./config.js');
const webhookHandler = require('./handler/webhook');

const app = express();

app.post('/webhook', line.middleware(config), webhookHandler);

console.log('Webhook started at port '+process.env.PORT)
app.listen(process.env.PORT || 3000);