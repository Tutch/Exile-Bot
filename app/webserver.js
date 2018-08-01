'use strict';

// Ye old web server
const config = require("./config");
const express = require('express');
const packageInfo = require('../package.json');
const bodyParser = require('body-parser');
const path = require('path');
let app = express();

app.use(bodyParser.json());

app.post('/' + config.bot.token, function (req, res) {
  config.bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

let server = app.listen(process.env.PORT, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Web server started at http://%s:%s', host, port);
});
