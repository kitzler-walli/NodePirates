export class Coordinate {
	public X:number;
	public Y:number;

	static Empty:Coordinate = <Coordinate> {X:-1,Y:-1};

	constructor(){
		this.X = -1;
		this.Y = -1;
	}

	public toString = () : string => {
		return 'X: ' + this.X + ' Y: ' + this.Y;
	}
}