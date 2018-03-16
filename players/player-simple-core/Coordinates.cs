using System;
namespace player_simple_core
{
	public class Coordinates {

		public Coordinates (int x, int y){
			this.X = x;
			this.Y = y;
		}

		public int X { get;set;}
		public int Y { get;set;}

		public override string ToString() {
			return "X:" + this.X + ",Y:" + this.Y;
		}
	}
}