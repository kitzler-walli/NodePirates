const dockerode = require("dockerode");
const tarfs = require("tar-fs");
const settings = require("./settings");
const unzip = require('./lib/unzip');
const matchmaker = require('./matchmaker');
const rimraf = require('rimraf');
const endOfLine = require('os').EOL;

const docker = new dockerode(settings.docker_connection_opts);
const dockerHelper = require('./lib/docker');

class PlayerFacade {

	/**
	 * @param {Collection} players
	 * @param {Collection} events
	 */
	constructor(players, events) {
		this.players = players;
		this.events = events;
	}

	static async initFacade(db) {
		const players = await db.collection('players');
		const events = await db.collection('events');

		return new PlayerFacade(players, events);
	}

	/**
	 * Creates a new Player, prepares Dockerfile and enqueues him to playing queue.
	 * @param {string} zipFile path to zipfile
	 * @param {string} name of player
	 * @param {string} platform used in project
	 */
	async createNew(zipFile, name, platform) {
		//TODO set player not ready and ready after building the image
		try {
			let dir = zipFile + "_extracted";
			await unzip(dir, zipFile);

			await this.rebuildPlayerImage(dir, name);
			rimraf.sync(dir);
			rimraf.sync(zipFile);

			await this.players.insertOne({name});
			await this.enqueue(name);
			matchmaker.triggerMatchMaker(); //no await, only trigger
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * enqueues a new player to event queue
	 */
	async enqueue(name) {
		//TODO lock
		let eventSelector = {'$or': [{player1: name}, {player2: name}]};
		const otherPlayers = await this.players.find({name: {'$ne': name}}).toArray();
		await this.events.updateMany(eventSelector, {$set: {played: false}});
		const existingEvents = await this.events.find(eventSelector).toArray();
		const existingEventPlayers = existingEvents.map(event => {
			return event.player1 === name ? event.player2 : event.player1;
		});

		const newEvents = [];
		for (let i = 0; i < otherPlayers.length; i++) {
			if (!existingEventPlayers.includes(otherPlayers[i].name)) {
				newEvents.push({
					insertOne: {
						player1: name,
						player2: otherPlayers[i].name,
						played: false
					}
				});
			}
		}

		if (newEvents.length) {
			await this.events.bulkWrite(newEvents);
		}
	}

	async rebuildPlayerImage(buildFolder, playerName) {
		//TODO pipe log into mongodb
		const pack = tarfs.pack(buildFolder);
		let stream = await docker.buildImage(pack, {t: dockerHelper.getImageName(playerName)});
		let buildLogBuffer = await this.readStreamAsBuffer(stream);
		let decodedBuildLog = this.decodeBuildLog(buildLogBuffer.toString());

		await this.players.updateOne({name: playerName}, {$set: {lastBuildLog: decodedBuildLog}});
	}

	async readStreamAsBuffer(stream) {
		const chunks = [];
		return new Promise((resolve) => {
			stream.on('data', function (chunk) {
				chunks.push(chunk);
			});
			stream.on('end', function () {
				resolve(Buffer.concat(chunks));
			});
		});
	}

	decodeBuildLog(buildLogStream) {
		return buildLogStream
			.split(endOfLine)
			.filter(line => line.length > 0)
			.map(line => JSON.parse(line))
			.filter(line => Object.keys(line).includes("stream"))
			.map(line => line["stream"])
			.join("");
	}
}

module.exports = exports = PlayerFacade;
