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

    var vars = {
        network: app.config.network,
        inManagementGroup: req.session.partners[0].id == 0
    };

    if (req.params.assetType == 'generic') {
        vars.readableAssetType = 'Create a generic asset';
        res.render('assetforms/createAsset', vars);

    } else if (req.params.assetType == 'book') {
        vars.readableAssetType = 'Create an asset for a book';
        res.render('assetforms/createBookAsset', vars);

    } else if (req.params.assetType == 'plasmaPackage') {
        vars.readableAssetType = 'Create an asset from a Plasma package';
        res.render('assetforms/createPlasmaPackageAsset', vars);

    } else if (req.params.assetType == 'obs') {
        vars.readableAssetType = 'Create an asset for an application on an OBS repository';
        res.render('assetforms/createObsAsset', vars);

    } else if (req.params.assetType == 'wallpaper') {
        vars.readableAssetType = 'Create an asset of a wallpaper';
        res.render('assetforms/createWallpaperAsset', vars);

    //mass create
    } else {
        vars.readableAssetType = 'Create a lot of assets with drag and drop';
        res.render('assetforms/massCreateAsset', vars);
    }
}


