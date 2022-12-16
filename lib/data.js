/* eslint-disable prettier/prettier */
/*
 * Title: Data Library
 * Description: Data Library functions for CRUD
 * Author: hossain
 *
 */

// dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    console.log({ fileDescriptor });
    if (!err && fileDescriptor) {
      // convert data to stirng
      const stringData = JSON.stringify(data);

      // write data to file and then close it
      fs.writeFile(fileDescriptor, stringData, (err2) => {
        if (!err2) {
          // close the file
          fs.close(fileDescriptor, (err3) => {
            if (!err3) {
              callback('Success: file written and closed');
            } else {
              callback('Error: closing the new file!');
            }
          });
        } else {
          callback('Error: writing to new file!');
        }
      });
    } else {
      callback('There was an error, file may already exists!');
    }
  });
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (err, data) => {
    callback(err, data);
  });
};

// update existing file
lib.update = (dir, file, data, callback) => {
  // file open for writing
  fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // convert the data to string
      const stringData = JSON.stringify(data);

      // truncate the file
      fs.ftruncate(fileDescriptor, (err1) => {
        if (!err1) {
          fs.writeFile(fileDescriptor, stringData, (err2) => {
            if (!err2) {
              // close the file
              fs.close(fileDescriptor, (err3) => {
                if (!err3) {
                  callback('Success: file written and closed');
                } else {
                  callback('Error: closing the new file!');
                }
              });
            } else {
              callback('Error: writing to file');
            }
          });
        } else {
          callback('Error: truncating file');
        }
      });
    } else {
      callback('Error: updating file may not exist');
    }
  });
};

// delete existing file
lib.delete = (dir, file, callback) => {
  console.log(callback);
  // unlink file
  fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback('Success: file deleted');
    } else {
      callback('Error: deleting file');
    }
  });
};
// export module
module.exports = lib;
