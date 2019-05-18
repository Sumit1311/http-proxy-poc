var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cheerio = require('cheerio');

var socketsToURL = {};

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const harmon = require('harmon');

const httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var selects = [];
var simpleselect = {};

simpleselect.query = 'html';
simpleselect.func = function (node, req, res) {
  //console.log(node);
    var body = Buffer.from("");
  let stream = node.createReadStream({
      outer : true
  });
    let writeStream = node.createWriteStream({
        outer : true
    });
  stream.on("data", (chunk) => {
      //console.log("Chunk received length " +chunk.length)
      var length = body.length + chunk.length;
      body = Buffer.concat([body, chunk], length);
  });
    stream.on("end", () => {
        console.log("Length of the body : " +body.length);
        body = body.toString();
        //console.log(body);
        let $ = cheerio.load(body);
        $("title").text("Unicorns!");
        console.log("Bpdy is : ",$("body").text());
        $("body").append("<style>.mystupidcssclass { background-color: red;}</style>");
        $("body").prepend("<div class='mystupidcssclass'>Hacked!</div>");
        $("body").append("<script>alert('Hello World!');</script>");
        //console.log("Bpdy is : ",$("body").html());
        $("[src]").each((index, value) => {
            var src = $(value).attr("src");
            //console.log(src);
            if(src.search(/:\/\//g) == -1) {
                src = "http://localhost:3000/" + src + "?url="+req.customUrl;
            }
            //console.log(src);
            $(value).attr("src", src);
        })
        $("[href]").each((index, value) => {
            var src = $(value).attr("href");
            //console.log(src);
            if(src.search(/:\/\//g) == -1) {
                src = "http://localhost:3000/" + src + "?url="+req.customUrl;
            }
            //console.log(src);
            $(value).attr("href", src);
        })
        writeStream.end($.html());
    });



    //res.end("Done");
}

selects.push(simpleselect);
//,harmon([], selects)
//app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use("/*", harmon([], selects, true) ,(req, res, next) => {
    if(req.baseUrl == "/favicon.ico") {
        return res.end();
    }
    var url = req.query.url;
    console.log(req.socket.toString());
    if(socketsToURL[req.socket.toString()] === undefined) {
        socketsToURL[req.socket.toString()]=url;
    }
    url = url == undefined ? socketsToURL[req.socket.toString()] : url;
    console.log("Calling proxy : ","https://www."+url+req.baseUrl);
    req.customUrl = url;
    //req.query.url = "";
    proxy.web(req, res, {
      target : "https://www."+url+req.baseUrl,
      changeOrigin: true
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

proxy.on('proxyReq', (proxyReq, req, res) => {
    console.log("Proxy Request : ", proxyReq.path)
    proxyReq.path = proxyReq.path.slice(0, proxyReq.path.lastIndexOf("/?"))
    if(proxyReq.path == "")
        proxyReq.path="/";
    console.log("Proxy Request : ", proxyReq.path)
});
