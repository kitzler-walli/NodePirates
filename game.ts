import { Grid } from './grid';
import * as WebRequest from 'web-request';
import { triggerAsyncId } from 'async_hooks';
import { Coordinate } from './Coordinate';

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
				let shot:Coordinate = await WebRequest.json<any>('http://localhost:' + this.portPlayer1 + '/fire', {
					headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer2.toBody()
				});
				console.log('Player1 shot at: ' + shot.toString());
				this.gridPlayer2.shoot(shot);
				
				//console.log(this.gridPlayer2.toString(true));

				if(this.gridPlayer2.allShipsDestroyed()){
					this.gridPlayer2.State = 'Lost';
					this.gridPlayer1.State = 'Win';
					this.finish(1);
					return true;
				}

				// player 2 -> fire
				shot = await WebRequest.json<any>('http://localhost:' + this.portPlayer2 + '/fire', {
					headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer1.toBody()
				});
				console.log('Player2 shot at: ' + shot.toString());
				this.gridPlayer1.shoot(shot);
				
				//console.log(this.gridPlayer1.toString(true));

				if(this.gridPlayer1.allShipsDestroyed()){
					this.gridPlayer2.State = 'Lost';
					this.gridPlayer1.State = 'Win';
					this.finish(2);
					return true;
				}
			}
			return false;
		}
		catch (err) {
			console.log(err);
			return false;
		}
	}

	private finish(player:number):void {
		this.finished = true;
		if(player == 1){
			console.log('Player No 1 won after ' + this.gridPlayer2.TotalShots);
		}
		else {
			console.log('Player No 2 won after ' + this.gridPlayer1.TotalShots);
		}

		//reset players
		WebRequest.json<any>('http://localhost:' + this.portPlayer1 + '/reset', {
			headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer2.toBody()
		});
		WebRequest.json<any>('http://localhost:' + this.portPlayer2 + '/reset', {
			headers: [{ 'Content-Type': 'application/json' }], method: 'POST', body: this.gridPlayer1.toBody()
		});
	}
}