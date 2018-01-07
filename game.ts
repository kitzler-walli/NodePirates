import { Grid, LastShotResultType } from './grid';
import * as WebRequest from 'web-request';
import { triggerAsyncId } from 'async_hooks';

export class Game {
	private gridSize = 10;
	private gridPlayer1: Grid;
	private gridPlayer2: Grid;
	private portPlayer1: number;
	private portPlayer2: number;
	private finished: boolean = false;

	constructor(portPlayer1: number, portPlayer2: number) {

		this.portPlayer1 = portPlayer1;
		this.portPlayer2 = portPlayer2;
		this.gridPlayer1 = new Grid(this.gridSize);
		this.gridPlayer2 = new Grid(this.gridSize);

	}

	public async play(): Promise<boolean> {
		try {
			while (!this.finished) {
				// player 1 -> fire
				let shot = await WebRequest.json<any>('http://localhost:' + this.portPlayer1 + '/fire', {
					headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer1.toBody()
				});
				//console.log(shot);
				this.gridPlayer2.shoot(shot[0],shot[1]);
				
				//console.log(this.gridPlayer2.toString(true));

				if(this.gridPlayer2.allShipsDestroyed()){
					this.gridPlayer2.ShotResult = LastShotResultType.Lost;
					this.gridPlayer1.ShotResult = LastShotResultType.Win;
					this.finish(1);
				}

				// player 2 -> fire
				shot = await WebRequest.json<any>('http://localhost:' + this.portPlayer2 + '/fire', {
					headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer2.toBody()
				});
				//console.log(shot);
				this.gridPlayer1.shoot(shot[0],shot[1]);
				
				//console.log(this.gridPlayer1.toString(true));

				if(this.gridPlayer1.allShipsDestroyed()){
					this.gridPlayer2.ShotResult = LastShotResultType.Lost;
					this.gridPlayer1.ShotResult = LastShotResultType.Win;
					this.finish(2);
				}
			}
			return true;
		}
		catch (err) {
			return false;
		}
	}

	private finish(player:number):void {
		this.finished = true;
		console.log('Player No ' + player + ' won after ' + this.gridPlayer2.TotalShots);
	}
}