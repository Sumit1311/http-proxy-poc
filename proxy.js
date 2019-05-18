const { http, https } = require("follow-redirects");
var hoxy = require("hoxy");

// initialize the app
init();

async function init() {
    var url = await fixURL("reactgeeks.com");
    var proxy = hoxy
        .createServer({
            reverse: url
        })
        .listen(4500);
    proxy.intercept(
        {
            phase: "response",
            mimeType: "text/html",
            as: "$"
        },
        function (req, resp) {
            resp.$("title").text("Unicorns!");
            resp.$("body").prepend("<div class='mystupidcssclass'>Hacked!</div>");
            resp.$("body").append("<script>alert('Hello World!');</script>");
            resp
                .$("body")
                .append("<style>.mystupidcssclass { background-color: red;}</style>");
        }
    );
};

function fixURL(url) {
    url = 'http://' + extractHostname(url);
    return new Promise((resolve, reject) => {
        http.get(url, (response) => {
            resolve(response.responseUrl);
        });
    });
}

function extractHostname(url) {
    var hostname;
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname;
}
