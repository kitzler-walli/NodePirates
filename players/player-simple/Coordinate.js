"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Coordinate = /** @class */ (function () {
    function Coordinate() {
        var _this = this;
        this.toString = function () {
            return 'X: ' + _this.X + ' Y: ' + _this.Y;
        };
        this.X = -1;
        this.Y = -1;
    }
    Coordinate.Empty = { X: -1, Y: -1 };
    return Coordinate;
}());
exports.Coordinate = Coordinate;
