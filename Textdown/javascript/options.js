window.onload = function () {
	"use strict";

	var ask = window.document.getElementById("ask"),
		biSyntax = window.document.getElementById("biSyntax"),
		breaks = window.document.getElementById("breaks"),
		calculatorComma = window.document.getElementById("calculatorComma"),
		codeSyntax = window.document.getElementById("codeSyntax"),
		colorScheme = window.document.getElementById("colorScheme"),
		confirmClose = window.document.getElementById("confirmClose"),
		docExt = window.document.getElementById("docExt"),
		editorWidth = window.document.getElementById("editorWidth"),
		focusPreview = window.document.getElementById("focusPreview"),
		focusPreviewDiv = window.document.getElementById("focusPreviewDiv"),
		fontFamily = window.document.getElementById("fontFamily"),
		fontSize = window.document.getElementById("fontSize"),
		fullscreenWidth = window.document.getElementById("fullscreenWidth"),
		gfm = window.document.getElementById("gfm"),
		h1Break = window.document.getElementById("h1Break"),
		h2Break = window.document.getElementById("h2Break"),
		hideLinks = window.document.getElementById("hideLinks"),
		hrBreak = window.document.getElementById("hrBreak"),
		hrSyntax = window.document.getElementById("hrSyntax"),
		htmlTemplate = window.document.getElementById("htmlTemplate"),
		ignoreHtml = window.document.getElementById("ignoreHtml"),
		lineSpacing = window.document.getElementById("lineSpacing"),
		listSyntax = window.document.getElementById("listSyntax"),
		livePreview = window.document.getElementById("livePreview"),
		mathAdditions = window.document.getElementById("mathAdditions"),
		openFullscreen = window.document.getElementById("openFullscreen"),
		openPreview = window.document.getElementById("openPreview"),
		previewCSS = window.document.getElementById("previewCSS"),
		printCSS = window.document.getElementById("printCSS"),
		printSmall = window.document.getElementById("printSmall"),
		shortcuts = window.document.getElementById("shortcuts"),
		smartScroll = window.document.getElementById("smartScroll"),
		smartScrollPos = window.document.getElementById("smartScrollPos"),
		startWith = window.document.getElementById("startWith"),
		tables = window.document.getElementById("tables"),
		tablesDiv = window.document.getElementById("tablesDiv");

	// Misc methods
	HTMLSelectElement.prototype.toArray = function () {
		var array = [];
		for (var i = 0; i < this.options.length; i++) {
			array[i] = this.options[i].text.toLowerCase();
		}
		return array;
	};

	// Reload
	var ctrlKey = (window.navigator.appVersion.indexOf("Mac") === -1) ? "ctrl" : "command",
		reload = document.getElementById("reload");
	if (window.sessionStorage.getItem("confirm_close") !== null) {
		window.localStorage.setItem("confirm_close", window.sessionStorage.getItem("confirm_close"));
	}
	window.Mousetrap.bind(ctrlKey + "+s", function () { // reload
		event.preventDefault();
		var pages = window.chrome.extension.getViews({});
		window.sessionStorage.setItem("confirm_close", window.localStorage.getItem("confirm_close"));
		window.localStorage.setItem("confirm_close", "false");
		for (var i = 0; i < pages.length; i++) {
			pages[i].location.reload();
		}
	});
	reload.innerText = (ctrlKey !== "command") ? "Reload Textdown (Ctrl + S)" : "Reload Textdown (Command + S)";
	reload.onclick = function () {
		window.Mousetrap.trigger(ctrlKey + "+s");
	};

	// Load
	if (window.localStorage.getItem("bi_syntax") === "*") {
		biSyntax.selectedIndex = 0;
	} else {
		biSyntax.selectedIndex = 1;
	}
	if (window.localStorage.getItem("code_syntax") === "```") {
		codeSyntax.selectedIndex = 0;
	} else {
		codeSyntax.selectedIndex = 1;
	}
	if (window.JSON.parse(window.localStorage.getItem("gfm"))) {
		gfm.checked = true;
	} else {
		tablesDiv.style.display = "none";
		gfm.checked = false;
	}
	if (window.JSON.parse(window.localStorage.getItem("live_preview"))) {
		livePreview.checked = true;
		focusPreviewDiv.style.display = "none";
	} else {
		livePreview.checked = false;
	}
	if (window.localStorage.getItem("start_with") === "Welcome Text") {
		startWith.selectedIndex = 0;
	} else {
		startWith.selectedIndex = 1;
	}
	ask.checked = window.JSON.parse(window.localStorage.getItem("ask"));
	breaks.checked = window.JSON.parse(window.localStorage.getItem("breaks"));
	calculatorComma.checked = window.JSON.parse(window.localStorage.getItem("calculator_comma"));
	colorScheme.selectedIndex = colorScheme.toArray().indexOf(window.localStorage.getItem("color_scheme"));
	confirmClose.checked = window.JSON.parse(window.localStorage.getItem("confirm_close"));
	docExt.selectedIndex = docExt.toArray().indexOf(window.localStorage.getItem("doc_ext"));
	editorWidth.selectedIndex = editorWidth.toArray().indexOf(window.localStorage.getItem("editor_width"));
	focusPreview.checked = window.JSON.parse(window.localStorage.getItem("focus_preview"));
	fontFamily.value = window.localStorage.getItem("font_family");
	fontSize.selectedIndex = fontSize.toArray().indexOf(window.localStorage.getItem("font_size"));
	fullscreenWidth.checked = window.JSON.parse(window.localStorage.getItem("fullscreen_width"));
	h1Break.checked = window.JSON.parse(window.localStorage.getItem("h1_break"));
	h2Break.checked = window.JSON.parse(window.localStorage.getItem("h2_break"));
	hideLinks.checked = window.JSON.parse(window.localStorage.getItem("hide_links"));
	hrBreak.checked = window.JSON.parse(window.localStorage.getItem("hr_break"));
	hrSyntax.selectedIndex = hrSyntax.toArray().indexOf(window.localStorage.getItem("hr_syntax"));
	htmlTemplate.value = window.localStorage.getItem("html_template");
	ignoreHtml.checked = window.JSON.parse(window.localStorage.getItem("ignore_html"));
	lineSpacing.selectedIndex = lineSpacing.toArray().indexOf(window.localStorage.getItem("line_spacing"));
	listSyntax.selectedIndex = listSyntax.toArray().indexOf(window.localStorage.getItem("list_syntax"));
	mathAdditions.value = window.localStorage.getItem("math_additions");
	openFullscreen.checked = window.JSON.parse(window.localStorage.getItem("open_fullscreen"));
	openPreview.checked = window.JSON.parse(window.localStorage.getItem("open_preview"));
	previewCSS.value = window.localStorage.getItem("preview_css");
	printCSS.checked = window.JSON.parse(window.localStorage.getItem("print_css"));
	printSmall.checked = window.JSON.parse(window.localStorage.getItem("print_small"));
	shortcuts.value = window.localStorage.getItem("shortcuts");
	smartScroll.checked = window.JSON.parse(window.localStorage.getItem("smart_scroll"));
	smartScrollPos.selectedIndex = smartScrollPos.toArray().indexOf(window.localStorage.getItem("smart_scroll_pos"));
	tables.checked = window.JSON.parse(window.localStorage.getItem("tables"));

	// Save
	ask.onclick = function () {
		window.localStorage.setItem("ask", window.JSON.stringify(ask.checked));
	};
	biSyntax.onchange = function () {
		if (biSyntax.selectedIndex === 0) {
			window.localStorage.setItem("bi_syntax", "*");
		} else {
			window.localStorage.setItem("bi_syntax", "_");
		}
	};
	breaks.onclick = function () {
		window.localStorage.setItem("breaks", window.JSON.stringify(breaks.checked));
	};
	calculatorComma.onclick = function () {
		window.localStorage.setItem("calculator_comma", window.JSON.stringify(calculatorComma.checked));
	};
	codeSyntax.onchange = function () {
		window.localStorage.setItem("code_syntax", codeSyntax.options[codeSyntax.selectedIndex].text);
	};
	colorScheme.onchange = function () {
		window.localStorage.setItem("color_scheme", colorScheme.options[colorScheme.selectedIndex].text.toLowerCase());
	};
	confirmClose.onclick = function () {
		window.localStorage.setItem("confirm_close", window.JSON.stringify(confirmClose.checked));
	};
	docExt.onchange = function () {
		window.localStorage.setItem("doc_ext", docExt.options[docExt.selectedIndex].text);
	};
	editorWidth.onchange = function () {
		window.localStorage.setItem("editor_width", editorWidth.options[editorWidth.selectedIndex].text.toLowerCase());
	};
	fullscreenWidth.onclick = function () {
		window.localStorage.setItem("fullscreen_width", window.JSON.stringify(fullscreenWidth.checked));
	};
	focusPreview.onclick = function () {
		window.localStorage.setItem("focus_preview", window.JSON.stringify(focusPreview.checked));
	};
	fontFamily.onkeyup = function () {
		window.localStorage.setItem("font_family", fontFamily.value.toLowerCase());
	};
	fontSize.onchange = function () {
		window.localStorage.setItem("font_size", fontSize.options[fontSize.selectedIndex].text);
	};
	gfm.onclick = function () {
		if (gfm.checked) {
			tablesDiv.style.display = "block";
			window.localStorage.setItem("gfm", "true");
		} else {
			tablesDiv.style.display = "none";
			window.localStorage.setItem("gfm", "false");
		}
	};
	h1Break.onchange = function () {
		window.localStorage.setItem("h1_break", window.JSON.stringify(h1Break.checked));
	};
	h2Break.onchange = function () {
		window.localStorage.setItem("h2_break", window.JSON.stringify(h2Break.checked));
	};
	hideLinks.onchange = function () {
		window.localStorage.setItem("hide_links", window.JSON.stringify(hideLinks.checked));
	};
	hrBreak.onchange = function () {
		window.localStorage.setItem("hr_break", window.JSON.stringify(hrBreak.checked));
	};
	hrSyntax.onchange = function () {
		window.localStorage.setItem("hr_syntax", hrSyntax.options[hrSyntax.selectedIndex].text);
	};
	htmlTemplate.onkeyup = function () {
		window.localStorage.setItem("html_template", htmlTemplate.value);
	};
	ignoreHtml.onclick = function () {
		window.localStorage.setItem("ignore_html", window.JSON.stringify(ignoreHtml.checked));
	};
	lineSpacing.onchange = function () {
		window.localStorage.setItem("line_spacing", lineSpacing.options[lineSpacing.selectedIndex].text);
	};
	listSyntax.onchange = function () {
		window.localStorage.setItem("list_syntax", listSyntax.options[listSyntax.selectedIndex].text);
	};
	livePreview.onclick = function () {
		if (livePreview.checked) {
			focusPreviewDiv.style.display = "none";
			window.localStorage.setItem("live_preview", "true");
		} else {
			focusPreviewDiv.style.display = "block";
			window.localStorage.setItem("live_preview", "false");
		}
	};
	mathAdditions.onkeyup = function () {
		window.localStorage.setItem("math_additions", mathAdditions.value);
	};
	openFullscreen.onclick = function () {
		window.localStorage.setItem("open_fullscreen", window.JSON.stringify(openFullscreen.checked));
	};
	openPreview.onclick = function () {
		window.localStorage.setItem("open_preview", window.JSON.stringify(openPreview.checked));
	};
	printCSS.onchange = function () {
		window.localStorage.setItem("print_css", window.JSON.stringify(printCSS.checked));
	};
	printSmall.onchange = function () {
		window.localStorage.setItem("print_small", window.JSON.stringify(printSmall.checked));
	};
	previewCSS.onkeyup = function () {
		window.localStorage.setItem("preview_css", previewCSS.value);
	};
	shortcuts.onkeyup = function () {
		window.localStorage.setItem("shortcuts", shortcuts.value);
	};
	smartScroll.onclick = function () {
		window.localStorage.setItem("smart_scroll", window.JSON.stringify(smartScroll.checked));
	};
	smartScrollPos.onchange = function () {
		window.localStorage.setItem("smart_scroll_pos", smartScrollPos.options[smartScrollPos.selectedIndex].text.toLowerCase());
	};
	startWith.onchange = function () {
		window.localStorage.setItem("start_with", startWith.options[startWith.selectedIndex].text);
	};
	tables.onclick = function () {
		window.localStorage.setItem("tables", window.JSON.stringify(tables.checked));
	};

	// Reset
	document.getElementById("reset").onclick = function () {
		if (window.confirm("Reset options ?")) {
			window.localStorage.clear();
			reload.click();
		}
	};

	// Handle links
	var isURLOpen = function (url, callback) {
		window.chrome.windows.getAll({
			populate: true
		}, function (windows) {
			for (var i = 0; i < windows.length; i++) {
				for (var j = 0; j < windows[i].tabs.length; j++) {
					if (windows[i].tabs[j].url.indexOf("#") >= 0 && windows[i].tabs[j].url.substring(0, windows[i].tabs[j].url.lastIndexOf("#")) === url) {
						callback(true, windows[i].tabs[j]);
						return;
					} else if (windows[i].tabs[j].url === url) {
						callback(true, windows[i].tabs[j]);
						return;
					}
					if (i === (windows.length - 1) && j === (windows[i].tabs.length - 1)) {
						callback(false);
						return;
					}
				}
			}
		});
	},
	links = window.document.getElementsByClassName("link");
	for (var i = 0; i < links.length; i++) {
		links[i].onclick = function () {
			var url = this.getAttribute("data-url");
			isURLOpen(url, function (isOpen, tab) {
				if (isOpen) {
					window.chrome.windows.update(tab.windowId, {
						focused: true
					});
				} else {
					window.chrome.windows.getCurrent({}, function () {
						window.chrome.windows.create({
							"url": url,
							"type": "popup",
							"width": 480,
							"height": parseInt(screen.availHeight - (screen.availHeight * 0.2), 10),
							"left": parseInt((screen.availWidth - 480)/2, 10),
							"top": parseInt(screen.availHeight * 0.1, 10)
						});
					});
				}
			});
		};
	}

};