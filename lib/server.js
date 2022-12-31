/* eslint-disable prettier/prettier */
/*
 * Title: Server library
 * Description: Server related files
 * Author: Hossain
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environments = require('../helpers/environments');

// server object - module scaffolding
const server = {};

// create server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environments.port, () => {
    console.log(`listening to port ${environments.port}`);
  });
};

// handle Request Response
server.handleReqRes = handleReqRes;

server.init = () => {
  // start the server
  server.createServer();
};

// export
module.exports = server;
