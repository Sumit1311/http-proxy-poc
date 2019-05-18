var express = require('express');
var router = express.Router();
var proxyHelper = require('./proxy_helper');

const httpProxy = require('http-proxy');
const cheerio = require('cheerio');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});


/* GET home page. */
/*router.get("/*", function(req, res, next) {
    var url = req.query.url;
    //var path= req.path.replace("/proxy\//", "");
    proxyHelper.getResponse(url, req.path)
    .then((proxyResponse) => {
            var headers = proxyResponse.headers;
            res.statusCode=proxyResponse.statusCode;
            res.statusMessage=proxyResponse.statusMessage;
            //res.statusMessage=proxyResponse.statusMessage;
            Object.keys( headers ).forEach( key => {
                res.setHeader(key, headers[key])
            });  // 10, 20, 30
            proxyResponse.body("title").text("Unicorns!");
            proxyResponse.body("body").append("<div class='mystupidcssclass'>Hacked!</div>");
            proxyResponse.body("body").append("<script>alert('Hello World!');</script>");
            proxyResponse.body("body")
                .append("<style>.mystupidcssclass { background-color: red;}</style>");
            proxyResponse.body("[src]").each((index, value) => {
                var src = proxyResponse.body(value).attr("src");
                console.log(src);
                if(src.search(/:\/\//g) == -1) {
                    src =  proxyResponse.customUrl +"/"+ src;
                }
                console.log(src);
                proxyResponse.body(value).attr("src", src);
            })
            proxyResponse.body("[href]").each((index, value) => {
                var src = proxyResponse.body(value).attr("href");
                console.log(src);
                if(src.search(/:\/\//g) == -1) {
                    src =  proxyResponse.customUrl +"/"+ src;
                }
                console.log(src);
                proxyResponse.body(value).attr("href", src);
            })
            res.end(proxyResponse.body.html());
        });
});*/

var selects = [];
var simpleselect = {};

simpleselect.query = 'body';
simpleselect.func = function (node) {
    console.log(node);
    node.createWriteStream().end('<div>+ Trumpet</div>');
}

selects.push(simpleselect);

router.get("/*",function(req, res, next) {
    var url = req.query.url;
    console.log("Calling proxy");
    proxy.web(req, res, {
        target : "http://www."+url,
        changeOrigin: true
    });
})

module.exports = router;
