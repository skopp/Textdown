window.marked.setOptions({
    gfm: window.JSON.parse(window.localStorage.getItem("gfm")),
    tables: window.JSON.parse(window.localStorage.getItem("tables")),
    breaks: window.JSON.parse(window.localStorage.getItem("breaks")),
    pedantic: false,
    sanitize: window.JSON.parse(window.localStorage.getItem("ignore_html")),
    smartLists: false
});