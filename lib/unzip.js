'use strict';

const fs = require('fs');
const extract = require('extract-zip');

module.exports = exports = async (dir, file) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        return reject(err);
      }

      extract(file, {dir}, function (err) {
        if (err) {
          return reject(err);
        }

        resolve();
      });

    });
  });
};
