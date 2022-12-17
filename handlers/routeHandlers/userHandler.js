/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
/*
 * Title: User Handler
 * Description: Handler to handle user related routes
 * Author: Hossain
 *
 */

// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(404, {
      message: 'Method Not Allowed',
    });
  }
};

handler._users = {};

// write data to file

// {
//   firstName: "hossain",
//   lastName: "Hossain bhai",
//   phone: "",
//   password: "12345678",
//   tosAgreement: true,
// }

handler._users.post = (requestProperties, callback) => {
  const firstName = typeof requestProperties.body.firstName === 'string'
    && requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : null;

  const lastName = typeof requestProperties.body.lastName === 'string'
    && requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : null;

  const phone = typeof requestProperties.body.phone === 'string'
    && requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : null;

  const password = typeof requestProperties.body.password === 'string'
    && requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : null;

  const tosAgreement = typeof requestProperties.body.tosAgreement === 'boolean'
    && requestProperties.body.tosAgreement
      ? requestProperties.body.tosAgreement
      : false;
  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exists
    data.read('users', phone, (err1) => {
      if (err1) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        // store the user to db
        data.create('users', phone, userObject, (err2) => {
          if (err2) {
            callback(200, {
              message: 'User created successfully!',
            });
          } else {
            callback(500, {
              error: 'Could not create user!',
            });
          }
        });
      } else {
        callback(500, {
          error: 'Internal Server Error || user already exists',
        });
      }
    });
  } else {
    callback(400, {
      error: 'Bad Request',
    });
  }
};

// read data from file
handler._users.get = (requestProperties, callback) => {
  // check the phone number if valid
  const phone = typeof requestProperties.queryStringObject.phone === 'string'
    && requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : null;

  if (phone) {
    // lookup the user
    data.read('users', phone, (err, userData) => {
      const requestedUserData = { ...parseJSON(userData) };
      if (!err && requestedUserData) {
        delete requestedUserData.password;
        callback(200, requestedUserData);
      } else {
        callback(404, {
          error: 'requested user not found',
        });
      }
    });
  } else {
    callback(404, {
      error: 'requested user not found',
    });
  }
};

// update existing data
handler._users.put = (requestProperties, callback) => {
  const firstName = typeof requestProperties.body.firstName === 'string'
    && requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : null;

  const lastName = typeof requestProperties.body.lastName === 'string'
    && requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : null;

  // check the phone number if valid
  const phone = typeof requestProperties.body.phone === 'string'
    && requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : null;

  const password = typeof requestProperties.body.password === 'string'
    && requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : null;

  if (phone) {
    if (firstName || lastName || password) {
      // loopkup the user
      data.read('users', phone, (err1, userData) => {
        const targetedUserData = { ...parseJSON(userData) };

        if (!err1 && targetedUserData) {
          if (firstName) {
            targetedUserData.firstName = firstName;
          }
          if (lastName) {
            targetedUserData.lastName = lastName;
          }
          if (password) {
            targetedUserData.password = hash(password);
          }

          // store to database
          data.update('users', phone, targetedUserData, (err2) => {
            console.log(err2);
            if (!err2) {
              callback(200, {
                message: 'user updated successfully',
              });
            } else {
              callback(500, {
                error: 'there is a problem in the server side',
              });
            }
          });
        } else {
          callback(400, {
            error: 'You have a problem in your request!',
          });
        }
      });
    } else {
      callback(400, {
        error: 'You have a problem in your request!',
      });
    }
  } else {
    callback(400, {
      error: 'Invalid phone number. Please try again!',
    });
  }
};

// delete existing data
handler._users.delete = (requestProperties, callback) => {
  // check the phone number if valid
  const phone = typeof requestProperties.queryStringObject.phone === 'string'
    && requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : null;

  if (phone) {
    // lookup the user
    data.read('users', phone, (err1, userData) => {
      if (!err1 && userData) {
        data.delete('users', phone, (err2) => {
          if (!err2) {
            callback(200, {
              message: 'User successfully deleted!',
            });
          } else {
            callback(500, {
              error: 'There is a server side error',
            });
          }
        });
      } else {
        callback(500, {
          errror: 'There is a server side error',
        });
      }
    });
  } else {
    callback(400, {
      error: 'There is a problem in your request',
    });
  }
};

// export module
module.exports = handler;
