#!/usr/bin/env node
'use strict';

const mongo = require('../lib/service/mongo');
const Player = require('../player');

(async () => {
  const client = await mongo.connect();
  const player = await Player.create(client.db('nodepirates'));

  await player.players.insertOne({name: 'player1', port: 8080});
  await player.enqueue('player1');

  await player.players.insertOne({name: 'player2', port: 8081});
  await player.enqueue('player2');

  await player.players.insertOne({name: 'player-simple-core', port: 5000});
  await player.enqueue('player-simple-core');

  await player.buildPlayerImages();
  client.close();
})();
