window.onload = function () {
	"use strict";

	var calculatorComma = window.JSON.parse(window.localStorage.getItem("calculator_comma")),
		ctrlKey = "ctrl",
		breaks = [window.JSON.parse(window.localStorage.getItem("hr_break")), window.JSON.parse(window.localStorage.getItem("h1_break")), window.JSON.parse(window.localStorage.getItem("h2_break"))],
		fileInput = window.document.getElementById("fileInput"),
		fileReader = new window.FileReader(),
		focusPreview = window.JSON.parse(window.localStorage.getItem("focus_preview")),
		hideLinks = window.JSON.parse(window.localStorage.getItem("hide_links")),
		iframe = window.document.getElementById("iframe"),
		livePreview = window.JSON.parse(window.localStorage.getItem("live_preview")),
		printCSS = window.JSON.parse(window.localStorage.getItem("print_css")),
		shortcuts,
		textarea = window.document.getElementById("textarea");

	if (window.navigator.platform.toLowerCase().indexOf("mac") >= 0) {
		ctrlKey = "command";
	}

	// Misc methods
	window.Date.prototype.formated = function () {
		return this.getDay() + " of " + ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"][this.getMonth()] + " of " + this.getFullYear();
	},
	window.getTimeInfo = function (time) {
		var timeInfo = [];
		var date = new Date(parseInt(time, 10));
		timeInfo.seconds = date.getSeconds();
		timeInfo.minutes = date.getMinutes();
		timeInfo.hours = date.getHours();
		return timeInfo;
	},
	window.getUrlVars = function () {
		var vars = {};
		window.location.parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
			vars[key] = value;
		});
		return vars;
	},
	window.HTMLElement.prototype.getStyleProperty = function (p) {
		return window.document.defaultView.getComputedStyle(this, null).getPropertyValue(p);
	},
	window.Math.solve = function (string, callback, failed) {

		string = string.replace(/(\;)/g, "");
		if (calculatorComma) {
			string = string.replace(/(,)/gi, ".");
		}

		try {

			eval(window.localStorage.getItem("math_additions") + "\nwindow.result=" + string + ";"); //muahahahahua
			var result = window.result;
			window.result = null;
			if (result === null || ["string", "number"].indexOf(typeof result) < 0) {
				return failed();
			} else {
				if (calculatorComma) {
					return callback(result.toString().replace(/(\.)/gi, ","));
				} else {
					return callback(result.toString());
				}
			}

		} catch (error) {
			return failed(error);
		}
	},
	window.String.prototype.containsMarkdownExtension = function () {
		if (this.lastIndexOf(".") > 0) {
			return (/(txt|text|md|markdown|mdown|markdn|mkd|mkdn|mdwn|mdtxt|mdtext|mdml)/i).test(this.substring(this.lastIndexOf("."), this.length));
		} else {
			return false;
		}
	},
	String.prototype.isImageURL = function () {
		if (this.isURL()) {
			var regExp = /(png|gif|jpg|xbm|svg|jpeg)/i;
			return regExp.test(this.split(".")[this.split(".").length - 1]);
		} else {
			return false;
		}
	},
	String.prototype.isURL = function () {
		var regExp = /(ftp|http|https|file):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i; // regexp from http://stackoverflow.com/questions/3498779/how-to-find-a-url-within-full-text-using-regular-expression
		return regExp.test(this);
	},
	window.String.prototype.toCapitalize = function (sentences) {
		if (sentences) {
			return this.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function (c) {
				return c.toUpperCase();
			});
		} else {
			return this.toLowerCase().replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
				return p1 + p2.toUpperCase();
			});
		}
	},
	window.String.prototype.toSwapcase = function () {
		return this.replace(/([a-z])|([A-Z])/g, function ($0, $1) {
			return ($1) ? $0.toUpperCase() : $0.toLowerCase();
		});
	};

	// Core functions
	var store = function () { // Save session storage
		window.sessionStorage.setItem("caret", textarea._get());
		window.sessionStorage.setItem("scroll_top", textarea.scrollTop);
		window.sessionStorage.setItem("text", textarea.value);
	},
	changePageTitle = function (string) { // Change the window/tab title
		if (string.containsMarkdownExtension()) {
			var docExt = string.substring(string.lastIndexOf("."), string.length);
			if (docExt !== window.window.sessionStorage.getItem("doc_ext")) {
				window.sessionStorage.setItem("doc_ext", docExt);
			}
			window.sessionStorage.setItem("doc_name", string.substring(0, string.length - docExt.length));
		} else {
			window.sessionStorage.setItem("doc_name", string);
			string = string + window.sessionStorage.getItem("doc_ext");
		}
		window.document.title = string;
	},
	loadFiles = function (files) { // Load 1 or more files
		if (files.length > 1) {
			for (var i = 0; i < files.length; i++) {
				if (i !== 0) {
					if (files[i].name.containsMarkdownExtension()) {
						sessionStorage.clear();
						window.open("chrome-extension://" + window.chrome.i18n.getMessage("@@extension_id") + "/editor.html?open=1&file=" + window.encodeURIComponent(window.JSON.stringify(files[i])));
					} else {
						window.alert("Failed to open \"" + files[i].name + "\". Invalid file extension.");
					}
					if (i === files.length - 1) {
						if (files[0].name.containsMarkdownExtension()) {
							changePageTitle(files[0].name);
							fileReader.file = files[0];
							fileReader.readAsText(files[0]);
						} else {
							window.alert("Failed to open \"" + files[0].name + "\". Invalid file extension.");
						}
					}
				}
			}
		} else {
			if (files[0].name.containsMarkdownExtension()) {
				changePageTitle(files[0].name);
				fileReader.file = files[0];
				fileReader.readAsText(files[0]);
			} else {
				window.alert("Failed to open \"" + files[0].name + "\". Invalid file extension.");
			}
		}
	},
	isURLOpen = function (url, callback) { // Check if url is open
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
	notify = function (title, text, time, onclick) { // Creates a webkit notification
		if (title === undefined) {
			title = "Textdown Notification";
		}
		var notification = window.webkitNotifications.createNotification("resources/48.png", title, text);
		if (time === undefined) {
			time = 2000;
		}
		notification.ondisplay = function () {
			setTimeout(function () {
				notification.cancel();
			}, time);
		};
		if (onclick !== undefined) {
			notification.onclick = onclick;
		}
		notification.show();
	},
	preview = function () { // Preview the markdown
		window.localStorage.setItem("caret", textarea.selectionStart);
		window.localStorage.setItem("text", textarea.value);
		isURLOpen("chrome-extension://" + window.chrome.i18n.getMessage("@@extension_id") + "/preview.html", function (isOpen, tab) {
			if (isOpen) {
				if (!livePreview && focusPreview) {
					window.chrome.windows.update(tab.windowId, {
						focused: true
					});
				}
				window.chrome.extension.sendMessage({
					greeting: "preview"
				});
			} else {
				window.chrome.windows.getCurrent({}, function (w) {
					window.chrome.windows.create({
						"url": "preview.html",
						"type": "popup",
						"width": w.width,
						"height": w.height - 22,
						"left": w.left,
						"top": w.top
					});
				});
			}
		});
	},
	saveFile = function (fileName, fileData) { // Save a plain text file
		var blob = new Blob([fileData], {
			type: "text/markdown;charset=utf-8"
		});
		window.saveAs(blob, fileName);
	};
	fileReader.onloadend = function (event) {
		textarea.value = event.target.result;
		textarea.set(0);
		store();
	},
	fileReader.onerror = function () {
		window.alert("Failed to open \"" + fileReader.file.name + "\".");
	};

	// Style the editor
	var editorStyle = window.document.getElementById("editorStyle");
	var colorSchemes = {
		"default": "color: #333; }",
		"dark": "color: #fff; } body { background: #000;}",
		"paper": "color: #333; text-shadow: none; } body { background: #fff;}",
		"terminal": "color: #0f0; } body { background: #000;}"
	};
	editorStyle.innerHTML = "#textarea { font-family:" + window.localStorage.getItem("font_family") + ";font-size:" + window.localStorage.getItem("font_size") + "px;line-height:" + window.localStorage.getItem("line_spacing") + ";" + colorSchemes[window.localStorage.getItem("color_scheme")];
	var fullscreenWidth = window.JSON.parse(window.localStorage.getItem("fullscreen_width"));
	textarea.resize = function () {
		if ((window.document.webkitIsFullScreen && fullscreenWidth) || (window.innerWidth < 1000)) {
			textarea.className = "mousetrap full";
		} else {
			textarea.className = "mousetrap " + window.localStorage.getItem("editor_width");
		}
	};
	window.onresize = textarea.resize;
	window.document.body.onwebkitfullscreenchange = window.onresize;
	textarea.resize();

	// Custom scrollbar
	var hideScrollbarTimer,
		scrollbar = window.document.getElementById("scrollbar"),
		scrollbarThumb = window.document.getElementById("scrollbarThumb"),
	updateScrollbar = function () {
		if (textarea.scrollHeight > textarea.offsetHeight) {
			scrollbarThumb.newHeight = (scrollbar.offsetHeight / (textarea.scrollHeight / textarea.offsetHeight));
			if (scrollbarThumb.newHeight < 30) {
				scrollbarThumb.newHeight = 30;
			}
			scrollbarThumb.style.height = scrollbarThumb.newHeight + "px";
			scrollbarThumb.style.marginTop = ((scrollbar.offsetHeight - scrollbarThumb.offsetHeight) * (textarea.scrollTop / (textarea.scrollHeight - textarea.offsetHeight))) + "px";
		} else {
			if (scrollbarThumb.style.height !== 0) {
				scrollbarThumb.style.height = 0;
			}
		}
	},
	moveScrollbar = function (event) {
		event.preventDefault();
		textarea.scrollTop = (event.pageY / window.document.documentElement.clientHeight * textarea.scrollHeight);
	};
	textarea.addEventListener("scroll", function () {
		updateScrollbar();
		scrollbar.style.opacity = 1;
		if (hideScrollbarTimer) {
			window.clearTimeout(hideScrollbarTimer);
		}
		hideScrollbarTimer = window.setTimeout(function () {
			scrollbar.style.opacity = 0;
			hideScrollbarTimer = null;
		}, 500);
	});
	scrollbar.addEventListener("mousedown", function (event) {
		event.preventDefault();
		moveScrollbar(event);
		window.addEventListener("mousemove", moveScrollbar);
		window.addEventListener("mouseup", function () {
			window.removeEventListener("mousemove", moveScrollbar);
		});
	}),
	scrollbar.addEventListener("mouseout", function () {
		scrollbar.style.opacity = 0;
	}),
	scrollbar.addEventListener("mouseover", function () {
		updateScrollbar();
		scrollbar.style.opacity = 1;
	}),
	window.addEventListener("resize", function () {
		updateScrollbar();
	});

	// Setup words shortcuts
	try {
		shortcuts = window.JSON.parse("{" + window.localStorage.getItem("shortcuts") + "}");
	} catch (e) {
		window.alert("Textdown failed to parse your words shortcuts list.");
	}

	// Textarea methods
	textarea._get = function() {
		if (textarea.selectionStart !== textarea.selectionEnd) {
			return [textarea.selectionStart, textarea.selectionEnd, textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)];
		} else {
			return this.selectionStart;
		}
	},
	textarea._insert = function(string, pos) {
		textarea.value = textarea.value.substring(0, textarea.selectionStart) + string + textarea.value.substring(textarea.selectionEnd, textarea.value.length);
		textarea._set(pos);
	},
	textarea._range = function(start, end) {
		return textarea.value.substring(start, end);
	},
	textarea._remove = function(start, end, pos) {
		textarea.value = textarea.value.substring(0, start) + textarea.value.substring(end, textarea.value.length);
		textarea._set(pos);
	},
	textarea._replaceNewLines = function(string) {
		var pos = textarea._get();
		if (typeof pos === "object") {
			var newText = textarea.value;
			if (pos[0] === 0) {
				newText = string + newText;
			}
			newText = textarea._range(0, pos[0]) + string + pos[2].replace(/\n/gi, "\n" + string) + textarea._range(pos[1], textarea.value.length);
			if (newText.substring(pos[0] - 1, pos[0]) !== "\n") {
				newText = newText.substring(0, pos - 1) + "\n" + newText.substring(pos, newText.length);
			}
			pos = pos[1] + (newText.length - textarea.value.length);
			textarea.value = newText;
			textarea._set(pos[0]);
		} else {
			var lastNewLine = textarea._range(0, pos).lastIndexOf("\n");
			pos = pos + string.length;
			if (lastNewLine >= 0) {
				textarea.value = textarea._range(0, lastNewLine + 1) + string + textarea._range(lastNewLine + 1, textarea.value.length);
			} else {
				textarea.value = string + textarea.value;
			}
		}
		textarea._set(pos);
	},
	textarea._set = function(pos) {
		if (typeof pos === "object") {
			textarea.selectionStart = pos[0];
			textarea.selectionEnd = pos[1];
		} else {
			textarea.selectionStart = pos;
			textarea.selectionEnd = pos;
		}
	},
	textarea._save = function() {
		if (textarea._history === undefined) {
			textarea._history = [];
		}
		textarea._history[textarea._history.length] = [textarea.value, textarea._get(), textarea.scrollTop];
	},
	textarea._undo = function() {
		if (textarea._history !== undefined && textarea._history.length > 0) {
			textarea._history.pop();
			textarea.value = textarea._history[textarea._history.length - 1][0],
			textarea._set(textarea._history[textarea._history.length - 1][1]),
			textarea.scrollTop = textarea._history[textarea._history.length - 1][2];
		}
	},
	textarea._wrap = function(string1, string2) {
		if (string2 === undefined) {
			string2 = string1;
		}
		var pos = textarea._get();
		if (typeof pos === "object") {
			textarea._insert(string1 + pos[2] + string2, [pos[0] + string1.length, pos[0] + pos[2].length + string1.length]);
		} else {
			textarea._insert(string1 + string2, pos + string1.length);
		}
	};

	// Textarea listeners
	if (window.JSON.parse(livePreview)) {
		var keyupTimer;
		textarea.addEventListener("keyup", function () {
			if (keyupTimer) {
				window.clearTimeout(keyupTimer);
			}
			keyupTimer = window.setTimeout(function () {
				window.localStorage.setItem("text", textarea.value);
				window.localStorage.setItem("caret", textarea.selectionStart);
				window.chrome.extension.sendMessage({
					greeting: "preview"
				});
			}, 50);

		});
	}
	textarea.addEventListener("blur", function () {
		var pos = textarea._get();
		setTimeout(function () {
			textarea.focus();
			textarea._set(pos);
		}, 0);
	}, false),
	textarea.addEventListener("dragenter", function (event) {
		event.stopPropagation();
		event.preventDefault();
	}, false),
	textarea.addEventListener("dragexit", function (event) {
		event.stopPropagation();
		event.preventDefault();
	}, false),
	textarea.addEventListener("dragover", function (event) {
		event.stopPropagation();
		event.preventDefault();
	}, false),
	textarea.addEventListener("drop", function (event) {
		event.stopPropagation();
		event.preventDefault();
		if (event.dataTransfer.files[0] !== undefined) {
			loadFiles(event.dataTransfer.files);
		}
	}, false),
	textarea.addEventListener("keypress", function (event) {
		store();
		var pos = textarea._get();
		var pressedKey = String.fromCharCode(event.keyCode);
		if (["[", "(", "{", "*", "_", "\""].indexOf(pressedKey) >= 0 && [String.fromCharCode(event.keyCode), "", "\n", " "].indexOf(textarea._range(pos - 1, pos)) >= 0) { // Autopair
			event.preventDefault();
			switch(pressedKey) {
			case "[":
				textarea._wrap("[", "]");
				break;
			case "(":
				textarea._wrap("(", ")");
				break;
			case "{":
				textarea._wrap("{", "}");
				break;
			default:
				textarea._wrap(pressedKey);
			}
		} else if (typeof pos !== "object") {
			if ((textarea._range(pos - 1, pos) === "(" && pressedKey === ")") || (textarea._range(pos - 1, pos) === "{" && pressedKey === "}") || (textarea._range(pos - 1, pos) === "[" && pressedKey === "]")) { // Prevent ())
				event.preventDefault();
				textarea._set(pos + 1);
			} else if ([">", "+", "-", "*"].indexOf(pressedKey) >= 0 && ["", "\n"].indexOf(textarea._range(pos - 1, pos)) >= 0) { // Start a list or a blockquote
				event.preventDefault();
				textarea._insert(pressedKey + " ", pos + 2);
			} else if (pressedKey === " ") {
				if (["[]", "()", "{}", "**", "__", "\"\""].indexOf(textarea._range(pos - 1, pos + 1)) >= 0) { // Breaks autopair
					event.preventDefault();
					textarea._remove(pos, pos + 1, pos);
					textarea._insert(" ", pos + 1);
				} else if ((["+ ", "* ", "- "].indexOf(textarea._range(pos - 2, pos)) >= 0) && (textarea._range(pos - 3, pos - 2) === "\n" || pos === 2)) { // List start already have space
					event.preventDefault();
				}
			}
		}
	}, false),
	textarea.addEventListener("keydown", function (event) {
		store();
		var pos = textarea._get();
		if (String.fromCharCode(event.keyCode) === "\t") { // Tab
			event.preventDefault();
			if (typeof pos === "object") {
				textarea._insert("    " + pos[2], [pos[0], pos[1] + 4]);
			} else {
				if ((["+ ", "* ", "- "].indexOf(textarea._range(pos - 2, pos)) >= 0) && (["", "\n"].indexOf(textarea._range(pos, pos + 1)) >= 0)) {
					window.console.log(2);
					textarea._set(pos - 2);
					textarea._insert("    ", pos + 4);
				} else {
					textarea._insert("    ", pos + 4);
				}
			}
		} else if (typeof pos !== "object") {
			if (event.keyCode === 37 && textarea._range(pos - 4, pos) === "    ") { // Left arrow
				event.preventDefault();
				textarea._set(pos - 4);
			} else if (event.keyCode === 39 && textarea._range(pos, pos + 4) === "    ") { // Right arrow
				event.preventDefault();
				textarea._set(pos + 4);
			} else if (event.keyCode === 8) { // Backspace
				if (textarea._range(pos - 4, pos) === "    ") { // It's a tab
					event.preventDefault();
					textarea._remove(pos - 4, pos, pos - 4);
				} else if (["[]", "()", "{}", "**", "__", "\"\""].indexOf(textarea._range(pos - 1, pos + 1)) >= 0) { // It's an autopair
					event.preventDefault();
					textarea._remove(pos - 1, pos + 1, pos - 1);
				} else if (["    * ", "    + ", "    - "].indexOf(textarea._range(pos - 3, pos)) >= 0) { // It's a sublist item
					event.preventDefault();
					textarea._remove(pos - 6, pos - 2, pos - 4);
				} else if ((["+ ", "* ", "- "].indexOf(textarea._range(pos - 2, pos)) >= 0) && (["", "\n"].indexOf(textarea._range(pos, pos + 1)) >= 0)) { // It's a list start
					event.preventDefault();
					textarea._remove(pos - 2, pos - 1, pos - 2);
				}
			} else if (event.which === 13) { // Return
				/* based on https://github.com/jamiebicknell/Markdown-Helper */
				var newCaretPosition;
				var check = false,
					input = textarea.value.replace(/\r\n/g, '\n'),
					start = textarea._get(),
					lines = input.split('\n'),
					state = input.substr(0, start).split('\n').length,
					value = lines[state - 1].replace(/^\s+/, ''),
					first = value.substr(0, 2),
					begin,
					label;
				if (value && !check && lines[state - 1].substr(0, 4) === '    ') { // code
					var i = 0,
						numberOfSpaces;
					do {
						if (lines[state - 1].charAt(i) === " ") {
							i++;
						} else {
							numberOfSpaces = i;
							i = lines[state - 1];
						}
					} while (i <= lines[state - 1].length);
					begin = label = lines[state - 1].substr(0, numberOfSpaces);
					check = true;
				}
				if (['* ', '+ ', '- ', '> '].indexOf(first) >= 0) { // lists and quote
					begin = label = first;
					check = true;
				}
				if (check) {
					var width = lines[state - 1].indexOf(begin);
					if (value.replace(/^\s+/, '') === begin) {
						textarea.value = input.substr(0, start - 1 - width - label.length) + '\n\n' + input.substr(start, input.length);
						newCaretPosition = start + 1 - label.length - width;
					} else {
						textarea.value = input.substr(0, start) + '\n' + (new Array(width + 1).join(' ')) + label + input.substr(start, input.length);
						newCaretPosition = start + 1 + label.length + width;
					}
					textarea._set(newCaretPosition);
					if (lines[state] === lines[lines.length]) {
						textarea.scrollTop = textarea.scrollHeight;
					}
					event.preventDefault();
				}
			}
		}
	}, false),
	textarea.addEventListener("keyup", function() {
		textarea._save();
	});

	// Keyboard shortcuts
	fileInput.addEventListener("change", function () {
		loadFiles(this.files);
	}),
	window.Mousetrap.bind(ctrlKey + "+,", function (event) { // Preferences
		event.preventDefault();
		isURLOpen("chrome-extension://" + window.chrome.i18n.getMessage("@@extension_id") + "/options.html", function (isOpen, tab) {
			if (isOpen) {
				window.chrome.tabs.update(tab.id, {
					active: true
				});
			} else {
				window.open("options.html");
			}
		});
	}),
	window.Mousetrap.bind(ctrlKey + "+-", function (event) { // "Prevent window unzoom"
		event.preventDefault();
	}),
	window.Mousetrap.bind(ctrlKey + "+/", function (event) { // Comment
		event.preventDefault();
		textarea._wrap("<!-- ", " -->");
	}),
	window.Mousetrap.bind(ctrlKey + "+=", function (event) { // "Prevent window zoom"
		event.preventDefault();
	}),
	window.Mousetrap.bind(ctrlKey + "+>", function (event) { // Blockquote
		event.preventDefault();
		textarea._replaceNewLines("> ");
	}),
	window.Mousetrap.bind(ctrlKey + "+alt+c", function (event) { // Copy HTML
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			iframe.contentWindow.document.body.innerHTML = "<textarea id=\"textarea\">" + window.marked(pos[2]) + "</textarea>";
		} else {
			iframe.contentWindow.document.body.innerHTML = "<textarea id=\"textarea\">" + window.marked(textarea.value) + "</textarea>";
		}
		var iframeTextarea = iframe.contentWindow.document.getElementById("textarea");
		iframeTextarea.select();
		if (iframeTextarea.value.length === 0) {
			notify("Nothing to copy", "There is nothing to copy.");
		} else {
			iframe.contentWindow.document.execCommand("Copy");
			if (iframeTextarea.value.length > 1) {
				notify("HTML Pasted", iframeTextarea.value.length + " characters(" + new window.Blob([iframeTextarea.value]).size + "B) were sent to your clipboard");
			} else {
				notify("HTML Pasted", "One character(" + new window.Blob([iframeTextarea.value]).size + "B) were sent to your clipboard");
			}
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+alt+p", function (event) { // Print plain text
		event.preventDefault();
		window.open("print_md.html?title=" + window.encodeURIComponent(window.document.title) + "&md=" + window.encodeURIComponent(textarea.value));
	}),
	window.Mousetrap.bind(ctrlKey + "+alt+v", function (event) { // Copy RTF
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			iframe.contentWindow.document.body.innerHTML = window.marked(pos[2]);
		} else {
			iframe.contentWindow.document.body.innerHTML = window.marked(textarea.value);
		}
		iframe.contentWindow.document.execCommand("selectAll", false, null);
		if (iframe.contentWindow.document.body.innerText.length === 0) {
			notify("Nothing to copy", "There is nothing to copy.");
		} else {
			iframe.contentWindow.document.execCommand("Copy");
			if (iframe.contentWindow.document.body.innerText.length > 1) {
				notify("RTF Pasted", iframe.contentWindow.document.body.innerText.length + " characters were sent to your clipboard");
			} else {
				notify("RTF Pasted", "One character(" + iframe.contentWindow.document.body.innerText + ") were sent to your clipboard");
			}
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+alt+x", function (event) { // Copy markdown
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			iframe.contentWindow.document.body.innerHTML = "<textarea id=\"textarea\">" + pos[2] + "</textarea>";
		} else {
			iframe.contentWindow.document.body.innerHTML = "<textarea id=\"textarea\">" + textarea.value + "</textarea>";
		}
		var iframeTextarea = iframe.contentWindow.document.getElementById("textarea");
		iframeTextarea.select();
		if (iframeTextarea.value.length === 0) {
			notify("Nothing to copy", "There is nothing to copy.");
		} else {
			iframe.contentWindow.document.execCommand("Copy");
			if (iframeTextarea.value.length > 1) {
				notify("Markdown Pasted", iframeTextarea.value.length + " characters(" + new window.Blob([iframeTextarea.value]).size + "B) were sent to your clipboard");
			} else {
				notify("Markdown Pasted", "One character(" + new window.Blob([iframeTextarea.value]).size + "B) were sent to your clipboard");
			}
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+b", function (event) { // Bold
		event.preventDefault();
		textarea._wrap(window.localStorage.getItem("bi_syntax") + window.localStorage.getItem("bi_syntax"));
	}),
	window.Mousetrap.bind(ctrlKey + "+e", function (event) { // Document/selection info
		event.preventDefault();
		var value,
			infoString = "Some stats about your",
			info,
			pos = textarea._get();
		if (typeof pos === "object") {
			value = pos[2];
			infoString += " selection:";
		} else {
			value = textarea.value;
			infoString += " document:";
		}
		info = new window.Blob([value]).size;
		infoString += "\n\nBytes: " + info + ".";
		info = value.length;
		infoString += "\nCharacters: " + info + ".";
		info = value.replace(/\s+/g, "").length;
		infoString += "\nCharacters(without space): " + info + ".";
		info = value.split("\n").length;
		infoString += "\nLines: " + info + ".";
		info = value.replace(/^\s*$[\n\r]{1,}/gm, "").split("\n").length;
		infoString += "\nLines(whitout blank lines): " + info + ".";
		info = value.replace(/\n$/gm, '').split(/\n/).length;
		infoString += "\nParagraphs: " + info + ".";
		info = value.split(/[.|!|?]\s/g).length;
		infoString += "\nSentences: " + info + ".";
		info = value.split(/[\s\.\?]+/gi).length - 1;
		infoString += "\nWords: " + info + ".";
		info = window.getTimeInfo(window.Math.floor((new window.Date().getTime() - window.JSON.parse(window.sessionStorage.getItem("open_time")))));
		if (info.minutes === 0) {
			if (info.minutes === 1) {
				infoString += "\n\nAlso you have spend 1 second writing";
			} else {
				infoString += "\n\nAlso you have spend " + info.seconds + " seconds writing";
			}
		} else {
			if (info.minutes === 1) {
				infoString += "\n\nAlso you have spend 1 minute writing";
			} else {
				infoString += "\n\nAlso you have spend " + info.minutes + " minutes writing";
			}
		}
		if (typeof pos === "object") {
			infoString += " this document.";
		} else {
			infoString += " it.";
		}
		window.alert("\n" + infoString.replace(/(\n)/gi, "\n\n"));
	}),
	window.Mousetrap.bind(ctrlKey + "+g", function (event) { // List
		event.preventDefault();
		textarea._replaceNewLines(window.localStorage.getItem("list_syntax") + " ");
	}),
	window.Mousetrap.bind(ctrlKey + "+h", function (event) { // Horizontal ruller
		event.preventDefault();
		var pos = textarea._get();
		var hr = window.localStorage.getItem("hr_syntax");
		if (typeof pos === "object") {
			textarea.set(pos[1]);
		}
		if (textarea.value.substring(pos[0] - 1, pos[1]) === "\n") {
			hr = hr + "\n";
		} else {
			hr = "\n" + hr + "\n";
		}
		textarea._insert(hr, textarea._get() + hr.length);
	}),
	window.Mousetrap.bind(ctrlKey + "+i", function (event) { // Italic
		event.preventDefault();
		textarea._wrap(window.localStorage.getItem("bi_syntax"));
	}),
	window.Mousetrap.bind(ctrlKey + "+j", function (event) { // Image
		event.preventDefault();
		var pos = textarea._get(),
			userInput;
		if (typeof pos === "object") {
			if (pos[2].isImageURL()) {
				userInput = window.prompt("Enter the Image Alt Text", pos[2]);
				if (userInput) {
					textarea._insert("![" + userInput + "](" + pos[2] + ")", [pos[0], pos[1] + userInput.length + 5]);
				}
			} else {
				userInput = window.prompt("Enter the Image Adress", "http://");
				if (userInput) {
					textarea._insert("![" + pos[2] + "](" + userInput + ")", [pos[0], pos[1] + userInput.length + 5]);
				}
			}
		} else {
			userInput = window.prompt("Enter the Image Adress", 'http://');
			if (userInput) {
				textarea._insert("![](" + userInput + ")", [pos, pos + userInput.length + 5]);
			}
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+k", function (event) { // Code
		event.preventDefault();
		var pos = textarea._get();
		if (window.localStorage.getItem("code_syntax") === "```") {
			if (typeof pos === "object" && pos[2].indexOf("\n") >= 0) {
				textarea._wrap("```\n", "\n```");
			} else {
				textarea._wrap("```", "```");
			}
        } else {
            textarea._replaceNewLines("    ");
        }
	}),
	window.Mousetrap.bind(ctrlKey + "+l", function (event) { // Link
		event.preventDefault();
		var pos = textarea._get(),
			userInput;
		if (typeof pos === "object") {
			if (pos[2].isURL()) {
				userInput = window.prompt("Enter the Link Title", pos[2]);
				if (userInput) {
					textarea._insert("[" + userInput + "](" + pos[2] + ")", [pos[0], pos[1] + userInput.length + 4]);
				}
			} else {
				userInput = window.prompt("Enter the Link Adress", "http://");
				if (userInput) {
					textarea._insert("[" + pos[2] + "](" + userInput + ")", [pos[0], pos[1] + userInput.length + 4]);
				}
			}
		} else {
			userInput = window.prompt("Enter the Link Adress", 'http://');
			if (userInput) {
				textarea._insert("[](" + userInput + ")", [pos, pos + userInput.length + 4]);
			}
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+o", function (event) { // Open
		event.preventDefault();
		fileInput.click();
	}),
	window.Mousetrap.bind(ctrlKey + "+p", function (event) { // Preview
		event.preventDefault();
		preview();
	}),
	window.Mousetrap.bind(ctrlKey + "+r", function (event) { // Rename
		event.preventDefault();
		var userInput = window.prompt("Rename this document", window.sessionStorage.getItem("doc_name"));
		if (userInput !== null && userInput !== "") {
			changePageTitle(userInput);
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+s", function () { // Save plain text
		event.preventDefault();
		saveFile(window.sessionStorage.getItem("doc_name") + window.sessionStorage.getItem("doc_ext"), textarea.value);
	}),
	window.Mousetrap.bind(ctrlKey + "+z", function(event) { // Undo
		event.preventDefault();
		textarea._undo();
	});
	window.Mousetrap.bind(ctrlKey + "+shift+f", function(event) { // Fullscreen
		event.preventDefault();
		if (window.document.webkitIsFullScreen) {
			window.document.webkitCancelFullScreen();
			textarea.resize();
		} else {
			window.document.body.webkitRequestFullscreen();
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+i", function (event) { // Capitalize
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			textarea._insert(pos[2].toCapitalize(), pos);
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+l", function (event) { // Lowercase
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			textarea._insert(pos[2].toLowerCase(), pos);
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+o", function (event) { // Swapcase
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			textarea._insert(pos[2].toSwapcase(), pos);
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+p", function (event) { // Print HTML
		event.preventDefault();
		var style;
		if (printCSS) {
			style = "<style>" + window.localStorage.getItem("preview_css") + "</style>";
		}
		if (breaks[0]) {
			style += "<style> @media print { hr { display: block; page-break-before: always; } }</style>";
		}
		if (breaks[1]) {
			style += "<style> @media print { h1 { display: block; page-break-before: always; } }</style>";
		}
		if (breaks[2]) {
			style += "<style> @media print { h2 { display: block; page-break-before: always; } }</style>";
		}
		if (hideLinks) {
			style += "<style> a { color: inherit; background: none; text-decoration: inherit;</style>";
			window.open(window.encodeURI("data:text/html;charset=utf-8," + "<!DOCTYPE html><html><head><title>" + window.document.title + "</title><script>window.onload = function() { var links = window.document.getElementsByTagName(\"a\"); for (var i = 0; i < links.length; i++) { links[i].removeAttribute(\"href\"); links[i].removeAttribute(\"style\") }; window.print(); window.close(); }</script></head><body>" + style + window.marked(textarea.value) + "</body></html>"));
		} else {
			window.open(window.encodeURI("data:text/html;charset=utf-8," + "<!DOCTYPE html><html><head><title>" + window.document.title + "</title><script>window.onload = function() { window.print(); window.close(); }</script></head><body>" + style + window.marked(textarea.value) + "</body></html>"));
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+m", function (event) { // Build-in calculator
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos !== "object" && textarea._range(0, pos).lastIndexOf("{") < 0) {
			notify("Use \"{\"", "There is no \"{\". You can use a selection too.");
		} else {
			var equation;
			if (typeof pos === "object") {
				equation = pos[2];
			} else {
				equation = textarea._range(textarea._range(0, pos).lastIndexOf("{") + 1, pos);
			}
			window.Math.solve(equation,
			function (result) {
				if (typeof pos === "object") {
					textarea._insert(result, [pos[0], pos[0] + result.length]);
				} else {
					textarea._remove(textarea._range(0, pos).lastIndexOf("{"), pos, textarea._range(0, pos).lastIndexOf("{"));
					textarea._insert(result, textarea._get() + result.length);
				}
			}, function (error) {
				iframe.contentWindow.document.body.innerText = error;
				error = iframe.contentWindow.document.body.innerText.substring(0, iframe.contentWindow.document.body.innerText.indexOf(":"));
				if (error !== "") {
					if (["a", "e", "i", "o", "u"].indexOf(error.substring(0, 1)) > 0) {
						notify("Could not solve this problem", "It was an " + error.substring(0, error.length - 5).toLowerCase() + " error, view the developer console for more info.");
					} else {
						notify("Could not solve this problem", "It was a " + error.substring(0, error.length - 5).toLowerCase() + " error, view the developer console for more info.");
					}
					window.console.log("The error for solving \"" + equation + "\" was:" + iframe.contentWindow.document.body.innerText.substring(iframe.contentWindow.document.body.innerText.indexOf(":") + 1, iframe.contentWindow.document.body.innerText.length).toLowerCase());
					window.console.log("---");
				} else {
					notify("Could not solve this problem", "Textdown failed to identify the error.");
				}
			});
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+s", function (event) { // Save HTML
		event.preventDefault();
		saveFile(window.sessionStorage.getItem("doc_name") + ".html", window.localStorage.getItem("html_template").replace("{{TITLE}}", window.sessionStorage.getItem("doc_name")).replace("{{PREVIEW_CSS}}", localStorage.getItem("preview_css")).replace("{{HTML_OUTPUT}}", window.marked(textarea.value)));
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+u", function (event) { // Uppercase
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			textarea._insert(pos[2].toUpperCase(), pos);
		}
	}),
	window.Mousetrap.bind(ctrlKey + "+shift+y", function (event) { // Escape HTML
		event.preventDefault();
		var pos = textarea._get();
		if (typeof pos === "object") {
			iframe.contentWindow.document.body.innerHTML = "";
			iframe.contentWindow.document.body.appendChild(document.createTextNode(pos[2]));
			var result = iframe.contentWindow.document.body.innerHTML;
			textarea._insert(result.toLowerCase(), [pos[0], pos[0] + result.length]);
		}
	}),
	window.Mousetrap.bind("shift+e", function (event) { // Help
		event.preventDefault();
		isURLOpen("chrome-extension://" + window.chrome.i18n.getMessage("@@extension_id") + "/docs/keyboard_shortcuts.html", function (isOpen, tab) {
				if (isOpen) {
					window.chrome.windows.update(tab.windowId, {
						focused: true
					});
				} else {
					window.chrome.windows.getCurrent({}, function () {
						window.chrome.windows.create({
							"url": "chrome-extension://" + window.chrome.i18n.getMessage("@@extension_id") + "/docs/keyboard_shortcuts.html",
							"type": "popup",
							"width": 480,
							"height": parseInt(screen.availHeight - (screen.availHeight * 0.2), 10),
							"left": parseInt((screen.availWidth - 480)/2, 10),
							"top": parseInt(screen.availHeight * 0.1, 10)
						});
					});
				}
			});
	}),
	window.Mousetrap.bind("esc", function (event) { // Words Shortcuts
		event.preventDefault();
		if (shortcuts !== null) {
			var pos = textarea._get(),
				shortcut;
			if (typeof pos === "object") {
				shortcut = pos[2];
				if (shortcuts[shortcut] !== undefined) {
					if (typeof shortcuts[shortcut] === "string") {
						textarea._insert(shortcuts[shortcut], [pos[0], pos[0] + shortcuts[shortcut].length]);
					} else {
						notify("Invalid", "Your shortcut should return a string.");
					}
				} else {
					notify("Shortcut not found", shortcut + " not found.");
				}
			} else {
				if (textarea._range(0, textarea.getCaretPosition()).lastIndexOf(" ") > textarea._range(0, textarea.getCaretPosition()).lastIndexOf("\n")) {
					shortcut = textarea._range(textarea._range(0, pos).lastIndexOf(" ") + 1, pos);
				} else if (textarea._range(0, pos).lastIndexOf(" ") < textarea._range(0, pos).lastIndexOf("\n")) {
					shortcut = textarea._range(textarea._range(0, pos).lastIndexOf("\n") + 1, pos);
				} else {
					shortcut = textarea.value;
				}
				if (shortcuts[shortcut] !== undefined) {
					if (typeof shortcuts[shortcut] === "string") {
						textarea._remove(pos - shortcut.length, pos, pos - shortcut.length);
						textarea._insert(shortcuts[shortcut], pos - shortcut.length + shortcuts[shortcut].length);
					} else {
						notify("Invalid", "Your shortcut should return a string.");
					}
				} else {
					notify("Shortcut not found", shortcut + " not found.");
				}
			}
		}
	});

	// Confirm close
	window.onbeforeunload = function () {
		if (window.JSON.parse(window.localStorage.getItem("confirm_close"))) {
			return "";
		}
	};

	// Load session storage
	if (window.sessionStorage.getItem("doc_name") !== null) {
		changePageTitle(window.sessionStorage.getItem("doc_name"));
		textarea.scrollTop = window.sessionStorage.getItem("scroll_top");
		textarea._set(window.sessionStorage.getItem("caret"));
		textarea.value = window.sessionStorage.getItem("text");
	} else {
		window.sessionStorage.setItem("doc_ext", window.localStorage.getItem("doc_ext"));
		window.sessionStorage.setItem("open_time", new Date().getTime());
		var hash = window.getUrlVars();
		if (hash.open === "1") {
			if (hash.file !== undefined) {
				window.console.log(window.JSON.parse(window.decodeURIComponent(hash.file)));
				loadFiles([window.JSON.parse(window.decodeURIComponent(hash.file))]);
			} else {
				changePageTitle(window.decodeURIComponent(hash.title));
				textarea.value = window.decodeURIComponent(hash.text);
				store();
			}
		} else {
			if (window.localStorage.getItem("start_with") !== "Welcome Text") {
				textarea.value = "";
			}
			textarea._set(0);
			if (window.JSON.parse(window.localStorage.getItem("ask"))) {
				var docName = window.prompt("Name this document");
				if (docName !== null) {
					if (docName === "") {
						docName = "Untitled";
					}
					changePageTitle(docName);
				} else {
					window.open("", "_self", "");
					window.close();
				}
			} else {
				changePageTitle("Untitled");
			}
		}
	}

	// "Start"
	if (window.JSON.parse(window.localStorage.getItem("open_preview"))) {
		preview();
	}
	if (window.JSON.parse(window.localStorage.getItem("open_fullscreen"))) {
		window.document.body.webkitRequestFullscreen();
	}
};