'use strict';

const game_1 = require("./game");
const fs = require("fs");
const Dockerode = require("dockerode");
const mongodb_1 = require("mongodb");
const tarfs = require("tar-fs");
const path = require("path");
const WebRequest = require("web-request");
const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

async function buildPlayerImages(rebuild = false, playerName = null) {
	//iterate through all player folders
	let players = fs.readdirSync(path.join(__dirname, "players"));
	for (let i = 0; i < players.length; i++) {
		let player = players[i].toLowerCase();
		if(playerName != null){
			playerName = playerName.toLowerCase();
		}
		
		// skip the current folder if playerName does not match
		if (playerName != null && player !== playerName) {
			continue;
		}
		//check if image for player alread exists
		let info = await docker.listImages({ filter: 'nodepirates/' + player });
		if (info.length == 0) {
			//image does not exist -> create image from player-folder
			const pack = tarfs.pack(path.join(__dirname, 'players', player));
			let stream = await docker.buildImage(pack, { t: 'nodepirates/' + player });
			stream.pipe(process.stdout, {
				end: true
			});
			stream.on('end', function () {
				console.log("done");
			});
		}
		else if (info.length > 1) {
			//todo: delete all images and rebuild
			console.log("Too many images");
			for (let i = 0; i < info.length; i++) {
				let image = docker.getImage(info[i].Id);
				await image.remove();
			}
			await buildPlayerImages(false, player);
		}
		else {
			//if rebuild is true -> delete -> rebuild
			if (rebuild) {
				let image = docker.getImage(info[0].Id);
				await image.remove();
				await buildPlayerImages(false, player);
			}
		}
	}
	console.log("done build");
}

async function Ready(player){
	let retryCount = 10;
	while(retryCount > 0){
		try {
			let reset = await WebRequest.json('http://localhost:' + player.port + '/reset');
			return true;
		}
		catch(err){
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
		container1 = await docker.createContainer({ Image: 'nodepirates/' + player1.name, ExposedPorts: { [player1.port + '/tcp']: {} }, HostConfig: { PortBindings: { [player1.port + '/tcp']: [{ 'HostPort': player1.port + '/tcp', 'HostIp': '127.0.0.1' }] } } });
		container2 = await docker.createContainer({ Image: 'nodepirates/' + player2.name, ExposedPorts: { [player2.port + '/tcp']: {} }, HostConfig: { PortBindings: { [player2.port + '/tcp']: [{ 'HostPort': player2.port + '/tcp', 'HostIp': '127.0.0.1' }] } } });
		await container1.start();
		await container2.start();
		// Check if the player is available by sending a reset call
		if(! await Ready(player1)){
			throw("Player1 did not answer in a timely fashion");
		}
		if(! await Ready(player2)){
			throw("Player2 did not answer in a timely fashion");
		}

		try {
			let game = new game_1.Game(player1.port, player2.port);
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
async function InsertPlayers() {
	try {
		const client = await mongodb_1.MongoClient.connect("mongodb://127.0.0.1:27017/nodepirates");
		const db = await client.db("nodepirates");
		const coll = await db.collection("players");
		await coll.insertOne({
			name: 'player1',
			port: 8080
		});
		await coll.insertOne({
			name: 'player2',
			port: 8081
		});
		await coll.insertOne({
			name: 'player-simple',
			port: 8080
		});
		await coll.insertOne({
			name: 'player-simple-core',
			port: 5000
		});
		await client.close();
	}
	catch (err) {
		console.log(err);
	}
}
//buildPlayerImages(true);

PlayGame(
	{
		name: 'player1',
		environment: 'node:carbon-alpine',
		port: 8080
	}, {
		name: 'player-simple-core',
		environment: 'microsoft/dotnet:sdk',
		port: 5000
	}
);