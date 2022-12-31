/* eslint-disable prettier/prettier */
/*
 * Title: Workers library
 * Description: Worker related files
 * Author: Hossain
 *
 */

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notifications');

// worker object - module scaffolding
const worker = {};

// Lookup all the checks
worker.gatherAllChecks = () => {
  // get all the checks
  data.list('checks', (err1, checks) => {
    if (!err1 && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read the checkData
        data.read('checks', check, (err2, originalCheckData) => {
          if (!err2 && originalCheckData) {
            // pass the data to the check validator
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log('Error: failed to read check data');
          }
        });
      });
    } else {
      console.log('Error: could not find any checks to process!');
    }
  });
};
// validate individual check data
worker.validateCheckData = (originalCheckData) => {
  const originalData = originalCheckData;
  if (originalData && originalData.id) {
    originalData.status = typeof originalData.status === 'string'
      && ['up', 'down'].indexOf(originalData.status) > -1
        ? originalData.status
        : 'down';

    originalData.lastChecked = typeof originalData.lastChecked === 'number'
      && originalData.lastChecked > 0
        ? originalData.lastChecked
        : false;

    // pass to the next process
    worker.performCheck(originalData);
  } else {
    console.log('Error: check was invalid of not properly formatted!');
  }
};

// perform check
worker.performCheck = (originalData) => {
  // prepare the initial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  // mark the outcome has not been sent yet
  let outComeSent = false;

  //   parse the hostname & full url from original data
  const parsedUrl = url.parse(`${originalData.protocol}://${originalData.url}`);
  const hostName = parsedUrl.hostname;
  const { path } = parsedUrl;

  // construct the request
  const requestDetails = {
    protocol: `${originalData.protocol}:`,
    hostname: hostName,
    method: originalData.method.toUpperCase(),
    path,
    timeout: originalData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalData.protocol === 'http' ? http : https;

  const req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode;

    //   update the check outcome and pass to the next process
    checkOutcome.responseCode = status;

    if (!outComeSent) {
      worker.processCheckOutcome(originalData, checkOutcome);
      outComeSent = true;
    }
  });

  req.on('error', (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };
    //   update the check outcome and pass to the next process
    if (!outComeSent) {
      worker.processCheckOutcome(originalData, checkOutcome);
      outComeSent = true;
    }
  });

  req.on('timeout', () => {
    checkOutcome = {
      error: true,
      value: 'timeout',
    };
    //   update the check outcome and pass to the next process
    if (!outComeSent) {
      worker.processCheckOutcome(originalData, checkOutcome);
      outComeSent = true;
    }
  });

  // req send
  req.end();
};

// save check outcome to database and send to next process
worker.processCheckOutcome = (originalData, checkOutcome) => {
  // check if check outcome is up or down
  const status = !checkOutcome.error
    && checkOutcome.responseCode
    && originalData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? 'up'
      : 'down';

  // decide whether we should alert the user or not
  const alertWanted = !!(
    originalData.lastChecked && originalData.status !== status
  );

  // update the check data
  const newCheckData = originalData;

  newCheckData.status = status;
  newCheckData.lastChecked = Date.now();

  // update the check data
  data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // send the checkdata to next process
        worker.alertUserToStatuseChange(newCheckData);
      } else {
        console.log('Alert is not needed as there is no status change!');
      }
    } else {
      console.log('Error: failed to update checks data');
    }
  });
};

// send notification sms to user if state change
worker.alertUserToStatuseChange = (newCheckData) => {
  const msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.status}`;

  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(
        `${newCheckData.userPhone} user alerted to a status change via sms ${msg}`,
      );
    } else {
      console.log(
        `Error: there is a problem sending sms to ${newCheckData.userPhone} user`,
      );
    }
  });
};

// timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    // execute all the checks
    worker.gatherAllChecks();
  }, 1000 * 60);
};

// start the woekers
worker.init = () => {
  // execute all the checks
  worker.gatherAllChecks();

  // call the loop so that checks continue
  worker.loop();
};
// export
module.exports = worker;
