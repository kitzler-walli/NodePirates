'use strict';

const Player = require('./player');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const os = require('os');
const mongo = require('./lib/service/mongo');
const app = express();
const ObjectID = require('mongodb').ObjectID;
const matchmaker = require('./matchmaker');

const port = process.env.NODE_PORT || 3000;
let client, pirateDB, player; // initialized via service

// configure app
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
app.use(fileUpload());

// defines routes (should be outsourced if long)
app.get('/', (req, res) => {
  res.render('pages/index', {name: 'World'});
});

app.get('/upload', (req, res) => {
  res.render('pages/upload');
});

app.post('/upload', (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded');
  }

  if (!req.files.file || !req.body.player_name) {
    return res.status(400).send('Missing one or more parameters');
  }

  const file = path.resolve(os.tmpdir(), req.files.file.name);
  req.files.file.mv(file, (err) => {
    if (!err) {
		player.createNew(file, req.body.player_name)
			.then(_ => res.redirect("/upload?success"));
	} else {
		console.log(err);
		res.redirect("/upload?error");
	}
  });
});

app.get('/matches', async (req, res) => {
	const matches = await pirateDB.collection('events').find({played: true}).toArray();
	res.locals = {
		matches: matches,
		games: null
	};
	res.render('pages/matches');
});

app.get('/matches/:id', async (req, res)=>{
	const selectedMatch = await pirateDB.collection('events').findOne({_id:new ObjectID(req.params.id)});
	const games = await pirateDB.collection('games').find({'player1.name':selectedMatch.player1, 'player2.name':selectedMatch.player2}).toArray();
	res.locals = {
		matches: null,
		match: selectedMatch,
		games: games
	};
	res.render('pages/matches');
});

app.get('/game/:id', async (req, res) => {
	const selectedGame = await pirateDB.collection('games').findOne({_id:new ObjectID(req.params.id)});
	res.locals = {
		game:selectedGame
	};
	res.render('pages/game');
});

app.get('/players', async (req, res) => {
	const players = await pirateDB.collection('players').find({}).toArray();
	res.locals = {
		players: players
	};
	res.render('pages/players');
});
app.get('/players/:id', async (req, res) => {
	const selectedPlayer = await pirateDB.collection('players').findOne({_id:new ObjectID(req.params.id)});
	res.locals = {
		player:selectedPlayer
	};
	res.render('pages/player');
});

// initialize service
(async () => {
  client = await mongo.connect();
  pirateDB = client.db('nodepirates');
  player = await Player.initFacade(pirateDB);

  app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
})();

// @TODO: on process sigint -> close app/client

matchmaker.startInterval();
