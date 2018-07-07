'use strict';


const path = require('path');
const fs = require('fs');
const zip = require('zlib');
const sanitize = require('sanitize-filename');

module.exports = exports = (name, file, callback) => {
    const sanitized = sanitize(name);
    const dir = path.resolve(__dirname, '../players', sanitized);

    fs.mkdir(dir, (err) => {
      if (err) {
        return callback(err);
      }

      callback(null, dir);
    });
};
