import * as http from 'http';
import {Coordinate} from './coordinate';

const port = 8081;
const name = 'Player 2 - random';

let lastShot: Coordinate;
let shotHistory: Array<Coordinate> = new Array<Coordinate>();

function fire(body: { state: string, grid: any, ships: any }): Coordinate {
	//get battlefield size
	let xSize = body.grid.length;
	let ySize = body.grid[0].length;

	console.log('Searching for coordinate...');
	do {
		lastShot = <Coordinate>{
			x: Math.floor(Math.random() * xSize),
			y: Math.floor(Math.random() * ySize)
		};
		
	} while(shotHistory.map(function(e) { return e.x.toString() + e.y.toString(); }).indexOf(lastShot.x.toString() + lastShot.y.toString()) >= 0);

	//fire randomly
	// [Math.floor(Math.random() * xSize), Math.floor(Math.random() * ySize)];
	console.log(name + " fireing at " + lastShot.toString());
	shotHistory.push(lastShot);
	return lastShot;
}

http.createServer((request, response) => {
	const { headers, method, url } = request;

	if (method === 'POST' && url === '/fire') { // requested by matchmaker to get the players next move
		let temp: any;

		request.on('data', (body: any) => {
			temp = body;
		}).on('end', () => {
			let responseBody = JSON.parse(temp);
			//console.log(battlefield);

			response.on('error', (err) => {
				console.error(err);
			});

			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify(fire(responseBody)));
		});
	}
	else if (method === "POST" && url === '/initfield') { // requested by matchmaker to request the players positioning of the ships
		response.statusCode = 404;
		response.end();
	}
	else if( method === "POST" && url === "/reset") {
		shotHistory = new Array<Coordinate>();
		lastShot = new Coordinate();
		
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end();
	}
	else {
		response.statusCode = 404;
		response.end();
	}

	request.on('error', (err) => {
		console.error(err);
	});

}).listen(port);
console.log(name + " listeining on " + port);