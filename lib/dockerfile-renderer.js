'use strict';


const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const supported = {
  'node:alpine': 'nodejs.ejs',
  'microsoft/dotnet:sdk': 'dotnet-sdk.ejs'
};

const render = async (platform) => {
  if (!platform) {
    throw new Error('Platform  is missing');
  }

  if (!supported[platform]) {
    throw new Error('Platform is not supported');
  }

  const template = path.resolve(__dirname, 'dockerfile-templates', supported[platform]);
  return await ejs.renderFile(template, {}, {});
};
module.exports = exports = {render, supported};
