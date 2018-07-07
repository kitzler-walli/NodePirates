class Coordinate {
    constructor() {
        this.x = -1;
        this.y = -1;
    }
    toString() {
        return 'X: ' + this.x + ' Y: ' + this.y;
    }
}
Coordinate.Empty = { x: -1, y: -1 };
module.exports = exports = Coordinate;