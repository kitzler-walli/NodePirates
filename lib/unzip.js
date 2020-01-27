'use strict';

const extract = require('extract-zip');

module.exports = exports = async (dir, file) => {
  return new Promise((resolve, reject) => {
    extract(file, {dir}, function (err) {
      if (err) {
        return reject(new Error(err));
      }
      resolve();
    });
  });
};
