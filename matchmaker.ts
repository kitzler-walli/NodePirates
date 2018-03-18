import { Game } from "./game";
import * as fs from 'fs';
import * as Dockerode from 'dockerode';
import { MongoClient } from 'mongodb';
import * as tarfs from 'tar-fs';
import * as path from 'path';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

async function buildPlayerImages(rebuild: boolean = false, playerName: string | null = null) {
	//iterate through all player folders
	let players: Array<string> = fs.readdirSync("./players");
	for (let i = 0; i < players.length; i++) {
		let player = players[i];

		// skip the current folder if playerName does not match
		if (playerName != null && player !== playerName) {
			continue;
		}
		//check if image for player alread exists
		let info = await docker.listImages({ filter: 'nodepirates/' + player });
		if (info.length == 0) {
			//image does not exist -> create image from player-folder
			const pack = tarfs.pack(path.join(__dirname, '../players/' + player));
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

async function test() {
	console.log("Before");
	await buildPlayerImages(true);
	console.log("After");
}

async function PlayGame(player1: any, player2: any) {
	try {
		var container1 = await docker.createContainer({ Image: 'nodepirates/' + player1.name, ExposedPorts: { [player1.port + '/tcp']: {} }, HostConfig:{PortBindings: { [player1.port + '/tcp']: [{ 'HostPort': player1.port + '/tcp', 'HostIp':'127.0.0.1' }] }} });
		var container2 = await docker.createContainer({ Image: 'nodepirates/' + player2.name, ExposedPorts: { [player2.port + '/tcp']: {} }, HostConfig:{PortBindings: { [player2.port + '/tcp']: [{ 'HostPort': player2.port + '/tcp', 'HostIp':'127.0.0.1' }] } }});

		await container1.start();
		await container2.start();

		let game: Game = new Game(player1.port, player2.port);
		let result = await game.play();

		console.log(result);

		await container1.stop();
		await container2.stop();

		await container1.remove();
		await container2.remove();
	}
	catch (err) {
		console.log(err);
	}
}


async function InsertPlayers() {
	try {
		const client = await MongoClient.connect("mongodb://127.0.0.1:27017/nodepirates");
		const db = await client.db("nodepirates");
		const coll = await db.collection("players");

		await coll.insertOne({
			name: 'player1',
			environment: 'node:carbon',
			port: 8080
		});
		await coll.insertOne({
			name: 'player2',
			environment: 'node:carbon',
			port: 8080
		});
		await coll.insertOne({
			name: 'player-simple',
			environment: 'node:carbon',
			port: 8080
		});
		await coll.insertOne({
			name: 'player-simple-core',
			environment: 'microsoft/dotnet:sdk',
			port: 5000
		});

		await client.close();
	}
	catch (err) {
		console.log(err);
	}
}

// buildPlayerImages(true);

PlayGame({
	name: 'player1',
	environment: 'node:carbon-alpine',
	port: 8080
}, {
		name: 'player-simple-core',
		environment: 'microsoft/dotnet:sdk',
		port: 5000
	});

// let game: Game = new Game(5000, 8080);
// game.play();

/*docker.listContainers({all: true}, (err, container) => {
	console.log(container);
});*/





