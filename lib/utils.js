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

var querystring = require('querystring');
var url = require('url');

module.exports.parseBool = function(string)
{
    if (typeof string === 'boolean') {
        return string;
    }

    return (string === 'true' || string === '1') ? true : false;
};

var options = function(req, pathname, query, auth, useDomainInsteadOfIp) {

    var p = app.config.server.api + pathname;

    if (query !== undefined && query !== null) {
        p = p + '?' + querystring.stringify(query);
    }

    var options = {
        hostname: app.config.server.hostname,
        port: app.config.server.port,
        method: 'GET',
        path: p,
        headers: {}
    };

    if (auth !== undefined && auth !== false && req && req.session) {
        options.headers = {
            'cookie': req.session.servercookie
        };
    }

    return options;
};

var defaultEnv = function(req) {

    var distributor = false;
    var publisher = false;

    for (var i in req.session.partners) {
        if (req.session.partners[i].distributor) {
            distributor = true;
        }
        if (req.session.partners[i].publisher) {
            publisher = true;
        }
    }
    return {
        network: app.config.network,
        remoteUrl: app.config.server.publicUrl,
        userName: req.session.username,
        inManagementGroup: req.session.partners && req.session.partners.length && req.session.partners[0] && req.session.partners[0].id === 0,
        inDistributorGroup: distributor,
        inPublisherGroup: publisher
    }
}

module.exports.options = options;
module.exports.defaultEnv = defaultEnv;
