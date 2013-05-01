window.onload = function () {
    "use strict";

    var preview = window.document.getElementsByTagName("div")[0],
        smartScroll = window.JSON.parse(window.localStorage.getItem("smart_scroll"));

    // Misc methods
    HTMLElement.prototype.getStyleProperty = function (p) {
        return window.document.defaultView.getComputedStyle(this, null).getPropertyValue(p);
    };
    String.prototype.isURL = function () {
        var regExp = /(ftp|http|https|file):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i; // regexp from http://stackoverflow.com/questions/3498779/how-to-find-a-url-within-full-text-using-regular-expression
        return regExp.test(this);
    };

    // Smart scroll offset
    if (smartScroll) {
        switch (window.localStorage.getItem("smart_scroll_pos")) {
        case "top":
            window.document.body.smartScrollOffset = -(parseInt(preview.getStyleProperty("font-size"), 10) * 2) + (window.innerHeight / 1.1);
            break;
        case "middle":
            window.document.body.smartScrollOffset = -parseInt(preview.getStyleProperty("font-size"), 10) + (window.innerHeight / 2);
            break;
        default:
            window.document.body.smartScrollOffset = 0;
            break;
        }
    }

    // Preview function
    var updatePreview = function () {

        // Smart scroll
        if (smartScroll) {
            preview.innerHTML = window.marked(localStorage.getItem("text").substring(0, localStorage.getItem("caret")));
            window.document.body.newScrollTop = window.document.body.scrollHeight - window.parent.innerHeight;
            preview.innerHTML = window.marked(localStorage.getItem("text"));
            if (window.document.body.newScrollTop !== 0) {
                window.document.body.scrollTop = window.document.body.newScrollTop + document.body.smartScrollOffset;
            } else {
                window.document.body.scrollTop = 0;
            }
        } else {
            preview.innerHTML = window.marked(localStorage.getItem("text"));
        }

        // Handle the links
        preview.links = window.document.getElementsByTagName("a");
        for (var i = 0; i < preview.links.length; i++) {
            if (preview.links[i].href.isURL()) {
                preview.links[i].target = "_blank";
            }
        }
    };

    // Request listener
    window.chrome.extension.onMessage.addListener(

    function (request) {
        if (request.greeting === "preview") {
            updatePreview();
        }
    });

    // Keyboards shortcuts
    var ctrlKey = "ctrl",
        userInput = "",
        previewCSS = window.document.getElementById("preview_css").innerHTML;
    if (window.navigator.platform.toLowerCase().indexOf("mac") >= 0) {
        ctrlKey = "command";
    }
    window.Mousetrap.bind(ctrlKey + "+P", function (event) {
        event.preventDefault();
        window.open("", "_self", "");
        window.close();
    });
    window.Mousetrap.bind(ctrlKey + "+n", function (event) { // create and open a uri of the preview
        event.preventDefault();
        userInput = window.prompt("Type a cute name", userInput);
        if (userInput !== null) {
            if (userInput === "") {
                userInput = ["Lisa", "Chuck"][window.Math.floor(window.Math.random() * 2)];
            }
            var uri = "data:text/html;charset=utf-8," + window.encodeURI("<!DOCTYPE html><html>" + "<head><title>" + userInput + "</title><style>" + previewCSS + "</style><body class=\"" + document.body.className + "\">" + preview.innerHTML + "</body></html>");
            window.open(uri);
        }
    });
    window.Mousetrap.bind(ctrlKey + "+s", function (event) {
        event.preventDefault();
    });
    window.Mousetrap.bind(ctrlKey + "+p", function (event) {
        event.preventDefault();
    });

    // First preview
    updatePreview();

    // Close if there is no editor
    var isURLOpen = function (url, callback) { // check is url is open
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
    };
    window.chrome.tabs.onRemoved.addListener(function() {
        isURLOpen("chrome-extension://" + window.chrome.i18n.getMessage("@@extension_id") + "/editor.html", function(isOpen) {
            if (!isOpen) {
                window.close();
            }
        });
    });

};