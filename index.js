/* eslint-disable prettier/prettier */
/*
 * Title: Project Initial file
 * Description: Initial file to start the node server and workers
 * Author: Hossain
 *
 */

// dependencies
const server = require('./lib/server');
const worker = require('./lib/worker');

// app object - module scaffolding
const app = {};

app.init = () => {
  // start the server
  server.init();
  // start the workers
  worker.init();
};

// start the app
app.init();
