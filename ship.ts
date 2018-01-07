import { FieldType } from './grid';
import { triggerAsyncId } from 'async_hooks';
import { fail } from 'assert';

export class Ship {
	private shipGrid:number[];
	public Name:FieldType;
	public Size:number;
	public X:number;
	public Y:number;
	public Horizontal:boolean;

	constructor (size:number, name:FieldType){
		this.Size = size;
		this.shipGrid = new Array<number>(size);
		this.Name = name;

		for(let i = 0;i<size;i++){
			this.shipGrid[i] = name;
		}
	}

	isSunk():boolean {
		for(let i = 0;i<this.shipGrid.length;i++){
			if(this.shipGrid[i] == this.Name){
				return false;
			}
		}
		return true;
	}
}