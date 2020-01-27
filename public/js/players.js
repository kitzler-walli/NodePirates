$(document).ready(function (){
	$('.playerline').click(function(){
		window.location.href = '/players/' + $(this).data('id');
	});
});