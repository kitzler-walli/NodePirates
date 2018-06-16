'use strict';

const game_1 = require("./game");
const fs = require("fs");
const Dockerode = require("dockerode");
const mongodb = require("mongodb");
const tarfs = require("tar-fs");
const path = require("path");
const WebRequest = require("web-request");
const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
const as = require("async");

async function Ready(port) {
	let retryCount = 10;
	while (retryCount > 0) {
		try {
			let reset = await WebRequest.json('http://localhost:' + port + '/reset');
			return true;
		}
		catch (err) {
			//console.log(err);
			await sleep(1000);
			retryCount--;
		}
	}
	return false;
}

async function PlayGame(player1, player2) {
	let container1, container2;
	try {
		container1 = await docker.createContainer({ Image: 'nodepirates/' + player1.name, HostConfig: { PortBindings: { [player1.port + '/tcp']: [{ 'HostIp': '127.0.0.1' }] } } });
		container2 = await docker.createContainer({ Image: 'nodepirates/' + player2.name, HostConfig: { PortBindings: { [player2.port + '/tcp']: [{ 'HostIp': '127.0.0.1' }] } } });
		await container1.start();
		await container2.start();
		const container1Data = await container1.inspect();
		const container2Data = await container2.inspect();
		const port1 = container1Data.NetworkSettings.Ports[Object.keys(container1Data.NetworkSettings.Ports)[0]][0].HostPort;
		const port2 = container2Data.NetworkSettings.Ports[Object.keys(container2Data.NetworkSettings.Ports)[0]][0].HostPort;

		// Check if the player is available by sending a reset call
		if (! await Ready(port1)) {
			throw ("Player1 did not answer in a timely fashion");
		}
		if (! await Ready(port2)) {
			throw ("Player2 did not answer in a timely fashion");
		}

		try {
			let game = new game_1.Game(port1, port2);
			let result = await game.play();
			console.log(result);
		}
		catch (gameErr) {
			console.log(gameErr);
		}

	}
	catch (err) {
		console.log(err);
	}
	finally {
		await container1.stop();
		await container2.stop();
		await container1.remove();
		await container2.remove();
	}
}
async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function StartWorldWar() {
	//search for all events that have not been played yet
	const start = process.hrtime();
	try {
		const client = await mongodb.MongoClient.connect("mongodb://127.0.0.1:27017/nodepirates");
		const db = await client.db("nodepirates");
		const eventsColl = await db.collection("events");
		const playersColl = await db.collection("players");
		const playersArr = await playersColl.find({}).toArray();
		const players = playersArr.reduce(function (map, obj) {
			map[obj.name] = obj;
			return map;
		}, {});
		const events = await eventsColl.find({ played: false }).toArray();

		const funcs = [];
		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			for (let j = 0; j < 100; j++) {
				funcs.push(async () => {
					console.log("playing game " + j + " betweeen " + event.player1 + ' and ' + event.player2);
					const startGame = process.hrtime();
					await PlayGame(players[event.player1], players[event.player2]);
					const diffGame = process.hrtime(startGame);
					console.log(diffGame);
				});
			}
			//await eventsColl.updateOne({ '_id': event._id }, { $set: { played: true } });
		}
		as.parallelLimit(funcs,100,() =>{
			client.close();
		});
	}
	catch (err) {
		console.log(err);
	}
	const diff = process.hrtime(start);
	console.log(diff);
}


StartWorldWar();