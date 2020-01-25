'use strict';

const Game = require("./games/pirates/game");
const dockerode = require("dockerode");
const mongodb = require("mongodb");
const webRequest = require("web-request");
const async = require("async");
const settings = require("./settings");
const docker = new dockerode(settings.docker_connection_opts);

async function ready(port) {
	let retryCount = settings.wakeup_retry_count;
	while (retryCount > 0) {
		try {
			let reset = await webRequest.json('http://localhost:' + port + '/reset');
			return true;
		} catch (err) {
			// console.log(err);
			await sleep(settings.wakeup_wait_time);
			retryCount--;
		}
	}
	return false;
}

async function getContainer(player) {
	const container = await docker.createContainer({
		Image: 'nodepirates/' + player.name,
		HostConfig: {
			PortBindings: {[player.port + '/tcp']: [{'HostIp': '127.0.0.1'}]}
		}
	});
	await container.start();
	const containerData = await container.inspect();
	const port = containerData.NetworkSettings.Ports[Object.keys(containerData.NetworkSettings.Ports)[0]][0].HostPort;

	//TODO no cleanup when failing here
	// Check if the player is available by sending a reset call
	if (!await ready(port)) {
		throw ("Player '" + player.name + "' did not answer in a timely fashion");
	}

	return {
		container: container,
		port: port
	};
}

async function purgeContainer(container) {
	await container.container.stop();
	await container.container.remove();
}

class PlayerInstance {

	constructor(container) {
		this.container = container
	}

	async fire(body) {
		return await webRequest.json('http://localhost:' + this.container.port + '/fire', {
			headers: [{'Content-Type': 'application/json'}],
			method: 'POST',
			body: body
		});
	}

	async reset(body) {
		await webRequest.json('http://localhost:' + this.container.port + '/reset', {
			headers: [{'Content-Type': 'application/json'}],
			method: 'POST',
			body: body
		});
	}
}

async function playGame(player1, player2, db, gameIndex) {
	let container1, container2;
	try {
		//get container
		container1 = await getContainer(player1);
		container2 = await getContainer(player2);

		//play game
		try {
			let game = new Game(new PlayerInstance(container1), new PlayerInstance(container2));
			let result = await game.play();
			result.index = gameIndex;
			result.player1 = player1;
			result.player2 = player2;
			const gamesColl = await db.collection("games");
			await gamesColl.insertOne(result);
			//	console.dir(result,{depth:null});
		} catch (gameErr) {
			console.log(gameErr);
		}

	} catch (err) {
		console.log(err);
	} finally {
		if (container1) purgeContainer(container1);
		if (container2) purgeContainer(container2);
	}
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

let searchLock = false;

async function triggerMatchMaker() {
	if (!searchLock) {
		console.log("interval for triggerMatchMaker triggered");
		searchLock = true;
		try {
			await searchAndStartGames()
		} finally {
			searchLock = false;
		}
	}
}

async function loadData() {
	let client;
	try {
		client = await mongodb.MongoClient.connect(settings.db_connectionstring);
		const db = await client.db("nodepirates");

		const playersColl = await db.collection("players");
		const playersArr = await playersColl.find({}).toArray();
		const players = playersArr.reduce(function (map, obj) {
			map[obj.name] = obj;
			return map;
		}, {});

		const eventsColl = await db.collection("events");
		const events = await eventsColl.find({played: false}).toArray();

		return {players: players, events: events}
	} finally {
		if (client) await client.close();
	}

}

function getGamesToPlay(events, players) {
	let games = [];
	for (let i = 0; i < events.length; i++) {
		const event = events[i];
		for (let j = 0; j < settings.pvp_games_count; j++) {
			games.push(async () => {
				console.log("playing game " + j + " betweeen " + event.player1 + ' and ' + event.player2);
				const startGame = process.hrtime();
				await playGame(players[event.player1], players[event.player2], db, j);
				const diffGame = process.hrtime(startGame);
				console.log(j, diffGame);
			});
			//TODO await eventsColl.updateOne({ '_id': event._id }, { $set: { played: true } });
		}
	}
	return games;
}

async function runGames(games) {
	console.log("No of games: " + games.length);
	const gamesStartTime = process.hrtime();
	await new Promise((resolve, reject) => {
		async.parallelLimit(games, settings.parallel_games_count, () => resolve())
	});
	const totalGamesTime = process.hrtime(gamesStartTime);
	console.log("Total Time: ", totalGamesTime[0] + "s");
}

async function searchAndStartGames() {
	//search for all events that have not been played yet
	console.log("running searchAndStartGames");
	try {
		let {players, events} = await loadData();

		const games = getGamesToPlay(events, players);

		await runGames(games);
	} catch (err) {
		console.log(err);
	}
}

setInterval(() => triggerMatchMaker(), settings.triggerMatchMakerInterval);

module.exports = exports = {
	triggerMatchMaker: triggerMatchMaker()
};