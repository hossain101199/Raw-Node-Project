/* eslint-disable prettier/prettier */
/*
 * Title: Notifications Library
 * Description: Important functions to notify users
 * Author: Hossain
 *
 */

// dependencies
const querystring = require('querystring');
const https = require('https');
const { twilio } = require('./environments');

// module scaffolding
const notifications = {};

// send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
  // input validation
  const userPhone = typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg = typeof msg === 'string' && msg.trim().length <= 1600 ? msg.trim() : false;

  if (userPhone && userMsg) {
    // configure the request payload
    // https://www.twilio.com/docs/sms/send-messages
    const payload = {
      To: `+88${userPhone}`,
      From: twilio.fromPhone,
      Body: userMsg,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the request details
    // https://nodejs.org/api/https.html
    const requestDetails = {
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        'content-Type': 'application/x-www-form-urlencoded',
      },
    };

    // instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // get the status of the sent request
      const status = res.statusCode;
      //   callback successfully if the request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    req.on('error', (e) => {
      callback(e);
    });

    req.write(stringifyPayload);
    req.end();
  } else {
    callback('given parameters were missing or invalid!');
  }
};

// export the module
module.exports = notifications;
