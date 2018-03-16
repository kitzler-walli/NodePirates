using System;
using System.Collections.Generic;

namespace player_simple_core
{
	public class GameData
	{

		public string State { get; set; }
		public string[][] Grid { get; set; }
		public List<Ship> Ships { get; set; }
		
		public PlayingField Parse(){
			return new PlayingField(this.Grid, this.Ships);
		}

		public override string ToString() {
			return "State: " + this.State + "\n" +
					"Grid: " + this.Grid + "\n" + 
					"Ships: " + this.Ships;
		}
	}
}