import { fail } from "assert";
import { Ship } from './ship';

export enum FieldType {
	Unknown = 0,
	Water = 1,
	Hit = 2,
	Carrier = 5,
	Battleship = 6,
	Cruiser = 7,
	Submarine = 8,
	Destroyer = 9
}
export namespace FieldType {
	export function isShip(field: FieldType): boolean {
		switch (field) {
			case FieldType.Carrier:
			case FieldType.Battleship:
			case FieldType.Cruiser:
			case FieldType.Submarine:
			case FieldType.Destroyer:
				return true;
			default:
				return false;
		}
	}
}

export enum LastShotResultType {
	Water,
	Ship,
	ShipSunk,
	Win,
	Lost
}

export class Grid {
	/*

	-> x (first dimension)
	|  0 0 0 0 0 0 0 0 0 0
	\/ 0 0 0 0 0 0 0 0 0 0
	y  0 0 0 0 0 0 0 0 0 0
	   ...
	*/


	private grid: FieldType[];
	private size: number;
	public ShotResult: LastShotResultType;
	private ships: Ship[];
	private totalShots:number = 0;
	public get TotalShots():number {
		return this.totalShots;
	}

	constructor(gridSize: number) {
		this.size = gridSize;

		this.ships = new Array<Ship>();
		this.ships.push(new Ship(5, FieldType.Carrier));
		this.ships.push(new Ship(4, FieldType.Battleship));
		this.ships.push(new Ship(3, FieldType.Cruiser));
		this.ships.push(new Ship(3, FieldType.Submarine));
		this.ships.push(new Ship(2, FieldType.Destroyer));

		this.initGrid();
		this.placeShips();
	}

	/**
	 * initializes the grid -> all fields with 'unknown'
	 */
	initGrid(): void {
		this.grid = [];

		for (let i = 0; i < Math.pow(this.size, 2); i++) {
			this.grid[i] = FieldType.Unknown;
		}
	}

	/**
	 * places the ships randomly on the grid
	 */
	placeShips(): void {
		for (let i = 0; i < this.ships.length; i++) {
			let shipPlaced: boolean = false;
			while (!shipPlaced) {
				let ship = this.ships[i];

				ship.Horizontal = Math.random() < 0.5;

				let xMax = ship.Horizontal ? this.size - ship.Size + 1 : this.size;
				let yMax = ship.Horizontal ? this.size : this.size - ship.Size + 1;

				ship.X = Math.floor(Math.random() * xMax);
				ship.Y = Math.floor(Math.random() * yMax);

				if (!this.shipsOverlap(ship) && !this.checkShipAdjacent(ship)) {
					let gridIndex = ship.Y * this.size + ship.X;
					for (let j = 0; j < ship.Size; j++) {
						this.grid[gridIndex] = ship.Name;
						gridIndex += ship.Horizontal ? 1 : this.size;
					}
					shipPlaced = true;
				}
			}
		}
	}

	/**
	 * checks if the ship is next to another one
	 * @param ship  
	 */
	checkShipAdjacent(ship: Ship): boolean {
		const x1 = ship.X - 1;
		const y1 = ship.Y - 1;
		const x2 = ship.Horizontal ? ship.X + ship.Size : ship.X + 1;
		const y2 = ship.Horizontal ? ship.Y + 1 : ship.Y + ship.Size;

		for (let i = x1; i <= x2; i++) {
			if (i < 0 || i > this.size - 1) continue;
			for (let j = y1; j <= y2; j++) {
				if (j < 0 || j > this.size - 1) continue;
				if (FieldType.isShip(this.grid[j * this.size + i])) {
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
		let gridIndex = ship.Y * this.size + ship.X;

		for (let i = 0; i < ship.Size; i++) {
			if (FieldType.isShip(this.grid[gridIndex])) {
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
	shoot(x: number, y: number): void {
		this.totalShots++;

		switch (this.grid[x + (y * this.size)]) {
			case FieldType.Hit:
				this.ShotResult = LastShotResultType.Ship;
				break;
			case FieldType.Carrier:
			case FieldType.Battleship:
			case FieldType.Cruiser:
			case FieldType.Submarine:
			case FieldType.Destroyer:
				let ship = this.grid[x + (y * this.size)];
				this.grid[x + (y * this.size)] = FieldType.Hit;
				if (this.checkShipSunk(ship)) {
					this.ShotResult = LastShotResultType.ShipSunk;
				}
				else {
					this.ShotResult = LastShotResultType.Ship;
				}
				break;
			case FieldType.Water:
			case FieldType.Unknown:
				this.grid[x + (y * this.size)] = FieldType.Water;
				this.ShotResult = LastShotResultType.Water;
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
	checkShipSunk(ship:FieldType): boolean {
		for (let i = 0; i < Math.pow(this.size, 2); i++) {
			if(this.grid[i] === ship){
				return false;
			}
		}
		return true;
	}

	allShipsDestroyed():boolean{
		for (let i = 0; i < Math.pow(this.size, 2); i++) {
			if(FieldType.isShip(this.grid[i])){
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
			val += gridCopy[i].toString();
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

	toArray(showShips: boolean = false): FieldType[][] {
		let gridCopy = this.toggleShips(showShips);
		let arr: FieldType[][] = new Array<Array<FieldType>>();

		for (let i = 0; i < this.size; i++) {
			arr[i] = new Array<FieldType>();
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
	toggleShips(showShips: boolean = false): FieldType[] {
		let gridCopy = this.grid.slice();

		if (!showShips) {
			for (let i = 0; i < Math.pow(this.size, 2); i++) {
				if (FieldType.isShip(gridCopy[i])) {
					gridCopy[i] = FieldType.Unknown;
				}
			}
		}

		return gridCopy;
	}

	toBody():any {
		return {
			shotresult: this.ShotResult,
			grid: this.toArray()
		};
	}
}