const Grid = require("./grid");
const Settings = require("./settings");
const WebRequest = require("web-request");

class Game {
    constructor(portPlayer1, portPlayer2) {
        this.gridSize = Settings.grid_size;
		this.finished = false;
		this.portPlayer1 = portPlayer1;
		this.portPlayer2 = portPlayer2;
        this.gridPlayer1 = new Grid(this.gridSize);
        this.gridPlayer2 = new Grid(this.gridSize);
    }
    async play() {
        return new Promise(async (resolve, reject) => {
            try {
				const data = {
					initialGrid1: this.gridPlayer1.toArray(true),
					initialGrid2: this.gridPlayer2.toArray(true),
					shotHistory: []
				}

                while (!this.finished) {
					// player 1 -> fire
					let startRequest = process.hrtime();
                    let shot = await WebRequest.json('http://localhost:' + this.portPlayer1 + '/fire', {
						headers: [{ 'Content-Type': 'application/json' }], 
						method: 'POST', 
						body: this.gridPlayer1.toBody()
                    });
					this.gridPlayer1.shoot(shot);
					data.shotHistory.push({
						player: 1,
						shot: shot,
						requestTime: process.hrtime(startRequest)
					});
                    //console.log('Player1 shot at: ' + shot.x + ", " + shot.y);
                    //console.log(this.gridPlayer2.toString(true));
                    if (this.gridPlayer1.allShipsDestroyed()) {
						data.totalShots1 = this.gridPlayer1.TotalShots;
						data.totalShots2 = this.gridPlayer2.TotalShots;
						data.winner = 1;
                        await this.finish(1);
                        resolve(data);
					}
					
					if(!this.finished){
						startRequest = process.hrtime();
						// player 2 -> fire
						shot = await WebRequest.json('http://localhost:' + this.portPlayer2 + '/fire', {
							headers: [{ 'Content-Type': 'application/json' }], 
							method: 'POST', 
							body: this.gridPlayer2.toBody()
						});
						this.gridPlayer2.shoot(shot);
						data.shotHistory.push({
							player: 2,
							shot: shot,
							requestTime: process.hrtime(startRequest)
						});
						//console.log('Player2 shot at: ' + shot.x + ", " + shot.y);
						//console.log(this.gridPlayer1.toString(true));
						if (this.gridPlayer2.allShipsDestroyed()) {
							data.totalShots1 = this.gridPlayer1.TotalShots;
							data.totalShots2 = this.gridPlayer2.TotalShots;
							data.winner = 2;
							await this.finish(2);
							resolve(data);
						}
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
		this.gridPlayer1.State = player == 1 ? 'Win' : 'Lost';
		this.gridPlayer2.State = player == 2 ? 'Win' : 'Lost';

        // if (player == 1) {
        //     console.log('Player No 1 won after ' + this.gridPlayer2.TotalShots);
        // }
        // else {
        //     console.log('Player No 2 won after ' + this.gridPlayer1.TotalShots);
        // }
        //reset players
        await WebRequest.json('http://localhost:' + this.portPlayer1 + '/reset', {
            headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer2.toBody()
        });
        await WebRequest.json('http://localhost:' + this.portPlayer2 + '/reset', {
            headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer1.toBody()
        });
    }
}
module.exports = exports = Game;