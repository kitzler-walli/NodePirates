import * as http from 'http';
import { Buffer } from 'buffer';

let lastShot:number[] = [];

http.createServer((request, response) => {
	const { headers, method, url } = request;

	if (method === 'POST' && url === '/fire') {
		let temp:any;
		
		request.on('data', (body: any) => {
			temp = body;
		}).on('end', () => {
			let battlefield = JSON.parse(temp);
			//console.log(battlefield);

			//get battlefield size
			let xSize = battlefield.grid.length;
			let ySize = battlefield.grid[0].length;

			response.on('error', (err) => {
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

	request.on('error', (err) => {
		console.error(err);
	});

}).listen(8080);
console.log("Player1 listeining on 8080");