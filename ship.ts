import { triggerAsyncId } from 'async_hooks';
import { Coordinate } from './Coordinate';

export class Ship {
	//private shipGrid:number[];
	public Name: string;
	public Size: number;
	public Coordinate: Coordinate;
	public Horizontal: boolean;
	public Sunk: boolean;
	public AreaState: Array<{ c: Coordinate, state: string }>;

	constructor(size: number, name: string) {
		this.Size = size;
		//this.shipGrid = new Array<number>(size);
		this.Name = name;
		this.Sunk = false;
		this.Coordinate = new Coordinate();

		// for(let i = 0;i<size;i++){
		// 	this.shipGrid[i] = name;
		// }
	}

	placed(): void {
		this.AreaState = new Array<{ c: Coordinate, state: string }>();
		for (let i = 0; i < this.Size; i++) {
			if (this.Horizontal) {
				this.AreaState.push({
					c: <Coordinate>{ X: this.Coordinate.X + i, Y: this.Coordinate.Y },
					state: 'P'
				});
			}
			else {
				this.AreaState.push({
					c: <Coordinate>{ X: this.Coordinate.X, Y: this.Coordinate.Y + i },
					state: 'P'
				})
			}
		}
	}

	isHit(c:Coordinate):boolean {
		for(let i = 0;i<this.AreaState.length;i++){
			let state = this.AreaState[i];

			if(state.c == c){
				state.state = 'H';
				return true;
			}
		}
		return false;
	}

	isSunk():boolean {
		for(let i = 0;i<this.AreaState.length;i++){
			let state = this.AreaState[i];
			if(state.state == 'P'){
				return false;
			}
		}
		return true;
	}
}