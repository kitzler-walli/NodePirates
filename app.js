'use strict';


const express = require('express');
const app = express();

const port = process.env.NODE_PORT || 3000;

// configure app
app.set('view engine', 'ejs');

// defines routes (should be outsourced if long)
app.get('/', (req, res) => {
  res.render('index', {name: 'World'});
});


// start server
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
