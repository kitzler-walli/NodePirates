const ship = require("./ship");
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
class Grid {
    constructor(gridSize) {
        this.state = "Running";
        this.totalShots = 0;
        this.grid = [];
        this.size = gridSize;
        this.ships = new Array();
        this.ships.push(new ship(5, 'Carrier'));
        this.ships.push(new ship(4, 'Battleship'));
        this.ships.push(new ship(3, 'Cruiser'));
        this.ships.push(new ship(3, 'Submarine'));
        this.ships.push(new ship(2, 'Destroyer'));
        this.initGrid();
        this.placeShips();
        //console.log(this.toString(true));
    }

	/**
     * initializes the grid -> all fields with 'unknown'
     */
    initGrid() {
        this.grid = [];
        for (let i = 0; i < Math.pow(this.size, 2); i++) {
            this.grid[i] = 'U';
        }
    }
    /**
     * places the ships randomly on the grid
     */
    placeShips() {
        for (let i = 0; i < this.ships.length; i++) {
            let shipPlaced = false;
            while (!shipPlaced) {
                let ship = this.ships[i];
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
    checkShipAdjacent(ship) {
        const x1 = ship.Coordinate.x - 1;
        const y1 = ship.Coordinate.y - 1;
        const x2 = ship.Horizontal ? ship.Coordinate.x + ship.Size : ship.Coordinate.x + 1;
        const y2 = ship.Horizontal ? ship.Coordinate.y + 1 : ship.Coordinate.y + ship.Size;
        for (let i = x1; i <= x2; i++) {
            if (i < 0 || i > this.size - 1)
                continue;
            for (let j = y1; j <= y2; j++) {
                if (j < 0 || j > this.size - 1)
                    continue;
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
    shipsOverlap(ship) {
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
    shoot(c) {
        this.totalShots++;
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
    checkShipSunk(c) {
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].isHit(c)) {
                return this.ships[i].isSunk();
            }
        }
        return false;
    }
    allShipsDestroyed() {
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
    toString(showShips = false) {
        let val = '';
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
    toJson(showShips = false) {
        let gridCopy = this.toggleShips(showShips);
        return JSON.stringify(gridCopy);
    }
    toArray(showShips = false) {
        let gridCopy = this.toggleShips(showShips);
        let arr = new Array();
        for (let i = 0; i < this.size; i++) {
            arr[i] = new Array();
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
    toggleShips(showShips = false) {
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
    toBody() {
        return {
            state: this.state,
            grid: this.toArray(),
            ships: this.ships.map(function (s) {
                return {
                    Name: s.Name,
                    Size: s.Size,
                    Sunk: s.Sunk
                };
            })
        };
    }
}
module.exports = exports = Grid;