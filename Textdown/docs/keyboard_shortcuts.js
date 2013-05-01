if (window.navigator.platform.toLowerCase().indexOf("mac") < 0) {
	window.onload = function() {
		window.document.body.innerHTML = window.document.body.innerHTML.replace(/Command/gi, "Control");
	};
}