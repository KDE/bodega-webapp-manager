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


module.exports.show = function(req, res) {
    console.log(req.params.assetType)
    if (req.params.assetType == 'book') {
        res.render('createBookAsset', {
            network: app.config.network,
        });
    } else {
        res.render('createAsset', {
            network: app.config.network,
        });
    }
}


