"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ship_1 = require("./ship");
var FieldType;
(function (FieldType) {
    FieldType[FieldType["Unknown"] = 0] = "Unknown";
    FieldType[FieldType["Water"] = 1] = "Water";
    FieldType[FieldType["Hit"] = 2] = "Hit";
    FieldType[FieldType["Carrier"] = 5] = "Carrier";
    FieldType[FieldType["Battleship"] = 6] = "Battleship";
    FieldType[FieldType["Cruiser"] = 7] = "Cruiser";
    FieldType[FieldType["Submarine"] = 8] = "Submarine";
    FieldType[FieldType["Destroyer"] = 9] = "Destroyer";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
(function (FieldType) {
    function isShip(field) {
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
    FieldType.isShip = isShip;
})(FieldType = exports.FieldType || (exports.FieldType = {}));
var LastShotResultType;
(function (LastShotResultType) {
    LastShotResultType[LastShotResultType["Water"] = 0] = "Water";
    LastShotResultType[LastShotResultType["Ship"] = 1] = "Ship";
    LastShotResultType[LastShotResultType["ShipSunk"] = 2] = "ShipSunk";
    LastShotResultType[LastShotResultType["Win"] = 3] = "Win";
    LastShotResultType[LastShotResultType["Lost"] = 4] = "Lost";
})(LastShotResultType = exports.LastShotResultType || (exports.LastShotResultType = {}));
var Grid = /** @class */ (function () {
    function Grid(gridSize) {
        this.totalShots = 0;
        this.size = gridSize;
        this.ships = new Array();
        this.ships.push(new ship_1.Ship(5, FieldType.Carrier));
        this.ships.push(new ship_1.Ship(4, FieldType.Battleship));
        this.ships.push(new ship_1.Ship(3, FieldType.Cruiser));
        this.ships.push(new ship_1.Ship(3, FieldType.Submarine));
        this.ships.push(new ship_1.Ship(2, FieldType.Destroyer));
        this.initGrid();
        this.placeShips();
    }
    Object.defineProperty(Grid.prototype, "TotalShots", {
        get: function () {
            return this.totalShots;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * initializes the grid -> all fields with 'unknown'
     */
    Grid.prototype.initGrid = function () {
        this.grid = [];
        for (var i = 0; i < Math.pow(this.size, 2); i++) {
            this.grid[i] = FieldType.Unknown;
        }
    };
    /**
     * places the ships randomly on the grid
     */
    Grid.prototype.placeShips = function () {
        for (var i = 0; i < this.ships.length; i++) {
            var shipPlaced = false;
            while (!shipPlaced) {
                var ship = this.ships[i];
                ship.Horizontal = Math.random() < 0.5;
                var xMax = ship.Horizontal ? this.size - ship.Size + 1 : this.size;
                var yMax = ship.Horizontal ? this.size : this.size - ship.Size + 1;
                ship.X = Math.floor(Math.random() * xMax);
                ship.Y = Math.floor(Math.random() * yMax);
                if (!this.shipsOverlap(ship) && !this.checkShipAdjacent(ship)) {
                    var gridIndex = ship.Y * this.size + ship.X;
                    for (var j = 0; j < ship.Size; j++) {
                        this.grid[gridIndex] = ship.Name;
                        gridIndex += ship.Horizontal ? 1 : this.size;
                    }
                    shipPlaced = true;
                }
            }
        }
    };
    /**
     * checks if the ship is next to another one
     * @param ship
     */
    Grid.prototype.checkShipAdjacent = function (ship) {
        var x1 = ship.X - 1;
        var y1 = ship.Y - 1;
        var x2 = ship.Horizontal ? ship.X + ship.Size : ship.X + 1;
        var y2 = ship.Horizontal ? ship.Y + 1 : ship.Y + ship.Size;
        for (var i = x1; i <= x2; i++) {
            if (i < 0 || i > this.size - 1)
                continue;
            for (var j = y1; j <= y2; j++) {
                if (j < 0 || j > this.size - 1)
                    continue;
                if (FieldType.isShip(this.grid[j * this.size + i])) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Checks if the ship overlaps with another one in the grid
     * @param ship
     */
    Grid.prototype.shipsOverlap = function (ship) {
        var gridIndex = ship.Y * this.size + ship.X;
        for (var i = 0; i < ship.Size; i++) {
            if (FieldType.isShip(this.grid[gridIndex])) {
                return true;
            }
            gridIndex += ship.Horizontal ? 1 : this.size;
        }
        return false;
    };
    /**
     * updates the grid according to the result of the shot
     * @param x
     * @param y
     */
    Grid.prototype.shoot = function (x, y) {
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
                var ship = this.grid[x + (y * this.size)];
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
    };
    /**
     * Checks if the current ship was sunk with last shot
     * @param x
     * @param y
     * @param ship
     */
    Grid.prototype.checkShipSunk = function (ship) {
        for (var i = 0; i < Math.pow(this.size, 2); i++) {
            if (this.grid[i] === ship) {
                return false;
            }
        }
        return true;
    };
    Grid.prototype.allShipsDestroyed = function () {
        for (var i = 0; i < Math.pow(this.size, 2); i++) {
            if (FieldType.isShip(this.grid[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * for console output of the grid
     * @param showShips - hide the ships by default
     */
    Grid.prototype.toString = function (showShips) {
        if (showShips === void 0) { showShips = false; }
        var val = '';
        var gridCopy = this.toggleShips(showShips);
        for (var i = 0; i < Math.pow(this.size, 2); i++) {
            val += gridCopy[i].toString();
            if (i > 0 && (i + 1) % this.size == 0) {
                val += '\n';
            }
        }
        return val;
    };
    /**
     * returns the grid as json string
     * @param showShips - hide the ships by default
     */
    Grid.prototype.toJson = function (showShips) {
        if (showShips === void 0) { showShips = false; }
        var gridCopy = this.toggleShips(showShips);
        return JSON.stringify(gridCopy);
    };
    Grid.prototype.toArray = function (showShips) {
        if (showShips === void 0) { showShips = false; }
        var gridCopy = this.toggleShips(showShips);
        var arr = new Array();
        for (var i = 0; i < this.size; i++) {
            arr[i] = new Array();
            for (var j = 0; j < this.size; j++) {
                arr[i][j] = gridCopy[j * this.size + i];
            }
        }
        return arr;
    };
    /**
     * Hides the ships in the grid to show it to the opponent
     * @param showShips - hide the ships by default
     */
    Grid.prototype.toggleShips = function (showShips) {
        if (showShips === void 0) { showShips = false; }
        var gridCopy = this.grid.slice();
        if (!showShips) {
            for (var i = 0; i < Math.pow(this.size, 2); i++) {
                if (FieldType.isShip(gridCopy[i])) {
                    gridCopy[i] = FieldType.Unknown;
                }
            }
        }
        return gridCopy;
    };
    Grid.prototype.toBody = function () {
        return {
            shotresult: this.ShotResult,
            grid: this.toArray()
        };
    };
    return Grid;
}());
exports.Grid = Grid;
