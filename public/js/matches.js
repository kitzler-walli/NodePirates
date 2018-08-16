$(document).ready(function (){
	$('.matchline').click(function(){
		window.location.href = '/matches/' + $(this).data('id');
	});

	$('.gameline').click(function(){
		window.location.href = '/game/' + $(this).data('id');
	});
});