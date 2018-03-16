using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Nancy.Owin;

namespace player_simple_core {
    public class Startup{

        public void Configure(IApplicationBuilder app){
			
            app.UseOwin(x => x.UseNancy());
            
        }
    }
}