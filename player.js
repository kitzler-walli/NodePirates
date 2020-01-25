const fs = require("fs");
const dockerode = require("dockerode");
const tarfs = require("tar-fs");
const settings = require("./settings");
const unzip = require('./lib/unzip');
const renderer = require('./lib/dockerfile-renderer');
const matchmaker = require('./matchmaker');
const rimraf = require('rimraf');

const docker = new dockerode(settings.docker_connection_opts);

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
	 * @param {number} port on which port is the project listening on?
	 */
	async createNew(zipFile, name, platform, port) {
		//TODO set player not ready and ready after building the image
		try {
			let dir = zipFile + "_extracted";
			await unzip(dir, zipFile);
			const dockerfile = await renderer.render(platform, port);

			fs.writeFileSync(dir + '/Dockerfile', dockerfile);
			await this.rebuildPlayerImage(dir, name);
			rimraf.sync(dir);
			rimraf.sync(zipFile);

			await this.players.insertOne({name, port});
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

	async rebuildPlayerImage(buildFolder, player) {
		const pack = tarfs.pack(buildFolder);
		let stream = await docker.buildImage(pack, {t: this.getImageName(player)});
		await new Promise((resolve) => {
			stream.pipe(process.stdout, {
				end: true
			});
			stream.on('end', function () {
				resolve();
			});
		});
	}

	getImageName(playerName) {
		return 'nodepirates/' + playerName + ":latest";
	}
}

module.exports = exports = PlayerFacade;
