'use strict';


const path = require('path');
const fs = require('fs');
const zip = require('zlib');
const sanitize = require('sanitize-filename');
const extract = require('extract-zip');

module.exports = exports = async (name, file) => {
  return new Promise((resolve, reject) => {
    const sanitized = sanitize(name);
    const dir = path.resolve(__dirname, '../players', sanitized);

    fs.mkdir(dir, (err) => {
      if (err) {
        return reject(err);
      }

      extract(file, {dir}, function (err) {
        if (err) {
          return reject(err);
        }

        resolve(dir);
      });

    });
  });
};
