const mongodb = require("mongodb");
const fs = require("fs");
const Dockerode = require("dockerode");
const tarfs = require("tar-fs");
const path = require("path");
const WebRequest = require("web-request");
const settings = require("./settings");
const docker = new Dockerode({ socketPath: settings.docker_socketPath });
const unzip = require('./lib/unzip');

class PlayerFacade {

  /**
   * @param {Collection} players
   * @param {Collection} events
   */
  constructor(players, events) {
    this.players = players;
    this.events = events;
  }

  static async create(db) {
    const players = await db.collection('players');
    const events = await db.collection('events');

    return new PlayerFacade(players, events);
  }

   async CreateNew(zipFile, name, platform, port) {
  	try {
      const dir = await unzip(name, zipFile);
      // @TODO create dockerfile

  		await this.players.insertOne({name, port});

      // register new player in event queue
  		const otherPlayers = await this.players.find({name: {'$ne':name }}).toArray();
  		const events = [];

  		for (let i = 0; i < otherPlayers.length; i++){
  			events.push({ insertOne:{
  				player1: name,
  				player2: otherPlayers[i].name,
  				played: false
  			}});
  		}

  		if (events.length) {
  			await this.events.bulkWrite(events);
  		}
  	}
  	catch (err) {
  		console.log(err);
  	}
  }

  async buildPlayerImages(rebuild = false, playerName = null) {
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
}
module.exports = exports = PlayerFacade;
