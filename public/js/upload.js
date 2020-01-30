$(document).ready(function (){
	var status = "";
	if(window.location.search.includes("success")){
		status = "Erfolgreich hochgeladen!";
	}
	if(window.location.search.includes("error")){
		status = "Es ist leider ein Problem aufgetreten :(";
	}
	$('#status').text(status);
});