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

var option = require('./utils.js').options

var communicate = function(req, res, remoteRes, chunk) {
    var reply = JSON.parse(chunk.toString('utf8'), 'utf8');
for (var i in req.query) {
    console.log(i+":"+req.query[i])
}
console.log(JSON.stringify(reply.stats))

    var data = new Array();

    for (var property in reply.stats[0]) {
        if (property == 'dateof') {
            continue;
        }
        var row = {key: property, values: []};
        for (var i = 0; i < reply.stats.length; ++i) {
            row.values.push([new Date(reply.stats[i].dateof).getTime(), reply.stats[i][property]])
        }
        data.push(row);
    }

    res.render('assetStats', {
        network: app.config.network,
        data: JSON.stringify(data),
        assets: req.query.assets,
        stats: JSON.stringify(reply.stats)
    });
}

var requestUrl = function(req, res) {

    var options = option('stats/assets', null, true);

    return options;
}

module.exports.communicate = communicate;
module.exports.requestUrl = requestUrl;