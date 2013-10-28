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
    options.headers['Connection'] = 'close';
    if (request.headers['content-length']) {
        options.headers['content-length'] = request.headers['content-length']
    }

    var proxyRequest = http.request(options, function (proxy_response) {
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
        proxy_response.pipe(response);
    });

    proxyRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    request.pipe(proxyRequest);
});

app.get('/', express.bodyParser(), function(req, res) {
    if (req.session.manager_authorized) {
        app.BodegaManager.index(req, res);
    } else {
        res.render('login', {
            network: app.config.server.name
        });
    }
    //res.render('index');
});

app.post('/', express.bodyParser(), function(req, res){
    app.BodegaManager.login(req, res);
});

app.get('/index', express.bodyParser(), isAuthorized, function(req, res) {
    app.BodegaManager.index(req, res);
});

app.get('/login/info', express.bodyParser(), isAuthorized,  function(req, res) {
    app.BodegaManager.loginInfo(req, res);
});

app.get('/login/confirm', express.bodyParser(), function(req, res){
    app.BodegaManager.loginconfirm(req, res);
});

//register
app.get('/register', express.bodyParser(), function(req, res) {
    res.render('register', {
        network: app.config.server.name
    });
});

app.post('/register', express.bodyParser(), function(req, res) {
    app.BodegaManager.register(req, res);
});

app.get('/register/confirm', express.bodyParser(), function(req, res) {
    res.render('registerconfirm', {
        network: app.config.server.name,
        success: utils.parseBool(req.query.success),
        error: req.query.error
    });
});

//account
app.get('/account/modify', express.bodyParser(), isAuthorized, function(req, res) {
    app.BodegaManager.loginInfo(req, res);
});

app.post('/account/modify', isAuthorized, function(req, res) {
    app.BodegaManager.accountmodify(req, res);
});

app.get('/account/changePassword', isAuthorized, function(req, res) {
    app.BodegaManager.changepassword(req, res);
});

app.get('/account/modify/confirm', express.bodyParser(), isAuthorized, function(req, res) {
     res.render('accountmodifyconfirm', {
         result: utils.parseBool(req.query.success),
         error: req.query.error,
         network: app.config.server.name
    });
});

app.get('/account', express.bodyParser(), isAuthorized, function(req, res) {
    res.redirect('/account/modify');
    //res.render('account');
});

app.get('/account/resetPassword', express.bodyParser(), function(req, res){
    res.render('resetpassword', {
         network: app.config.server.name
   });
});

app.post('/account/resetPassword', express.bodyParser(), function(req, res){
    app.BodegaManager.resetpassword(req, res);
});

app.get('/account/resetPassword/confirm', express.bodyParser(), function(req, res){
    res.render('resetpasswordconfirm', {
        success: utils.parseBool(req.query.success),
        error: req.query.error,
        network: app.config.server.name
    });
});



app.get('/asset/list/?:listType?', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.listassets(req, res);
});

app.get('/asset/create/?:assetType?', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.createasset(req, res);
});

app.post('/asset/create/?:assetType?', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.createasset(req, res);
});

app.get('/stats/assets', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.assetStats(req, res);
});

app.get('/store/list', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.listStores(req, res);
});

app.get('/partner/list', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.listPartners(req, res);
});

app.get('/partner/approve', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.partnerapprove(req, res);
});

app.get('/asset/publish', express.bodyParser(), isAuthorized, function(req, res){
    app.BodegaManager.publishasset(req, res);
});

app.get('/logout', express.bodyParser(), function(req, res) {
    req.session.destroy();
    delete app.cookie;

    res.redirect('/');
});

