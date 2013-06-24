/*
    Copyright 2013 Giorgos Tsiapaliokas <terietor@gmail.com>
    Copyright 2013 Antonis Tsiapaliokas <kok3rs@gmail.com>

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License as
    published by the Free Software Foundation; either version 2 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var RedisStore = require('connect-redis')(express);
var sockjs  = require('sockjs');
var option = require('./lib/utils.js').options

GLOBAL.app = module.exports = express();

app.config = JSON.parse(fs.readFileSync(('./config.json'), 'utf8'));


app.set('port', app.config.client.port);
app.set('hostname', app.config.client.hostname);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());

//app.use(express.methodOverride());
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/js/validator', express.static(__dirname + '/node_modules/validator/'));

app.use(express.cookieParser());
app.use(express.session({ secret: "love cookies",
                            store: new RedisStore(app.config.redis) }));

app.use(app.router);
app.use(function(req, res, next) {
    res.render('404.jade', {});
});


// We don't want an exception to kill our app, but we don't want
//   to intercept exception in tests or during dev testing
if ('production' == app.get('env')) {
    app.use(express.errorHandler());
    process.on('uncaughtException', function(err) {
        console.log("Uncaught exception: ");
        console.log(err);
        console.log(err.stack);
    });
} else {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}



//app.server must be initialized before BodegaManager!!
//app.server = http.createServer(app);

app.server = http.createServer(function(request, response) {
    if (request.url.indexOf('/json/') === -1) {
        return app(request, response);
    } else {
        var options = option(request.url.substring(String("/json/").length), null, true);
        options.method = request.method;

        options.headers['Content-Type'] = request.headers['content-type'];
        if (request.headers['content-length']) {
            options.headers['content-length'] = request.headers['content-length']
        }

        var proxyRequest = http.request(options);

        proxyRequest.addListener('response', function (proxy_response) {
            response.writeHead(proxy_response.statusCode, proxy_response.headers);
            proxy_response.pipe(response);
        });

        request.pipe(proxyRequest);

        proxyRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
    }

});

var bodega = require('./lib/bodega.js').BodegaManager;
var BodegaManager = new bodega();
app.BodegaManager = BodegaManager;

require("./routes.js");

app.server.listen(app.get('port'), app.get('hostname'), function() {
  console.log("Bodega web application client listening on " + app.get('hostname') + ':' + app.get('port'));
});
