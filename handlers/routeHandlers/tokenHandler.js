/* eslint-disable prettier/prettier */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/*
 * Title: Token Handler
 * Description: Handler to handle token related routes
 * Author: Hossain
 *
 */

// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(404, {
      message: 'Method Not Allowed',
    });
  }
};

handler._token = {};

// write token to file
// {
//   "phone": "01756400875",
//   "password": "12345678"
// }
// http://localhost:3000/token
handler._token.post = (requestProperties, callback) => {
  const phone = typeof requestProperties.body.phone === 'string'
    && requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : null;

  const password = typeof requestProperties.body.password === 'string'
    && requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : null;

  if (phone && password) {
    data.read('users', phone, (err1, userData) => {
      if (!err1) {
        const hashedPassword = hash(password);
        if (hashedPassword === parseJSON(userData).password) {
          const tokenID = createRandomString(20);
          const expires = Date.now() + 60 * 60 * 1000;
          const tokenObject = {
            phone,
            id: tokenID,
            expires,
          };

          // store the token
          data.create('tokens', tokenID, tokenObject, (err2) => {
            if (!err2) {
              callback(200, tokenObject);
            } else {
              callback(500, {
                error: 'there is a problem in the server side!',
              });
            }
          });
        } else {
          callback(400, {
            error: 'Password is not valid!',
          });
        }
      } else {
        callback(400, {
          error: 'Phone number is not valid',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

// read token from file
// http://localhost:3000/token?id=2yx8qn3dl6zntsd3zx0d
handler._token.get = (requestProperties, callback) => {
  // check the token if valid
  const id = typeof requestProperties.queryStringObject.id === 'string'
    && requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    data.read('tokens', id, (error, tokenData) => {
      const token = { ...parseJSON(tokenData) };

      if (!error && token) {
        callback(200, token);
      } else {
        callback(404, { error: 'Requested token not found' });
      }
    });
  } else {
    callback(404, {
      error: 'You have a problem in your request',
    });
  }
};

// update existing token
// {
//   "id": "c0d15r66nvi9cs3ta4fm",
//   "extend": true
// }
handler._token.put = (requestProperties, callback) => {
  const id = typeof requestProperties.body.id === 'string'
    && requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  const extend = !!(
    typeof requestProperties.body.extend === 'boolean'
    && requestProperties.body.extend === true
  );

  if (id && extend) {
    data.read('tokens', id, (error1, tokkenData) => {
      const tokenObject = parseJSON(tokkenData);

      if (!error1) {
        if (tokenObject.expires > Date.now()) {
          tokenObject.expires = Date.now() + 60 * 60 * 1000;

          // store the updated token
          data.update('tokens', id, tokenObject, (error2) => {
            if (!error2) {
              callback(200, { success: 'Token updated successful' });
            } else {
              callback(500, {
                error: 'there is a server side error',
              });
            }
          });
        } else {
          callback(400, { error: 'Token already expired!' });
        }
      } else {
        callback(404, { error: 'Requested token not found' });
      }
    });
  } else {
    callback(404, {
      error: 'You have a problem in your request',
    });
  }
};

// delete existing token
// http://localhost:3000/token?id=sptwrvo7nmowdx6aqwug
handler._token.delete = (requestProperties, callback) => {
  // check the token if valid
  const id = typeof requestProperties.queryStringObject.id === 'string'
    && requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the user
    data.read('tokens', id, (err1, tokenData) => {
      if (!err1 && tokenData) {
        data.delete('tokens', id, (err2) => {
          if (!err2) {
            callback(200, { success: 'Token deleted successful' });
          } else {
            callback(500, { error: 'There is a server side error' });
          }
        });
      } else {
        callback(404, { erroe: 'Requested token not found' });
      }
    });
  } else {
    callback(400, {
      error: 'there is a problem in your request!',
    });
  }
};

// verify the token
handler._token.verify = (id, phone, callback) => {
  data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone
        && parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// export module
module.exports = handler;
