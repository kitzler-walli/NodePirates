var current = -1;
var interval = null;

$(document).ready(function(){
	$('#play').click(function(){
		if(interval){
			window.clearInterval(interval);
			interval = null;
			$(this).text('Play');
		}
		else {
			interval = window.setInterval(replayShot, $('#speed').val());
			$(this).text('Pause');
		}
	});

});

function replayShot(){
	current++;
	$('#grid' + shotHistory[current].player).find('#'+shotHistory[current].shot.x+'-'+shotHistory[current].shot.y).text('X');
	$('#list').find('#' + (current-1)).removeClass("active");
	$('#list').find('#' + current).addClass("active");
}