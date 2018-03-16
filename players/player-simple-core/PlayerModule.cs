using System;
using System.Collections.Generic;
using Nancy;
using Nancy.IO;
using Nancy.ModelBinding;
namespace player_simple_core
{
	public class PlayerModule : NancyModule
	{
		public PlayerModule()
		{
			
			Get("/", args => "Hello World, it's Nancy on .NET Core");
			Post("/fire", (args) =>
			{
				var player = Player.Instance;

				var data = this.Bind<GameData>();
				PlayingField field = data.Parse();
				//Console.WriteLine(data);
				var c = player.Move(field);
				Console.WriteLine(c);
				return c;
			});
			Post("/reset", (args) =>
			{
				Player.Reset();
				return null;
			});
			Post("/initfield", (args) =>
			{
				return null;
			});
		}		
	}
}