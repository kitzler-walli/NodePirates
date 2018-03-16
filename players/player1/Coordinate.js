"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Coordinate = /** @class */ (function () {
    function Coordinate() {
        this.x = -1;
        this.y = -1;
    }
    Coordinate.prototype.toString = function () {
        return 'X: ' + this.x + ' Y: ' + this.y;
    };
    Coordinate.Empty = { x: -1, y: -1 };
    return Coordinate;
}());
exports.Coordinate = Coordinate;
//# sourceMappingURL=coordinate.js.map