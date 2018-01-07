"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var lastShot = [];
http.createServer(function (request, response) {
    var headers = request.headers, method = request.method, url = request.url;
    if (method === 'POST' && url === '/fire') {
        var temp_1;
        request.on('data', function (body) {
            temp_1 = body;
        }).on('end', function () {
            var battlefield = JSON.parse(temp_1);
            //console.log(battlefield);
            //get battlefield size
            var xSize = battlefield.grid.length;
            var ySize = battlefield.grid[0].length;
            response.on('error', function (err) {
                console.error(err);
            });
            response.writeHead(200, { 'Content-Type': 'application/json' });
            //fire randomly
            lastShot = [Math.floor(Math.random() * xSize), Math.floor(Math.random() * ySize)];
            console.log("Player1 fireing at " + lastShot);
            response.end(JSON.stringify(lastShot));
        });
    }
    else if (method === "POST" && url === '/initfield') {
    }
    else {
        response.statusCode = 404;
        response.end();
    }
    request.on('error', function (err) {
        console.error(err);
    });
}).listen(8080);
console.log("Player1 listeining on 8080");
