
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

        allTagsView = createTagList({
            plugins: {
                ptype: 'gridviewdragdrop',
                dropGroup: 'viewDDGroup',
                dragGroup: 'collectionListDDGroup',
            }
        });
        allTagsView.title = 'All Tags';
        allTagsView.columnWidth = 0.5;
        allTagsView.collapsed = false;
        allTagsView.collapsible = false;


        assetTagsView = Ext.create('Ext.grid.Panel', {
            store: tagsStore,
            columns: [
                { header: 'Title',  width: '70%', dataIndex: 'title', flex: 1 },
                { header: 'Type',  width: '30%', dataIndex: 'type' },
            ],
            border: 0,
            title: 'Asset Tags',
            region: 'center',
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragGroup: 'viewDDGroup',
                    dropGroup: 'collectionListDDGroup'
                },
                listeners: {
                    drop: function(node, data, dropRec, dropPosition) {

                        for (var i = 0; i < data.records.length; ++i) {
                            assetData.tags.push(data.records[i].data);
                        }

                        Ext.Ajax.request({
                            url: '/json/asset/update/' + assetData.id,
                            method: 'POST',
                            params: $.param({info: assetData}),
                            callback: function(response) {
                                tagsStore.data = assetData.tags;
                            }
                        });
                    }
                }
            },
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'Drag to add tags',
                    height: 24,
                    xtype: 'label'
                }, {
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
                selectionchange: function() {
                    var s = assetTagsView.getSelectionModel().getSelection();
                    if (s.length > 0) {
                        assetTagsView.dockedItems.get(1).items.get(0).show();
                    } else {
                        assetTagsView.dockedItems.get(1).items.get(0).hide();
                    }
                },
                itemremove: function(record, index, eOpts) {
                    for (var i = 0; i < data.records.length; ++i) {
                        assetData.tags.push(data.records[i].data);
                    }

                    Ext.Ajax.request({
                        url: '/json/asset/update/' + assetData.id,
                        method: 'POST',
                        params: $.param({info: assetData}),
                        callback: function(response) {
                            tagsStore.data = assetData.tags;
                        }
                    });
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
                items: [allTagsView, assetTagsView]
            }]
        });
    } else {
        assetTagsWindow.setTitle('Tags of Assets ' + assetData.name);

        tagsStore.removeAll();
        for (var i = 0; i < assetData.tags.length; ++i) {
            tagsStore.insert(0, assetData.tags[i]);
        }
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


