import { Ship } from './ship';
import { Coordinate } from './Coordinate';

// export enum FieldType {
// 	Unknown = 0,
// 	Water = 1,
// 	Hit = 2,
// 	Carrier = 5,
// 	Battleship = 6,
// 	Cruiser = 7,
// 	Submarine = 8,
// 	Destroyer = 9
// }
// export namespace FieldType {
// 	export function isShip(field: FieldType): boolean {
// 		switch (field) {
// 			case FieldType.Carrier:
// 			case FieldType.Battleship:
// 			case FieldType.Cruiser:
// 			case FieldType.Submarine:
// 			case FieldType.Destroyer:
// 				return true;
// 			default:
// 				return false;
// 		}
// 	}
// }

// export enum LastShotResultType {
// 	Water,
// 	Ship,
// 	ShipSunk,
// 	Win,
// 	Lost
// }

export class Grid {
	/*

	U ... Unknown
	W ... Water
	H ... ShipHit
	S ... ShipSunk
	P ... Ship ()

	-> x (first dimension)
	|  0 0 0 0 0 0 0 0 0 0
	\/ 0 0 0 0 0 0 0 0 0 0
	y  0 0 0 0 0 0 0 0 0 0
	   ...
	*/


	private grid: string[];
	private size: number;
	public State: string = "Running";
	public Ships: Ship[];
	private totalShots: number = 0;
	private shotHistory: Array<Coordinate>;

	public get TotalShots(): number {
		return this.totalShots;
	}

	constructor(gridSize: number) {
		this.grid = [];
		this.size = gridSize;
		this.shotHistory = new Array<Coordinate>();

		this.Ships = new Array<Ship>();
		this.Ships.push(new Ship(5, 'Carrier'));
		this.Ships.push(new Ship(4, 'Battleship'));
		this.Ships.push(new Ship(3, 'Cruiser'));
		this.Ships.push(new Ship(3, 'Submarine'));
		this.Ships.push(new Ship(2, 'Destroyer'));

		this.initGrid();
		this.placeShips();
		console.log(this.toString(true));
	}

	/**
	 * initializes the grid -> all fields with 'unknown'
	 */
	initGrid(): void {
		this.grid = [];

		for (let i = 0; i < Math.pow(this.size, 2); i++) {
			this.grid[i] = 'U';
		}
	}

	/**
	 * places the ships randomly on the grid
	 */
	placeShips(): void {
		for (let i = 0; i < this.Ships.length; i++) {
			let shipPlaced: boolean = false;
			while (!shipPlaced) {
				let ship = this.Ships[i];

				ship.Horizontal = Math.random() < 0.5;

				let xMax = ship.Horizontal ? this.size - ship.Size + 1 : this.size;
				let yMax = ship.Horizontal ? this.size : this.size - ship.Size + 1;

				ship.Coordinate.x = Math.floor(Math.random() * xMax);
				ship.Coordinate.y = Math.floor(Math.random() * yMax);

				if (!this.shipsOverlap(ship) && !this.checkShipAdjacent(ship)) {
					let gridIndex = ship.Coordinate.y * this.size + ship.Coordinate.x;
					for (let j = 0; j < ship.Size; j++) {
						this.grid[gridIndex] = 'P'; //ship.Name;
						gridIndex += ship.Horizontal ? 1 : this.size;
					}
					shipPlaced = true;
					ship.placed();
				}
			}
		}
	}

	/**
	 * checks if the ship is next to another one
	 * @param ship  
	 */
	checkShipAdjacent(ship: Ship): boolean {
		const x1 = ship.Coordinate.x - 1;
		const y1 = ship.Coordinate.y - 1;
		const x2 = ship.Horizontal ? ship.Coordinate.x + ship.Size : ship.Coordinate.x + 1;
		const y2 = ship.Horizontal ? ship.Coordinate.y + 1 : ship.Coordinate.y + ship.Size;

		for (let i = x1; i <= x2; i++) {
			if (i < 0 || i > this.size - 1) continue;
			for (let j = y1; j <= y2; j++) {
				if (j < 0 || j > this.size - 1) continue;
				if (this.grid[j * this.size + i] == 'P') {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Checks if the ship overlaps with another one in the grid
	 * @param ship 
	 */
	shipsOverlap(ship: Ship): boolean {
		let gridIndex = ship.Coordinate.y * this.size + ship.Coordinate.x;

		for (let i = 0; i < ship.Size; i++) {
			if (this.grid[gridIndex] == 'P') {
				return true;
			}
			gridIndex += ship.Horizontal ? 1 : this.size;
		}

		return false;
	}

	/**
	 * updates the grid according to the result of the shot
	 * @param x 
	 * @param y 
	 */
	shoot(c: Coordinate): void {
		this.totalShots++;
		this.shotHistory.push(c);

		switch (this.grid[c.x + (c.y * this.size)]) {
			case 'H':
				this.grid[c.x + (c.y * this.size)] = 'H';
				break;
			case 'S':
			case 'P':
				if (this.checkShipSunk(c)) {
					this.grid[c.x + (c.y * this.size)] = 'S';
				}
				else {
					this.grid[c.x + (c.y * this.size)] = 'H';
				}
				break;
			case 'W':
			case 'U':
				this.grid[c.x + (c.y * this.size)] = 'W';
				break;
			default:
				break;
		}
	}

	/**
	 * Checks if the current ship was sunk with last shot
	 * @param x 
	 * @param y 
	 * @param ship 
	 */
	checkShipSunk(c: Coordinate): boolean {
		for (let i = 0; i < this.Ships.length; i++) {
			if(this.Ships[i].isHit(c)){
				return this.Ships[i].isSunk();
			}
		}
		return false;
	}

	allShipsDestroyed(): boolean {
		for (let i = 0; i < Math.pow(this.size, 2); i++) {
			if (this.grid[i] == 'P') {
				return false;
			}
		}
		return true;
	}

	/**
	 * for console output of the grid
	 * @param showShips - hide the ships by default
	 */
	toString(showShips: boolean = false): string {
		let val: string = '';
		let gridCopy = this.toggleShips(showShips);

		for (let i = 0; i < Math.pow(this.size, 2); i++) {
			val += gridCopy[i].toString() + ' ';
			if (i > 0 && (i + 1) % this.size == 0) {
				val += '\n';
			}
		}

		return val;
	}

	/**
	 * returns the grid as json string
	 * @param showShips - hide the ships by default
	 */
	toJson(showShips: boolean = false): string {
		let gridCopy = this.toggleShips(showShips);
		return JSON.stringify(gridCopy);
	}

	toArray(showShips: boolean = false): string[][] {
		let gridCopy = this.toggleShips(showShips);
		let arr: string[][] = new Array<Array<string>>();

		for (let i = 0; i < this.size; i++) {
			arr[i] = new Array<string>();
			for (let j = 0; j < this.size; j++) {
				arr[i][j] = gridCopy[j * this.size + i];
			}
		}

		return arr;
	}

	/**
	 * Hides the ships in the grid to show it to the opponent
	 * @param showShips - hide the ships by default
	 */
	toggleShips(showShips: boolean = false): string[] {
		let gridCopy = this.grid.slice();

		if (!showShips) {
			for (let i = 0; i < Math.pow(this.size, 2); i++) {
				if (gridCopy[i] == 'P') {
					gridCopy[i] = 'U';
				}
			}
		}

		return gridCopy;
	}

	toBody(): any {
		return {
			state: this.State,
			grid: this.toArray(),
			ships: this.Ships.map(function(s){
				return <Ship> {
					Name: s.Name,
					Size: s.Size,
					Sunk: s.Sunk
				};
			})
		};
	}
}