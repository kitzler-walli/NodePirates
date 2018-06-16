const coordinate_1 = require("./coordinate");
class Ship {
    constructor(size, name) {
        this.AreaState = new Array();
        this.Size = size;
        //this.shipGrid = new Array<number>(size);
        this.Name = name;
        this.Sunk = false;
        this.Coordinate = new coordinate_1.Coordinate();
        this.Horizontal = false;
        // for(let i = 0;i<size;i++){
        // 	this.shipGrid[i] = name;
        // }
    }
    placed() {
        this.AreaState = new Array();
        for (let i = 0; i < this.Size; i++) {
            if (this.Horizontal) {
                this.AreaState.push({
                    c: { x: this.Coordinate.x + i, y: this.Coordinate.y },
                    state: 'P'
                });
            }
            else {
                this.AreaState.push({
                    c: { x: this.Coordinate.x, y: this.Coordinate.y + i },
                    state: 'P'
                });
            }
        }
    }
    isHit(c) {
        for (let i = 0; i < this.AreaState.length; i++) {
            let state = this.AreaState[i];
            if (state.c == c) {
                state.state = 'H';
                return true;
            }
        }
        return false;
    }
    isSunk() {
        for (let i = 0; i < this.AreaState.length; i++) {
            let state = this.AreaState[i];
            if (state.state == 'P') {
                return false;
            }
        }
        return true;
    }
}
exports.Ship = Ship;