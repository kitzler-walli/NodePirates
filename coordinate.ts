export class Coordinate {
	public x:number;
	public y:number;

	static Empty:Coordinate = <Coordinate> {x:-1,y:-1};

	constructor(){
		this.x = -1;
		this.y = -1;
	}

	toString():string {
		return 'X: ' + this.x + ' Y: ' + this.y;
	}
}