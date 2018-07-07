const mongodb = require("mongodb");
const fs = require("fs");
const Dockerode = require("dockerode");
const tarfs = require("tar-fs");
const path = require("path");
const WebRequest = require("web-request");
const settings = require("./settings");
const docker = new Dockerode({ socketPath: settings.docker_socketPath });

class Player {

}
Player.CreateNew = async function (zipFile, name, platform, port) {
	try {
		//todo: unzip player into folder
		// create dockerfile for new player
		// build docker image

		const client = await mongodb.MongoClient.connect(settings.db_connectionstring);
		const db = await client.db("nodepirates");
		const coll = await db.collection("players");

		await coll.insertOne({
			name: name,
			port: port
		});

		const eventsColl = await db.collection("events");
		const otherPlayers = await coll.find({name: {'$ne':name }}).toArray();
		const events = [];

		for(let i = 0;i< otherPlayers.length;i++){
			events.push({ insertOne:{
				player1: name,
				player2: otherPlayers[i].name,
				played: false
			}});
		}
		
		if(events.length){
			await eventsColl.bulkWrite(events);
		}
		await client.close();
	}
	catch (err) {
		console.log(err);
	}
}
Player.InsertPlayers = async function() {
	try {
		await Player.CreateNew('', 'player1', 'node', 8080);
		await Player.CreateNew('', 'player2', 'node', 8081);
		//await Player.CreateNew('', 'player-simple', 'node', 8080);
		await Player.CreateNew('', 'player-simple-core', 'dotnet', 5000);

		// const client = await mongodb.MongoClient.connect(settings.db_connectionstring);
		// const db = await client.db("nodepirates");
		// const coll = await db.collection("players");
		// await coll.insertOne({
		// 	name: 'player1',
		// 	port: 8080
		// });
		// await coll.insertOne({
		// 	name: 'player2',
		// 	port: 8081
		// });
		// await coll.insertOne({
		// 	name: 'player-simple',
		// 	port: 8080
		// });
		// await coll.insertOne({
		// 	name: 'player-simple-core',
		// 	port: 5000
		// });
		// await client.close();
	}
	catch (err) {
		console.log(err);
	}
}
Player.buildPlayerImages = async function (rebuild = false, playerName = null) {
	//iterate through all player folders
	let players = fs.readdirSync(path.join(__dirname, "players"));
	for (let i = 0; i < players.length; i++) {
		let player = players[i].toLowerCase();
		if (playerName != null) {
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

module.exports = exports = Player;

//Player.InsertPlayers();