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

function communicate(req, res, remoteRes, chunk) {
    var reply = JSON.parse(chunk.toString('utf8'), 'utf8');
    req.session.firstName = reply.firstName;
    req.session.lastName = reply.lastName;
    req.session.email = reply.email;

    var env = utils.defaultEnv(req);
    env.firstName = req.session.firstName;
    env.lastName = req.session.lastName;
    env.email = req.session.email;

    res.render('accountmodify', env);

}

function requestUrl(req, res) {
    var options = utils.options(req, 'participant/info', null, true);

    return options;
}

module.exports.requestUrl = requestUrl;
module.exports.communicate = communicate;

