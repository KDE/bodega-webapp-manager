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

var option = require('./utils.js').options;

var communicate = function(req, res, remoteRes, chunk) {
    var reply = JSON.parse(chunk.toString('utf8'), 'utf8');

    console.log(reply);

    app.operationStatus = reply.success;
    res.redirect('account/modify/confirm');
};

var requestUrl = function(req, res) {

    var query = {};

    var list = ['firstname', 'firstName', 'lastname', 'lastName', 'email', 'email', 'password', 'password'];

    var i = 0;
    while(i < list.length) {

        var key1 = list[i];
        var key2 = list[i+1];

        if (req.body[key1] !== undefined && req.session[key1] !== req.body[key1]) {
            if (key1 === 'password') {
                query.newPassword = req.body.password;
                return option('participant/changePassword', query, true);
            } else {
                query[key2] = req.body[key1];
            }
        }
        //increase i
        i = i + 2;
    }

    return option('participant/changeAccountDetails', query, true);
};

module.exports.communicate = communicate;
module.exports.requestUrl = requestUrl;

