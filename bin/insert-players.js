#!/usr/bin/env node
'use strict';

const mongo = require('../lib/service/mongo');
const Player = require('../player');
const fs = require('fs');
const path = require('path');

async function buildPremadePlayerImages(player) {
	//iterate through all player folders
	let playerNames = fs.readdirSync(path.join(__dirname, "../players"));
	for (let i = 0; i < playerNames.length; i++) {
		let playerName = playerNames[i].toLowerCase();
		await player.rebuildPlayerImage(path.join(__dirname, '../players', playerName), playerName); //no await
	}
}

(async () => {
	console.log("starting...");
	const client = await mongo.connect();
	const player = await Player.initFacade(client.db('nodepirates'));

	await player.players.insertOne({name: 'player1'});
	await player.enqueue('player1');

	await player.players.insertOne({name: 'player2'});
	await player.enqueue('player2');

	await player.players.insertOne({name: 'player-simple-core'});
	await player.enqueue('player-simple-core');

	console.log("building images...");
	await buildPremadePlayerImages(player);
	await client.close();
	console.log("done!");
})();
