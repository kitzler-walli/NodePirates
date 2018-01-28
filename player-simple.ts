import * as http from 'http';
import { Coordinate } from './Coordinate';
import { Ship } from './ship';
import { throws } from 'assert';

const port = 8080;
const name = 'KW Simple Player';

enum ModeEnum {
	Unknown,
	Cross1,
	Cross2,
	Search,
	AttackBoat
}

enum DirectionEnum {
	Unknown,
	North,
	East,
	South,
	West
}

let mode: ModeEnum = ModeEnum.Unknown;
let crossX: number = -1;
let oldMode: ModeEnum;
let direction: DirectionEnum = DirectionEnum.Unknown;
let lastHit: Coordinate;
let firstHit: Coordinate;
let totalHits: number = 0;
let lastShot: Coordinate;
let ships: Array<Ship>;

function handleState(field: any) {
	if(!lastShot) return;

	const lastFieldState = field[lastShot.X][lastShot.Y];

	console.log("Last Shot Result: " + lastFieldState);

	switch (lastFieldState) {
		case 'H':
			if (mode != ModeEnum.AttackBoat) {
				oldMode = mode;
				mode = ModeEnum.AttackBoat;
				firstHit = lastShot;
			}
			lastHit = lastShot;
			break;
		case 'S':
			mode = oldMode;
			oldMode = ModeEnum.Unknown;
			direction = DirectionEnum.Unknown;
			lastHit = Coordinate.Empty;
			firstHit = Coordinate.Empty;
			break;
		case 'W':
			//continue in current mode;
			if (mode == ModeEnum.AttackBoat) {
				//Change Direction - to opposite
				lastHit = firstHit;

				//int corner = CheckCorner(lastHit);
				getNextDirection(field);
			}
			break;
	}
}

function oppositePossible(field: any): boolean {
	if ((direction == DirectionEnum.North && firstHit!.Y == 9) ||
		(direction == DirectionEnum.East && firstHit!.X == 0) ||
		(direction == DirectionEnum.South && firstHit!.Y == 0) ||
		(direction == DirectionEnum.West && firstHit!.X == 9)) {
		//System.Diagnostics.Debug.WriteLine(direction.ToString());
		//System.Diagnostics.Debug.WriteLine("OppNotPoss-1 X:" + firstHit.X + " Y:" + firstHit.Y);
		return false;
	}
	if ((direction == DirectionEnum.North && checkState(field, getPointDirection(firstHit, DirectionEnum.South)) != "U") ||
		(direction == DirectionEnum.East && checkState(field, getPointDirection(firstHit, DirectionEnum.West)) != "U") ||
		(direction == DirectionEnum.South && checkState(field, getPointDirection(firstHit, DirectionEnum.North)) != "U") ||
		(direction == DirectionEnum.West && checkState(field, getPointDirection(firstHit, DirectionEnum.East)) != "U")) {
		//System.Diagnostics.Debug.WriteLine(direction.ToString());
		//System.Diagnostics.Debug.WriteLine("OppNotPoss-2 X:" + firstHit.X + " Y:" + firstHit.Y);
		return false;
	}
	return true;
}

function checkState(field: any, coord: Coordinate): string {
	return field[coord.X][coord.Y];
}

function getPointDirection(coord: Coordinate, direction: DirectionEnum): Coordinate {
	switch (direction) {
		case DirectionEnum.North:
			return <Coordinate>{ X: coord.X, Y: Math.max(coord.Y - 1, 0) };
		case DirectionEnum.East:
			return <Coordinate>{ X: Math.min(coord.X + 1, 9), Y: coord.Y };
		case DirectionEnum.South:
			return <Coordinate>{ X: coord.X, Y: Math.min(coord.Y + 1, 9) };
		case DirectionEnum.West:
			return <Coordinate>{ X: Math.max(coord.X - 1, 0), Y: coord.Y };
		default:
			return new Coordinate();
	}
}

function checkAcross(field: any, direction: DirectionEnum): void {
	switch (direction) {
		case DirectionEnum.North:
		case DirectionEnum.South:

			if (lastHit.X == 9)
				direction = DirectionEnum.West;
			else if (lastHit.X == 0)
				direction = DirectionEnum.East;
			else if (checkState(field, getPointDirection(lastHit, DirectionEnum.East)) != "U")
				direction = DirectionEnum.West;
			else
				direction = DirectionEnum.East;
			break;
		case DirectionEnum.East:
		case DirectionEnum.West:
			if (lastHit.Y == 9)
				direction = DirectionEnum.North;
			else if (lastHit.Y == 0)
				direction = DirectionEnum.South;
			else if (checkState(field, getPointDirection(lastHit, DirectionEnum.South)) != "U")
				direction = DirectionEnum.North;
			else
				direction = DirectionEnum.South;
			break;
	}
}

function getNextDirection(field: any): void {
	switch (direction) {
		case DirectionEnum.North:
			if (oppositePossible(field))
				direction = DirectionEnum.South;
			else {
				//System.Diagnostics.Debug.WriteLine(direction.ToString());
				//System.Diagnostics.Debug.WriteLine("NextDir-N X:" + lastHit.X + " Y:" + lastHit.Y);
				checkAcross(field, direction);
			}
			break;
		case DirectionEnum.East:
			if (oppositePossible(field))
				direction = DirectionEnum.West;
			else {
				//System.Diagnostics.Debug.WriteLine(direction.ToString());
				//System.Diagnostics.Debug.WriteLine("NextDir-E X:" + lastHit.X + " Y:" + lastHit.Y);
				checkAcross(field, direction);
			}
			break;
		case DirectionEnum.South:
			if (oppositePossible(field))
				direction = DirectionEnum.North;
			else {
				//System.Diagnostics.Debug.WriteLine(direction.ToString());
				//System.Diagnostics.Debug.WriteLine("NextDir-S X:" + lastHit.X + " Y:" + lastHit.Y);
				checkAcross(field, direction);
			}
			break;
		case DirectionEnum.West:
			if (oppositePossible(field))
				direction = DirectionEnum.East;
			else {
				//System.Diagnostics.Debug.WriteLine(direction.ToString());
				//System.Diagnostics.Debug.WriteLine("NextDir-W X:" + lastHit.X + " Y:" + lastHit.Y);
				checkAcross(field, direction);
			}
			break;
		default:
			mode = oldMode;
			break;
	}
}

function getNext(playingField: any, c: Coordinate): Coordinate {
	switch (mode) {
		case ModeEnum.AttackBoat:
			if (direction == DirectionEnum.Unknown) {
				if (((firstHit.X + 1) <= 9) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.East)) == "U")
					direction = DirectionEnum.East;
				else if (((lastHit.Y + 1) <= 9) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.South)) == "U")
					direction = DirectionEnum.South;
				else if (((lastHit.X - 1) >= 0) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.West)) == "U")
					direction = DirectionEnum.West;
				else if (((lastHit.Y - 1) >= 0) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.North)) == "U")
					direction = DirectionEnum.North;
				else
					throws;
			}

			c = nextAttack(playingField, c);

			break;
		case ModeEnum.Cross1:
			if (crossX < 9) {
				crossX++;
				c = <Coordinate>{ X: crossX, Y: crossX };
			}
			else {
				crossX = -1;
				mode = ModeEnum.Cross2;
				c = getNext(playingField, c);
			}
			break;
		case ModeEnum.Cross2:
			if (crossX < 9) {
				crossX++;
				c = <Coordinate>{ X: crossX, Y: 9 - crossX };
			}
			else {
				mode = ModeEnum.Search;
				c = getNext(playingField, c);
			}
			break;
		case ModeEnum.Search:
			let max: number = getLargestShipToFind(playingField);
			if (max != 0) {
				let list: Array<Coordinate> = new Array<Coordinate>();

				// Check vertically
				for (let x = 0; x < playingField.length; x++) {
					let len: number = 0;
					let firstPos: number[] = [];
					for (let y = 0; y < playingField[x].length; y++) {
						if (checkState(playingField, <Coordinate>{ X: x, Y: y }) == "U" && !nextToShip(<Coordinate>{ X: x, Y: y }, playingField)) {
							if (firstPos == null)
								firstPos = [x, y];
							len++;
						}
						else if (!(checkState(playingField, <Coordinate>{ X: x, Y: y }) == "U" && !nextToShip(<Coordinate>{ X: x, Y: y }, playingField))) {
							if (len > 0) {
								if (len >= max) {
									//return new Coordinates(firstPos.X, firstPos.Y + (len / 2));
									list.push(<Coordinate>{ X: firstPos[0], Y: firstPos[1] + (len / 2) });
								}
								len = 0;
								firstPos = [];
							}
						}
						if (y == 9) {
							if (len > 0) {
								if (len >= max) {
									//return new Coordinates(firstPos.X, firstPos.Y + (len / 2));
									list.push(<Coordinate>{ X: firstPos[0], Y: firstPos[1] + (len / 2) });
								}
								len = 0;
								firstPos = [];
							}
						}
					}
				}
				//Check horizontally
				for (let y = 0; y < playingField.length; y++) {
					let len: number = 0;
					let firstPos: number[] = [];
					for (let x = 0; x < playingField.length; x++) {
						if (checkState(playingField, <Coordinate>{ X: x, Y: y }) == "U" && !nextToShip(<Coordinate>{ X: x, Y: y }, playingField)) {
							if (firstPos == null)
								firstPos = [x, y];
							len++;
						}
						else if (!(checkState(playingField, <Coordinate>{ X: x, Y: y }) == "U" && !nextToShip(<Coordinate>{ X: x, Y: y }, playingField))) {
							if (len > 0) {
								if (len >= max) {
									//return new Coordinates(firstPos.X + (len / 2), firstPos.Y);
									list.push(<Coordinate>{ X: firstPos[0] + (len / 2), Y: firstPos[1] });
								}
								len = 0;
								firstPos = [];
							}
						}
						if (x == 9) {
							if (len > 0) {
								if (len >= max) {
									//return new Coordinates(firstPos.X + (len / 2), firstPos.Y);
									list.push(<Coordinate>{ X: firstPos[0] + (len / 2), Y: firstPos[1] });
								}
								len = 0;
								firstPos = [];
							}
						}
					}
				}
				return list[Math.floor(Math.random() * (list.length - 1))];
			}

			break;
	}
	return c;
}

function getLargestShipToFind(field: any): number {
	let max: number = 0;

	for(let i = 0;i<ships.length;i++){
		if(!ships[i].Sunk && ships[i].Size > max){
			max = ships[i].Size;
		}
	}

	return max;
}

function nextAttack(playingField: any, c: Coordinate) {
	switch (direction) {
		case DirectionEnum.North:
			if (lastHit.Y == 0 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.North)) != "U") {
				//System.Diagnostics.Debug.WriteLine("NextAtt-N X:" + lastHit.X + " Y:" + lastHit.Y);
				lastHit = firstHit;
				getNextDirection(playingField);
				c = nextAttack(playingField, c);
			}
			else
				c = getPointDirection(lastHit, DirectionEnum.North);
			break;
		case DirectionEnum.East:
			if (lastHit.X == 9 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.East)) != "U") {
				//System.Diagnostics.Debug.WriteLine("NextAtt-E X:" + lastHit.X + " Y:" + lastHit.Y);
				lastHit = firstHit;
				getNextDirection(playingField);
				c = nextAttack(playingField, c);
			}
			else
				c = getPointDirection(lastHit, DirectionEnum.East);
			break;
		case DirectionEnum.South:
			if (lastHit.Y == 9 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.South)) != "U") {
				//System.Diagnostics.Debug.WriteLine("NextAtt-S X:" + lastHit.X + " Y:" + lastHit.Y);
				lastHit = firstHit;
				getNextDirection(playingField);
				c = nextAttack(playingField, c);
			}
			else
				c = getPointDirection(lastHit, DirectionEnum.South);
			break;
		case DirectionEnum.West:
			if (lastHit.X == 0 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.West)) != "U") {
				//System.Diagnostics.Debug.WriteLine("NextAtt-W X:" + lastHit.X + " Y:" + lastHit.Y);
				lastHit = firstHit;
				getNextDirection(playingField);
				c = nextAttack(playingField, c);
			}
			else
				c = getPointDirection(lastHit, DirectionEnum.West);
			break;
		default:
			mode = oldMode;
			c = getNext(playingField, c);
			break;
	}
	return c;
}

function nextToShip(c: Coordinate, field: any): boolean {
	if (mode != ModeEnum.AttackBoat) {
		for (let i = Math.max(c.X - 1, 0); i <= Math.min(c.X + 1, 9); i++) {
			for (let j = Math.max(c.Y - 1, 0); j <= Math.min(c.Y + 1, 9); j++) {
				if (checkState(field, <Coordinate>{ X: i, Y: j }) == "H")
					return true;
			}
		}
	}
	return false;
}

function fire(body: { state: string, grid: any, ships: Array<Ship> }): Coordinate {
	if (mode == ModeEnum.Unknown) {
		mode = ModeEnum.Cross1;
	}

	let coord: Coordinate = new Coordinate();
	ships = body.ships;

	handleState(body.grid);

	do {
		coord = getNext(body.grid, coord);
	}
	while (coord == Coordinate.Empty || checkState(body.grid, coord) != "U" || nextToShip(coord, body.grid));
	// Fire at the calculated square
	//System.Diagnostics.Debug.WriteLine("Fired at: x:" + c.X + " Y:" + c.Y);
	totalHits++;
	lastShot = coord;
	console.log(name + " fireing at " + lastShot.toString());
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
		mode = ModeEnum.Unknown;
		crossX = -1;
		oldMode= ModeEnum.Unknown;
		direction = DirectionEnum.Unknown;
		lastHit= Coordinate.Empty;
		firstHit= Coordinate.Empty;
		totalHits = 0;
		lastShot= Coordinate.Empty;
		
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