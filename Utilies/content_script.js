(function(window) {
	"use strict";
	if (window.document.title === "") {
		window.chrome.extension.sendMessage({
		greeting: "getId"
	}, function(response) {
		if(response.id !== null) {
				var text = window.document.body.innerText;
				var title = window.location.toString().substring(window.location.toString().lastIndexOf("/") + 1, window.location.toString().length);
				if(window.location.toString().substring(0, 4) === "file") {
					window.open("chrome-extension://" + response.id + "/editor.html?open=1&title=" + window.encodeURIComponent(title) + "&text=" + window.encodeURIComponent(text));
				} else {
					if(window.confirm("Open " + title + " with Textdown ?")) {
						window.open("chrome-extension://" + response.id + "/editor.html?open=1&title=" + window.encodeURIComponent(title) + "&text=" + window.encodeURIComponent(text));
					}
				}
			}
		});
	}
}(window));