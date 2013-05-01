if (window.navigator.platform.toLowerCase().indexOf("mac") >= 0) {
    window.addEventListener("load", function () {
        "use strict";
        var addTopline = function () {
            window.chrome.windows.getCurrent({}, function (w) {
                if (w.type === "popup") {
                    var topLine = window.document.createElement('div');
                    topLine.style.cssText = "background: #777; height: 1px; left: 0; position: fixed; top: 0; width: 100%;";
                    window.document.body.appendChild(topLine);
                    window.chrome.windows.onFocusChanged.addListener(function () {
                        window.chrome.windows.getCurrent({}, function (w) {
                            if (w.focused) {
                                topLine.style.background = "#7a7a7a";
                            } else {
                                topLine.style.background = "#b2b2b2";
                            }
                        });
                    });
                }
            });
        };
        addTopline();
        chrome.tabs.onDetached.addListener(function () {
            addTopline();
        });
    });
}