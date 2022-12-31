/* eslint-disable prettier/prettier */
/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Hossain
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environments = require('./helpers/environments');
// twilio test
const { sendTwilioSms } = require('./helpers/notifications');

// app object - module scaffolding
const app = {};

// twilio test
sendTwilioSms('01756400875', 'hello', (err) => {
  console.log(`this the ${err}`);
});

// create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environments.port, () => {
    console.log(`listening to port ${environments.port}`);
  });
};

// handle Request Response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
