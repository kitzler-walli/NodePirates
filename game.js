const grid_1 = require("./grid");
const WebRequest = require("web-request");
class Game {
    constructor(portPlayer1, portPlayer2) {
        this.gridSize = 10;
        this.finished = false;
        this.portPlayer1 = portPlayer1;
        this.portPlayer2 = portPlayer2;
        this.gridPlayer1 = new grid_1.Grid(this.gridSize);
        this.gridPlayer2 = new grid_1.Grid(this.gridSize);
    }
    async play() {
        return new Promise(async (resolve, reject) => {
            try {
                while (!this.finished) {
                    // player 1 -> fire
                    let shot = await WebRequest.json('http://localhost:' + this.portPlayer1 + '/fire', {
                        headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer1.toBody()
                    });
                    this.gridPlayer1.shoot(shot);
                    console.log('Player1 shot at: ' + shot.x + ", " + shot.y);
                    //console.log(this.gridPlayer2.toString(true));
                    if (this.gridPlayer1.allShipsDestroyed()) {
                        this.gridPlayer2.State = 'Lost';
                        this.gridPlayer1.State = 'Win';
                        await this.finish(1);
                        resolve(true);
                    }
                    // player 2 -> fire
                    shot = await WebRequest.json('http://localhost:' + this.portPlayer2 + '/fire', {
                        headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer2.toBody()
                    });
                    this.gridPlayer2.shoot(shot);
                    console.log('Player2 shot at: ' + shot.x + ", " + shot.y);
                    //console.log(this.gridPlayer1.toString(true));
                    if (this.gridPlayer2.allShipsDestroyed()) {
                        this.gridPlayer1.State = 'Lost';
                        this.gridPlayer2.State = 'Win';
                        await this.finish(2);
                        resolve(true);
                    }
                }
            }
            catch (err) {
                console.log(err);
                reject(err);
            }
        });
    }
    async finish(player) {
        this.finished = true;
        if (player == 1) {
            console.log('Player No 1 won after ' + this.gridPlayer2.TotalShots);
        }
        else {
            console.log('Player No 2 won after ' + this.gridPlayer1.TotalShots);
        }
        //reset players
        await WebRequest.json('http://localhost:' + this.portPlayer1 + '/reset', {
            headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer2.toBody()
        });
        await WebRequest.json('http://localhost:' + this.portPlayer2 + '/reset', {
            headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer1.toBody()
        });
    }
}
exports.Game = Game;