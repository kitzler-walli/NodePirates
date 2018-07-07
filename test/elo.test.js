'use strict';
/* global suite: false, setup: false, test: false,
    teardown: false, suiteSetup: false, suiteTeardown: false */
const assert = require('assert').strict;
const elo = require('../lib/elo');

suite('elo calculator', function() {

  const assertions =  [
    {a: 2000, b: 2000, score: 1, expect: 2020, description: 'A Won'},
    {a: 2000, b: 2000, score: 0, expect: 1980, description: 'B Won'},
    {a: 2000, b: 2000, score: 0.5, expect: 2000, description: 'Stale'},
  ];

  for (const a of assertions) {
    test(`elo: ${a.description}`, () => {
      const result = elo(a.a, a.b, a.score);
      assert.equal(result, a.expect);
    });
  }

  test('elo invalid score', () => {
    assert.throws(() => {
      elo(2000, 2000, 2);
    }, Error);
  });

});
