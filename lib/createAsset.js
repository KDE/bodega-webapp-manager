/*
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

var option = require('./utils.js').options;
var formstream = require('formstream');
var http = require('http');

var requestUrl = function(req, res) {

    var options = option('asset/create', null, true);

    return options;
}

module.exports.upload = function(req, res) {
    var file = req.files['upl'];

    var form = formstream();
    form.field( 'info', JSON.stringify({
                'name': file.name,
                'file': file.name,
                'basePrice': 0,
                'license': 1
                }));
    form.file('asset', file.path, 'upload-logo.png');
    var options = requestUrl(req, res);
    options.method = 'POST';
    var cookie = options.headers.Cookie;
    options.headers = form.headers();
    options.headers.Cookie = cookie;
    console.log(options.headers);

    var preq = http.request(options, function (res) {
        console.log('Status: %s', res.statusCode);
        res.on('data', function (data) {
            console.log(data.toString());
        });
    });
    form.on('end', function () {
        res.redirect('asset/list');
    });
    form.pipe(preq);
}

module.exports.requestUrl = requestUrl;


module.exports.show = function(req, res) {
    res.render('createAsset', {
        network: app.config.network,
    });
}


