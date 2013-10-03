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

var utils = require('./utils.js');
var http = require('http');

var username;
var password;

var communicate = function(req, res, remoteRes, chunk) {
    console.log(chunk);
    var reply = JSON.parse(chunk.toString('utf8'), 'utf8');

    if (req.session !== undefined && req.session.authorized !== undefined) {
        req.session.authorized = false;
    }

   // console.log(remoteRes.headers);

    var internalChunk = '';
    if (reply.authStatus === true) {
        //auth the user
        req.session.username = username;
        req.session.password = password;
        req.session.points = reply.points;
        req.session.userId = reply.userId;
        req.session.authorized = true;
        app.cookie = remoteRes.headers['set-cookie'];
        //res.redirect('index');

        http.get(partnersUrl(), function(remoteRes) {
            console.log("Got response: " + remoteRes.statusCode);
            remoteRes.on('data', function(c) {
                internalChunk += c;
            });

            remoteRes.on('end', function() {
                var internalReply = JSON.parse(internalChunk.toString('utf8'), 'utf8');
                req.session.partners = internalReply.partners;
                console.log(req.session.partners);
                //connect as the user
                res.redirect('index');
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
            res.redirect('login/confirm');
        });

        //don't go into the next redirect
        return;
    }

    res.redirect('login/confirm');
};

var requestUrl = function(req, res) {
    //TODO remove the hard coded vivaldi
    var query = {
        auth_user: req.body.username,
        auth_password: req.body.password,
        auth_device: app.config.server.store
    };

    username = query.auth_user;
    password = query.auth_password;

    return utils.options('auth', query);
};

var partnersUrl = function(req, res) {
    console.log(utils.options('partner/list'));
    return utils.options('partner/list', 0, true);
};

module.exports.communicate = communicate;
module.exports.requestUrl = requestUrl;



