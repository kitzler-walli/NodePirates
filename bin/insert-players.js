#!/usr/bin/env node
'use strict';

const mongo = require('../lib/service/mongo');
const Player = require('../player');
const fs = require('fs');
const path = require('path');

function buildPremadePlayerImages(player) {
	//iterate through all player folders
	let playerNames = fs.readdirSync(path.join(__dirname, "../players"));
	for (let i = 0; i < playerNames.length; i++) {
		let playerName = playerNames[i].toLowerCase();
		player.rebuildPlayerImage(path.join(__dirname, '../players', playerName), playerName); //no await
	}
}

(async () => {
	const client = await mongo.connect();
	const player = await Player.initFacade(client.db('nodepirates'));

	await player.players.insertOne({name: 'player1', port: 8080});
	await player.enqueue('player1');

	await player.players.insertOne({name: 'player2', port: 8081});
	await player.enqueue('player2');

	await player.players.insertOne({name: 'player-simple-core', port: 5000});
	await player.enqueue('player-simple-core');

	await buildPremadePlayerImages(player);
	await client.close();
})();
