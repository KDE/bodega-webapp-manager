/*
    Copyright 2013 Giorgos Tsiapaliokas <terietor@gmail.com>
    Copyright 2013 Antonis Tsiapaliokas <kok3rs@gmail.com>
    Copyright 2013 Marco Martin <mart@kde.org>

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
    var url = 'account/modify/confirm?success=' + reply.success;

    if (reply.error) {
        url += "&error=" + encodeURIComponent(reply.error.type);
    }

    res.redirect(url);
    //apparently needs to send something anyways
    res.send('\n\n');
};

var requestUrl = function(req, res) {
    var options = utils.options(req, 'participant/changeAccountDetails', null, true);
    options.method = 'POST';
    return options;
};

module.exports.communicate = communicate;
module.exports.requestUrl = requestUrl;

