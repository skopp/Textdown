window.addEventListener("load", function() {
	"use strict";
    var ss = window.document.createElement("style");
    ss.id = "preview_css";
    ss.innerHTML = window.localStorage.getItem("preview_css") + "* { max-width: 100%; }";
    window.document.head.appendChild(ss);
});