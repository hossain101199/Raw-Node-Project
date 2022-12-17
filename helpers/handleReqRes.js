/* eslint-disable prettier/prettier */
/*
 * Title: Handle Request Response
 * Description: Handle Resquest and response
 * Author: Hossain
 *
 */

// dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const {
  notFoundHandler,
} = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

// modue scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  // request handling
  // gat the url and parse it
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedpath = path.replace(/^\/+|\/+$/g, '');
  const queryStringObject = parsedUrl.query;
  const method = req.method.toLowerCase();
  const headersObject = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    trimmedpath,
    queryStringObject,
    method,
    headersObject,
  };

  const decoder = new StringDecoder('utf-8');
  let realData = '';

  const choseHandler = routes[trimmedpath]
    ? routes[trimmedpath]
    : notFoundHandler;

  req.on('data', (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on('end', () => {
    realData += decoder.end();

    requestProperties.body = parseJSON(realData);

    choseHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? payload : {};

      const payloadString = JSON.stringify(payload);

      // return the final response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

// export module
module.exports = handler;
