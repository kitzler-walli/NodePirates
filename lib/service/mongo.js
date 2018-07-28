'use strict';


// @TODO: process.env
const {db_connectionstring} = require('../../settings');
const {MongoClient} = require('mongodb');

// singelton
let _client;

module.exports = exports = {
  connect: async () => {
    return _client = await MongoClient.connect(db_connectionstring);
  },
  close: async () => {
    return _client.close();
  }
};
