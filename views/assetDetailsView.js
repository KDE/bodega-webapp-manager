
var assetDetailsWindow;
var assetDetailsForm;
var currentAsset;

function loadAssetDetails(assetData) {
    currentAsset = assetData.id;
    console.log(assetData)
    if (assetDetailsForm) {
        assetDetailsForm.destroy();
        assetDetailsWindow.destroy();
    }

    assetDetailsForm = new Ext.Panel({
        defaults: {
            // applied to each contained panel
            bodyStyle:'padding:20px'
        },
        layout: {
            type: 'table',
            columns: 2
        },
        items: [
            Ext.create('Ext.view.View', {
            store: Ext.create('Ext.data.Store', {
                autoLoad: true,
                storeId: 'typeStore',
                fields:['id', 'name'],
                proxy: {
                    type: 'ajax',
                    url: '/json/asset/' + currentAsset + '?incoming=true&previews=true',
                    reader: {
                        type: 'json',
                        root: 'asset.previews'
                    }
                }
            }),
            colspan: 2,
            tpl: [
                '<tpl for=".">',
                    '<div class="thumb-wrap" id="{name}">',
                    '<div class="thumb"><img src="{data.path}" title="{name}"></div>',
                    '<span class="x-editable">{data.path}</span></div>',
                '</tpl>',
                '<div class="x-clear"></div>'
            ],
            multiSelect: false,
            height: 120,
            trackOver: false,
            emptyText: 'No images to display',

            prepareData: function(data) {
                Ext.apply(data, {
                    shortName: Ext.util.Format.ellipsis(data.name, 15),
                    sizeString: Ext.util.Format.fileSize(data.size),
                    dateString: Ext.util.Format.date(data.lastmod, "m/d/Y g:i a")
                });
                return data;
            }
        }),
        {
            xtype: 'label',
            text: "Name: "
        }, {
            xtype: 'label',
            text: assetData.name
        }, {
            xtype: 'label',
            text: "Description: "
        }, {
            xtype: 'label',
            text: assetData.description
        }, {
            xtype: 'label',
            text: "Version: "
        }, {
            xtype: 'label',
            text: assetData.version
        }, {
            xtype: 'label',
            text: "Tags: ",
            colspan: 2
        }]
    });

    for (var i = 0; i < assetData.tags.length; ++i) {
        assetDetailsForm.add({xtype: 'label', text: assetData.tags[i].type + ": "})
        assetDetailsForm.add({xtype: 'label', text: assetData.tags[i].title})
    }

    assetDetailsWindow = Ext.create('widget.window', {
        title: 'Details of Assets ' + assetData.name,
        closable: true,
        closeAction: 'hide',
        modal: true,
        width: '80%',
        height: '80%',
        layout: 'fit',
        bodyStyle: 'padding: 5px;',
        items: [assetDetailsForm]
    });



    if (assetDetailsWindow.isVisible()) {
        assetDetailsWindow.hide();
    } else {
        assetDetailsWindow.show();
        assetDetailsWindow.restore();
    }
}


