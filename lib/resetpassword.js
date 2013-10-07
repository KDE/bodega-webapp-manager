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

var communicate = function(req, res, remoteRes, chunk) {
    var reply = JSON.parse(chunk.toString('utf8'), 'utf8');
    console.log(reply);

    //TODO if the reset password fails, then the bodega server is sending
    //a differemt json message. Parse that to find the correct error.
    //E.x. put a wrong email address.
    if (reply.message) {
        app.operationStatus = true;
        app.operationMessage = reply.message;
    } else {
        app.operationStatus = false;
    }

    res.redirect('account/resetPassword/confirm');
};

var requestUrl = function(req, res) {

    var query = {
        email: req.body.email
    };

    return utils.options(req, 'participant/resetRequest', query, null, true);
};

module.exports.communicate = communicate;
module.exports.requestUrl = requestUrl;
