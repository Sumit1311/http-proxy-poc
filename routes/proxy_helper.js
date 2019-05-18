const { http, https } = require("follow-redirects");
const request = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');
const httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

// initialize the app
exports.getResponse = getResponse;
exports.fixURL = fixURL;

async function getResponse(url, url_path) {
    var url = await fixURL(url);
    console.log("Calling proxy1 "+url);
    //proxy.web(req, res, { target: url, changeOrigin: true, selfHandleResponse : true} );
    console.log("Sending request "+ url + url_path);
    return request({
        uri: url + "/"+url_path,
        resolveWithFullResponse: true
    })
    .then((response) => {
            console.log(response.statusCode);
            return {
                body : cheerio.load(response.body),
                headers : response.headers,
                statusCode : response.statusCode,
                statusMessage : response.statusMessage,
                customUrl : url
            }
        });

};

proxy.on('proxyRes', (proxyRes, req, res) => {
    let body = new Buffer.from('');
    proxyRes.on('data', function (data) {
        //console.log("Got Chunk", data);
        body = Buffer.concat([body, data]);
    });
    proxyRes.on('end', function () {
        body = body.toString();
        console.log("res from proxied server:", body);
        var body = cheerio.load(body);
        body("title").text("Unicorns!");
        body("body").append("<div class='mystupidcssclass'>Hacked!</div>");
        body("body").append("<script>alert('Hello World!');</script>");
        body("body").append("<style>.mystupidcssclass { background-color: red;}</style>");
        body("[src]").each((index, value) => {
            var src = body(value).attr("src");
            console.log(src);
            if(src.search(/:\/\//g) == -1) {
                src = "http://localhost:3000/proxy/" + src + "?url="+url;
            }
            console.log(src);
            body(value).attr("src", src);
        })
        body("[href]").each((index, value) => {
            var src = body(value).attr("href");
            console.log(src);
            if(src.search(/:\/\//g) == -1) {
                src = "http://localhost:3000/proxy/" + src + "?url="+url;
            }
            console.log(src);
            body(value).attr("href", src);
        })

        res.end(body);
    });

});

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
