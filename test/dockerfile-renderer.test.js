'use strict';
/* global describe: false, it: false */
const assert = require('assert').strict;
const renderer = require('../lib/dockerfile-renderer');
const fs = require('fs');
const expected = fs.readFileSync(__dirname + '/Dockerfile.fixture', 'utf8');

describe('dockerfile renderer', function() {

  it('should render a Dockerfile', async () => {
    const Dockerfile = await renderer.render('node:alpine', 3000);
    assert.equal(Dockerfile, expected);
  });

  it('should throw error on unsupported platform', async () => {
    try {
      await renderer.render('foobar', 123);
    } catch (err) {
      return; // all fine; exit
    }

    assert.fail('should throw error');
  });

});
