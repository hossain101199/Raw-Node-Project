/* eslint-disable prettier/prettier */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/*
 * Title: Check Handler
 * Description: Handler to handle user defined checks
 * Author: Hossain
 *
 */

// dependencies
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const data = require('../../lib/data');
const tokenVerifier = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(404, {
      message: 'Method Not Allowed',
    });
  }
};

handler._check = {};

// write check to file
// {
//     "protocol":"http",
//     "url":"hello.com",
//     "method":"GET",
//     "successCodes":[200, 201],
//     "timeoutSeconds":5
// }
handler._check.post = (requestProperties, callback) => {
  // validate inputs
  const protocol = typeof requestProperties.body.protocol === 'string'
    && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url = typeof requestProperties.body.url === 'string'
    && requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method = typeof requestProperties.body.method === 'string'
    && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes = typeof requestProperties.body.successCodes === 'object'
    && requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number'
    && requestProperties.body.timeoutSeconds % 1 === 0
    && requestProperties.body.timeoutSeconds >= 1
    && requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // verify the token
    const token = typeof requestProperties.headersObject.token === 'string'
        ? requestProperties.headersObject.token
        : false;

    // lookup the user phone by reading the token
    data.read('tokens', token, (error1, tokenData) => {
      if (!error1 && tokenData) {
        const userPhone = parseJSON(tokenData).phone;

        // lockup the user data
        data.read('users', userPhone, (error2, userData) => {
          if (!error2 && userData) {
            tokenVerifier._token.verify(token, userPhone, (tokenID) => {
              if (tokenID) {
                const userObject = parseJSON(userData);
                const userChecks = typeof userObject.checks === 'object'
                  && userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxChecks) {
                  const checkID = createRandomString(20);
                  const checkObject = {
                    id: checkID,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };

                  // save the object
                  data.create('checks', checkID, checkObject, (error3) => {
                    if (!error3) {
                      userObject.checks = userChecks;
                      userObject.checks.push(checkID);

                      // save the new user data
                      data.update('users', userPhone, userObject, (error4) => {
                        if (!error4) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error:
                              'there is a problem in the server/failed to update user data',
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error:
                          'there is a problem in the server/failed to create checks',
                      });
                    }
                  });
                } else {
                  callback(500, {
                    error: 'User already reached max check limit!',
                  });
                }
              } else {
                callback(403, {
                  error: 'Authentication failure!',
                });
              }
            });
          } else {
            callback(403, {
              error: 'user not found',
            });
          }
        });
      } else {
        callback(403, {
          error: 'Authentication failure!',
        });
      }
    });
  } else {
    callback(400, { error: 'You have a problem in your request' });
  }
};

// read data from file
// http://localhost:3000/check?id=4n01easlkxgho5xuv6nt
handler._check.get = (requestProperties, callback) => {
  // check the token if valid
  const id = typeof requestProperties.queryStringObject.id === 'string'
    && requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the check
    data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // verify the token
        const token = typeof requestProperties.headersObject.token === 'string'
            ? requestProperties.headersObject.token
            : false;
        tokenVerifier._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: 'Authentication failure',
              });
            }
          },
        );
      } else {
        callback(400, { error: 'check not found' });
      }
    });
  } else {
    callback(400, { error: 'you have a problem is your request' });
  }
};

// update existing data
// http://localhost:3000/check
// {
//     "id": "4n01easlkxgho5xuv6nt",
//     "userPhone": "01756400875",
//     "protocol": "http",
//     "url": "hello.com",
//     "method": "GET",
//     "successCodes": [
//         2002,
//         201
//     ],
//     "timeoutSeconds": 5
// }
handler._check.put = (requestProperties, callback) => {
  // validate inputs
  const id = typeof requestProperties.body.id === 'string'
    && requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  const protocol = typeof requestProperties.body.protocol === 'string'
    && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url = typeof requestProperties.body.url === 'string'
    && requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method = typeof requestProperties.body.method === 'string'
    && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes = typeof requestProperties.body.successCodes === 'object'
    && requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number'
    && requestProperties.body.timeoutSeconds % 1 === 0
    && requestProperties.body.timeoutSeconds >= 1
    && requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read('checks', id, (err1, checkData) => {
        if (!err1 && checkData) {
          const checkObject = parseJSON(checkData);

          // verify the token
          const token = typeof requestProperties.headersObject.token === 'string'
              ? requestProperties.headersObject.token
              : false;
          tokenVerifier._token.verify(
            token,
            parseJSON(checkData).userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }

                if (url) {
                  checkObject.url = url;
                }

                if (method) {
                  checkObject.method = method;
                }

                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }

                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }

                // store the checkObject
                data.update('checks', id, checkObject, (err2) => {
                  if (!err2) {
                    callback(200, checkObject);
                  } else {
                    callback(500, { error: 'failed to update check' });
                  }
                });
              } else {
                callback(403, {
                  error: 'Authentication failure',
                });
              }
            },
          );
        } else {
          callback(500, {
            error:
              'there is a problem in the server side / failed to read check id',
          });
        }
      });
    } else {
      callback(400, {
        error: 'you must provide at least one field to update!',
      });
    }
  } else {
    callback(400, { error: 'you have a problem in your request' });
  }
};

// delete existing data
// http://localhost:3000/check?id=4n01easlkxgho5xuv6nt
handler._check.delete = (requestProperties, callback) => {
  // check the token if valid
  const id = typeof requestProperties.queryStringObject.id === 'string'
    && requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the check
    data.read('checks', id, (err1, checkData) => {
      if (!err1 && checkData) {
        // verify the token
        const token = typeof requestProperties.headersObject.token === 'string'
            ? requestProperties.headersObject.token
            : false;
        tokenVerifier._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // delete the check data
              data.delete('checks', id, (err2) => {
                if (!err2) {
                  // read user data and update
                  data.read(
                    'users',
                    parseJSON(checkData).userPhone,
                    (err3, userData) => {
                      if (!err3 && userData) {
                        const userObject = parseJSON(userData);
                        const userChecks = typeof userObject.checks === 'object'
                          && userObject.checks instanceof Array
                            ? userObject.checks
                            : [];

                        // remove the deleted check id from user's list of checks
                        const checkPosition = userChecks.indexOf(id);

                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);

                          // resave the user data
                          userObject.checks = userChecks;

                          // update user data
                          data.update(
                            'users',
                            userObject.phone,
                            userObject,
                            (error4) => {
                              if (!error4) {
                                callback(200, {
                                  success:
                                    'check deleted and user data updated',
                                });
                              } else {
                                callback(500, {
                                  error: 'failed to update user data',
                                });
                              }
                            },
                          );
                        } else {
                          callback(500, {
                            error:
                              'the check id that you are trying to remove is not found in user',
                          });
                        }
                      } else {
                        callback(500, {
                          error:
                            'there is a server side problem / failed to read user data',
                        });
                      }
                    },
                  );
                } else {
                  callback(500, {
                    error:
                      'there is a server side problem/ failed to delete check',
                  });
                }
              });
            } else {
              callback(403, {
                error: 'Authentication failure',
              });
            }
          },
        );
      } else {
        callback(400, { error: 'check not found' });
      }
    });
  } else {
    callback(400, { error: 'you have a problem in your request' });
  }
};

// export module
module.exports = handler;
