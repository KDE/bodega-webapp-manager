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

function isAuthorized(req, res, next)
{
    if (req.session.authorized) {
        next();
    } else {
        console.log("Unauthorized user", req, res);
        res.redirect('/');
    }
}

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

app.get('/asset/list/?:listType?', isAuthorized, function(req, res){
    app.BodegaManager.listassets(req, res);
});

app.get('/asset/create', isAuthorized, function(req, res){
    app.BodegaManager.createasset(req, res);
});

app.post('/asset/create', isAuthorized, function(req, res){
    app.BodegaManager.createasset(req, res);
});

app.get('/stats/assets', isAuthorized, function(req, res){
    app.BodegaManager.assetStats(req, res);
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    delete app.cookie;

    res.redirect('/');
});

app.get('/json/*', function(req, res){
    app.BodegaManager.jsonProxy(req, res);
});

app.post('/json/*', function(req, res){
    app.BodegaManager.jsonProxy(req, res);
});

// app.get('/static/*', function(req, res) {
//     res.sendfile(__dirname + '/public' + req.url);
// });

