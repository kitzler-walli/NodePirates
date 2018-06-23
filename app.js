'use strict';


const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();

const port = process.env.NODE_PORT || 3000;

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

  if (!req.files.file || !req.body.player_name || !req.body.environment || !req.body.port) {
    return res.status(400).send('Missing one or more parameters');
  }

  res.send('ok');
});


// start server
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
