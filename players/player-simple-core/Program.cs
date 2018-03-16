using System;
using Microsoft.AspNetCore.Hosting;

namespace player_simple_core
{
    class Program
    {
        static void Main(string[] args)
        {
            var host = new WebHostBuilder().UseKestrel().UseStartup<Startup>().Build();

            host.Run();
        }
    }
}
