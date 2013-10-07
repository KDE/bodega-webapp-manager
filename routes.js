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

var utils = require('./lib/utils');

var express = require('express');
var http = require('http');

function isAuthorized(req, res, next)
{
    if (req.session.manager_authorized) {
        next();
    } else {
        console.log("Unauthorized user " + req.url);
        res.redirect('/');
    }
}

app.all('/json/*', function(request, response) {
        var options = utils.options(request, request.url.substring(String("/json/").length), null, true);
        options.method = request.method;

        //console.log(JSON.stringify(request.headers.cookie));
        options.headers['Content-Type'] = request.headers['content-type'];
        if (request.headers['content-length']) {
            options.headers['content-length'] = request.headers['content-length']
        }

        var proxyRequest = http.request(options);

        proxyRequest.addListener('response', function (proxy_response) {
            response.writeHead(proxy_response.statusCode, proxy_response.headers);
            proxy_response.pipe(response);
        });

        proxyRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        request.pipe(proxyRequest);
});

app.get('/', function(req, res) {
    res.render('login', {
        network: app.config.server.name
    });
    //res.render('index');
});

app.post('/', function(req, res){
    app.BodegaManager.login(req, res);
});

app.get('/index', isAuthorized, function(req, res) {
    app.BodegaManager.index(req, res);
});

app.get('/login/info', isAuthorized,  function(req, res) {
    app.BodegaManager.loginInfo(req, res);
});

app.get('/login/confirm', function(req, res){
    app.BodegaManager.loginconfirm(req, res);
});

//register
app.get('/register', function(req, res) {
    res.render('register', {
        network: app.config.server.name
    });
});

app.post('/register', function(req, res) {
    app.BodegaManager.register(req, res);
});

app.get('/register/confirm', function(req, res) {
    res.render('registerconfirm', {
        network: app.config.server.name,
        success: app.operationStatus,
        message: app.operationMessage
    });
});

//account
app.get('/account/modify',isAuthorized, function(req, res) {
    app.BodegaManager.loginInfo(req, res);
});

app.post('/account/modify', isAuthorized, function(req, res) {
    app.BodegaManager.accountmodify(req, res);
});

app.get('/account/modify/confirm', isAuthorized, function(req, res) {
     res.render('accountmodifyconfirm', {
         result: app.operationStatus,
         network: app.config.server.name
    });
});

app.get('/account', isAuthorized, function(req, res) {
    res.redirect('/account/modify');
    //res.render('account');
});

app.get('/account/resetPassword', function(req, res){
    res.render('resetpassword', {
         network: app.config.server.name
   });
});

app.post('/account/resetPassword', function(req, res){
    app.BodegaManager.resetpassword(req, res);
});

app.get('/account/resetPassword/confirm', function(req, res){
    res.render('resetpasswordconfirm', {
        message: app.operationMessage,
        result: app.operationStatus,
        network: app.config.server.name
    });
});



app.get('/asset/list/?:listType?', isAuthorized, function(req, res){
    app.BodegaManager.listassets(req, res);
});

app.get('/asset/create/?:assetType?', isAuthorized, function(req, res){
    app.BodegaManager.createasset(req, res);
});

app.post('/asset/create/?:assetType?', isAuthorized, function(req, res){
    app.BodegaManager.createasset(req, res);
});

app.get('/stats/assets', isAuthorized, function(req, res){
    app.BodegaManager.assetStats(req, res);
});

app.get('/store/list', isAuthorized, function(req, res){
    app.BodegaManager.listStores(req, res);
});

app.get('/partner/list', isAuthorized, function(req, res){
    app.BodegaManager.listPartners(req, res);
});

app.get('/partner/approve', isAuthorized, function(req, res){
    app.BodegaManager.partnerapprove(req, res);
});

app.get('/asset/publish', isAuthorized, function(req, res){
    app.BodegaManager.publishasset(req, res);
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    delete app.cookie;

    res.redirect('/');
});

// app.get('/static/*', function(req, res) {
//     res.sendfile(__dirname + '/public' + req.url);
// });

