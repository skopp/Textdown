window.onload = function () {
	window.getUrlVars = function () {
		var vars = {};
		window.location.parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
			vars[key] = value;
		});
		return vars;
	};
	var hash = window.getUrlVars();
	window.document.title = window.decodeURIComponent(hash.title);
	if (window.JSON.parse(window.localStorage.getItem("print_small"))) {
        window.document.body.style.zoom = "0.8";
    }
	var code = window.document.getElementById("code");
	code.style.cssText = "font-family:" + window.localStorage.getItem("font_family") + "; font-size:" + window.localStorage.getItem("font_size") + "px; line-height:" + window.localStorage.getItem("line_spacing") + ";";
	code.innerHTML = window.decodeURIComponent(hash.md);
	window.print();
	window.close();
};