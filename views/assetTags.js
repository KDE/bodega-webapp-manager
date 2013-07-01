
var tagsStore;
var assetTagsWindow;
var assetTagsView;
var currentAsset;
var allTagsView;

function loadAssetTags(assetData) {
    currentAsset = assetData.id;

    if (!assetTagsWindow) {
        tagsStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            storeId:'collectionStore',
            fields:['id', 'title', 'type'],
            data: assetData ? assetData.tags : null,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        });


        assetTagsView = Ext.create('Ext.grid.Panel', {
            store: tagsStore,
            columns: [
                { header: 'Title',  width: '80%', dataIndex: 'title', flex: 1 },
                { header: 'Type',  width: '20%', dataIndex: 'type' },
            ],
            border: 0,
            region: 'center',
            selType: 'checkboxmodel',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    xtype: 'button',
                    text: 'Remove Tags',
                    hidden: true,
                    handler: function() {
                        Ext.MessageBox.confirm('Remove', 'Are you sure you want to remove the selected tags?', function(btn){
                            if(btn === 'yes') {

                                var s = assetTagsView.getSelectionModel().getSelection();
                                Ext.each(s, function (item) {
                                    for (var i = 0; i < assetData.tags.length; ++i) {
                                        if (item.data.id === assetData.tags[i].id) {
                                            assetData.tags.splice(i, 1);
                                        }
                                    }
                                });

                                Ext.Ajax.request({
                                    url: '/json/asset/update/' + assetData.id,
                                    method: 'POST',
                                    params: $.param({info: assetData}),
                                    callback: function(response) {
                                        tagsStore.data = assetData.tags;
                                    }
                                });
                            }
                        });
                    }
                }]
            }],
            listeners: {
                selectionchange: function()
                {
                    var s = assetTagsView.getSelectionModel().getSelection();
                    if (s.length > 0) {
                        assetTagsView.dockedItems.get(1).items.get(0).show();
                    } else {
                        assetTagsView.dockedItems.get(1).items.get(0).hide();
                    }
                }
            },
            enableDrop: true,
            columnWidth: 0.5
        });

        assetTagsWindow = Ext.create('widget.window', {
            title: 'Tags of Assets ' + assetData.name,
            closable: true,
            closeAction: 'hide',
            modal: true,
            width: '80%',
            height: '80%',
            layout: 'fit',
            bodyStyle: 'padding: 5px;',
            items: [{
                layout: 'column',
                autoScroll: true,
                defaultType: 'container',
                items: [ assetTagsView]
            }]
        });
    } else {
        assetTagsWindow.setTitle('Tags of Assets ' + assetData.name);
        tagsStore.data = assetData.tags;
    }

    if (assetTagsWindow.isVisible()) {
        assetTagsWindow.hide(this, function() {
            button.dom.disabled = false;
        });
    } else {
        assetTagsWindow.show(this, function() {
            button.dom.disabled = false;
        });
    }
}


