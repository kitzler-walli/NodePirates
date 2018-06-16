'use strict';


const express = require('express');
const app = express();

const port = process.env.NODE_PORT || 3000;

// configure app
app.set('view engine', 'ejs');
app.use(express.static('public'));

// defines routes (should be outsourced if long)
app.get('/', (req, res) => {
  res.render('pages/index', {name: 'World'});
});

app.get('/upload', (req, res) => {
  res.render('pages/upload');
});


// start server
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
