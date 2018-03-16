using System;
using System.Collections.Generic;

namespace player_simple_core
{
	public class PlayingField {

		private string[][] _grid;
		private List<Ship> _ships;

		public PlayingField (string[][] grid, List<Ship> ships){
			this._grid = grid;
			this._ships = ships;
		}

		public int Size {
			get {
				return this._grid.Length;
			}
		}

		public List<Ship> Ships {
			get {
				return this._ships;
			}
		}

		public string GetState(Coordinates c){
			return this._grid[c.X][c.Y];
		}

		public string GetState(int x, int y){
			return GetState(new Coordinates(x, y));
		}

	}
}