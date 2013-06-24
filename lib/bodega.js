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

var http = require('http');
var loginRequest = require('./login.js');
var loginConfirm = require('./loginconfirm.js');
var index = require('./index.js');
var loginInfo = require('./logininfo.js');
var assetStats = require('./assetStats.js');
var assetList = require('./assetList.js');
var storeList = require('./storeList.js');
var createAsset = require('./createAsset.js');
var partnerList = require('./partnerList.js');

var BodegaManager = (function() {

    function BodegaManager() {
    }

    /* this method can be called either with req, res or without them
    example:
        bodega = new BodegaManager();
        //1st way to use it(its the most common way to use this method)
        NOTE: url must be a function which has as parameters req and res and returns
        an options object see http://nodejs.org/api/http.html#http_http_request_options_callback
        like
        url(req, res);

        cb must be a function which has as parameters req, res, remoteRes, chuck, like
        cb(req, res, remoteRes, chunk);

        Otherwise you are doing it wrong and IT WON'T WORK!!!

        bodega.connect(url, cb);

        //2nd way to use it(we rarely use this way)
        NOTE: url must be an options object

        cb must be a function which has as parameter at least chuck(you can also have
        other parameters), like
        cb(chunk, [...]);

        otherwise you are doing it wrong
        and IT WON'T WORK!!!!

        bodega.connect(url, cb);



        Final notice: Don't duplicate the functionality of this method, never,
        you can access BodegaManager from app.BodegaManager. It has been proven
        that http.get can fail easily and we don't want to watch x duplications
        of the same code, so don't duplicate this method!!!
    */

    BodegaManager.prototype.connect = function(url, cb, req, res, method) {
        function get(path) {
            var chunk = '';
            http.get(path, function(remoteRes) {
                console.log("Got response: " + remoteRes.statusCode);
                remoteRes.on('data', function(c) {
                    chunk += c;
                });

                remoteRes.on('end', function() {
                    if (req === undefined && res === undefined) {
                        cb(remoteRes, chunk);
                    } else {
                        cb(req, res, remoteRes, chunk);
                    }
                });
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        }

        if (req === undefined && res === undefined) {
            get(url);
        } else {
            get(url(req, res));
        }
    };

    BodegaManager.prototype.login = function(req, res) {
        //connect as the user
        this.connect(loginRequest.requestUrl, loginRequest.communicate, req, res, 'GET');
    };

    BodegaManager.prototype.loginconfirm = function(req, res) {
        loginConfirm(req, res);
    };

    BodegaManager.prototype.index = function(req, res) {
        index.loadMainPage(req, res);
    };

    BodegaManager.prototype.listassets = function(req, res) {
        assetList.show(req, res);
    };

    BodegaManager.prototype.liststores = function(req, res) {
        storeList.show(req, res);
    };

    BodegaManager.prototype.createasset = function(req, res) {
        if (req.method === 'GET' || !req.files) {
            createAsset.show(req, res);
        } else {
            createAsset.upload(req, res);
        }
    };

    BodegaManager.prototype.loginInfo = function(req, res) {
        this.connect(loginInfo.requestUrl, loginInfo.communicate, req, res, 'GET');
    };

    BodegaManager.prototype.assetStats = function(req, res) {
        this.connect(assetStats.requestUrl, assetStats.communicate, req, res, 'GET');
    };

    BodegaManager.prototype.listpartners = function(req, res) {
        partnerList.show(req, res);
    };

    return BodegaManager;

})();

module.exports.BodegaManager = BodegaManager;
