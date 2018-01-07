"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ship = /** @class */ (function () {
    function Ship(size, name) {
        this.Size = size;
        this.shipGrid = new Array(size);
        this.Name = name;
        for (var i = 0; i < size; i++) {
            this.shipGrid[i] = name;
        }
    }
    Ship.prototype.isSunk = function () {
        for (var i = 0; i < this.shipGrid.length; i++) {
            if (this.shipGrid[i] == this.Name) {
                return false;
            }
        }
        return true;
    };
    return Ship;
}());
exports.Ship = Ship;
