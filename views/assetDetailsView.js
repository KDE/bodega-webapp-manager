
var assetDetailsWindow;
var assetDetailsForm;
var currentAsset;

function loadAssetDetails(assetData) {
    currentAsset = assetData.id;
    console.log(assetData)
    if (!assetDetailsForm) {

        assetDetailsForm = new Ext.Panel({
            defaults: {
                // applied to each contained panel
                bodyStyle:'padding:20px'
            },
            layout: {
                type: 'table',
                columns: 2
            },
            items: [{
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
    }


    if (assetDetailsWindow.isVisible()) {
        assetDetailsWindow.hide();
    } else {
        assetDetailsWindow.show();
        assetDetailsWindow.restore();
    }
}


