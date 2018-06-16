"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var Coordinate_1 = require("./Coordinate");
var port = 8081;
var name = 'Player 2 - random';
var lastShot;
var shotHistory = new Array();
function fire(body) {
    //get battlefield size
    var xSize = body.grid.length;
    var ySize = body.grid[0].length;
    console.log('Searching for coordinate...');
    do {
        lastShot = {
            x: Math.floor(Math.random() * xSize),
            y: Math.floor(Math.random() * ySize)
        };
    } while (shotHistory.map(function (e) { return e.x.toString() + e.y.toString(); }).indexOf(lastShot.x.toString() + lastShot.y.toString()) >= 0);
    //fire randomly
    // [Math.floor(Math.random() * xSize), Math.floor(Math.random() * ySize)];
    console.log(name + " fireing at " + lastShot.toString());
    shotHistory.push(lastShot);
    return lastShot;
}
http.createServer(function (request, response) {
    var headers = request.headers, method = request.method, url = request.url;
    if (method === 'POST' && url === '/fire') {
        var temp_1;
        request.on('data', function (body) {
            temp_1 = body;
        }).on('end', function () {
            var responseBody = JSON.parse(temp_1);
            //console.log(battlefield);
            response.on('error', function (err) {
                console.error(err);
            });
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(fire(responseBody)));
        });
    }
    else if (method === "POST" && url === '/initfield') {
        response.statusCode = 404;
        response.end();
    }
    else if (method === "POST" && url === "/reset") {
        shotHistory = new Array();
        lastShot = new Coordinate_1.Coordinate();
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end();
    }
    else {
        response.statusCode = 404;
        response.end();
    }
    request.on('error', function (err) {
        console.error(err);
    });
}).listen(port);
console.log(name + " listening on " + port);
//# sourceMappingURL=player1.js.map