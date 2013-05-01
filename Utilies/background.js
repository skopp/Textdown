window.onload = function() {
    "use strict";
    window.chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.greeting === "getId") {
            sendResponse({
                id: sessionStorage.getItem("id")
            });
        }
    });
    window.chrome.management.getAll(function(info) {
        for(var i = 0; i < info.length; i++) {
            var ext = info[i];
            if(ext.name === "Textdown") {
                sessionStorage.setItem("id", ext.id);
            }
        }
    });
    if (window.chrome.fileBrowserHandler) {
        window.chrome.fileBrowserHandler.onExecute.addListener(function(id, details) {
            if(id === "open") {
                var fileEntries = details.entries;
                for(var i = 0, entry; entry = fileEntries[i]; ++i) {
                    entry.file(function(file) {
                        var reader = new window.FileReader(),
                            title = file.name;
                        reader.onload = function(event) {
                            window.open("chrome-extension://" + sessionStorage.getItem("id") + "/editor.html?open=1&title=" + window.encodeURIComponent(title) + "&text=" + window.encodeURIComponent(event.target.result));
                        };
                        reader.readAsText(file);
                    });
                }
            }
        });
    }
    function copyString(string) {
        window.document.body.innerHTML = string;
        window.document.execCommand('selectAll', false, null);
        window.document.execCommand("Copy");
    }
    var contexts = ["link", "image"];
    window.chrome.contextMenus.create({
        "title": "Copy Link Adress as Markdown",
        "contexts": [contexts[0]],
        "onclick": function(info) {
            if(info.selectionText !== info.linkUrl) {
                copyString("[" + info.selectionText + "](" + info.linkUrl + ")");
            } else {
                copyString("[](" + info.linkUrl + ")");
            }
        }
    });
    window.chrome.contextMenus.create({
        "title": "Copy Image Adress as Markdown",
        "contexts": [contexts[1]],
        "onclick": function(info) {
            copyString("![image](" + info.srcUrl + ")");
        }
    });
    window.chrome.contextMenus.create({
        "title": "Copy Page Adress as Markdown",
        "onclick": function(tab, info) {
            copyString("[" + info.title + "](" + tab.pageUrl + ")");
        }
    });
};