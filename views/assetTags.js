
var tagsStore;
var itemTagsWindow;
var itemTagsView;
var allTagsView;

var currentStore;

function loadChannelTags(itemData, store) {
    currentStore = store;
    loadItemTags(itemData, 'channel');
}

function loadAssetTags(itemData) {
    loadItemTags(itemData, 'asset');
}

function loadItemTags(itemData, itemType) {
console.log(itemData)
    if (!itemTagsWindow) {
        tagsStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            storeId:'collectionStore',
            fields:['id', 'title', 'type'],
            data: itemData ? itemData.tags : null,
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


        itemTagsView = Ext.create('Ext.grid.Panel', {
            store: tagsStore,
            columns: [
                { header: 'Title',  width: '70%', dataIndex: 'title', flex: 1 },
                { header: 'Type',  width: '30%', dataIndex: 'type' },
                {
                    header: 'Remove',
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [{
                        icon: '/css/list-remove.png',
                        tooltip: 'Remove Tag',
                        handler: function(grid, rowIndex, colIndex) {
                            var data = tagsStore.getAt(rowIndex).data;

                            for (var i = 0; i < itemData.tags.length; ++i) {
                                if (data.id === itemData.tags[i].id) {
                                    itemData.tags.splice(i, 1);
                                }
                            }
                            
                            if (itemType == 'asset') {
                        
                                Ext.Ajax.request({
                                    url: '/json/asset/update/' + itemData.id,
                                    method: 'POST',
                                    params: $.param({info: itemData}),
                                    callback: function(response) {
                                        tagsStore.removeAll();
                                        console.log(itemData.tags)
                                        for (var i = 0; i < itemData.tags.length; ++i) {
                                            tagsStore.insert(0, itemData.tags[i]);
                                        }
                                    }
                                });
                            } else {
                                
                                Ext.Ajax.request({
                                    url: '/json/store/channel/update/' + currentStore + '/' + itemData.id,
                                    method: 'POST',
                                    params: $.param(itemData),
                                    callback: function(response) {
                                        tagsStore.removeAll();
                                        console.log(itemData.tags)
                                        for (var i = 0; i < itemData.tags.length; ++i) {
                                            tagsStore.insert(0, itemData.tags[i]);
                                        }
                                    }
                                });
                            }
                        }
                    }]
                }
            ],
            border: 0,
            title: 'Current Tags',
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
                            itemData.tags.push(data.records[i].data);
                        }

                        if (itemType == 'asset') {
                            Ext.Ajax.request({
                                url: '/json/asset/update/' + itemData.id,
                                method: 'POST',
                                params: $.param({info: itemData}),
                            });
                        } else {
                            Ext.Ajax.request({
                                url: '/json/store/channel/update/' + currentStore + '/' + itemData.id ,
                                method: 'POST',
                                params: $.param(itemData),
                            });
                        }
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
                }]
            }],
            listeners: {
                selectionchange: function() {
                    var s = itemTagsView.getSelectionModel().getSelection();
                    if (s.length > 0) {
                        itemTagsView.dockedItems.get(1).items.get(0).show();
                    } else {
                        itemTagsView.dockedItems.get(1).items.get(0).hide();
                    }
                },
                itemremove: function(record, index, eOpts) {
                    for (var i = 0; i < data.records.length; ++i) {
                        for (var j = 0; j < itemData.tags.length; ++j) {
                            if (data.records[i].data.id === itemData.tags[j].id) {
                                itemData.tags.splice(j, 1);
                            }
                        }
                    }

                    if (itemType == 'asset') {
                        
                        Ext.Ajax.request({
                            url: '/json/asset/update/' + itemData.id,
                            method: 'POST',
                            params: $.param({info: itemData}),
                            callback: function(response) {
                                tagsStore.removeAll();
                                console.log(itemData.tags)
                                for (var i = 0; i < itemData.tags.length; ++i) {
                                    tagsStore.insert(0, itemData.tags[i]);
                                }
                            }
                        });
                    } else {
                        
                        Ext.Ajax.request({
                            url: '/json/store/channel/update/' + currentStore + '/' + itemData.id,
                            method: 'POST',
                            params: $.param(itemData),
                            callback: function(response) {
                                tagsStore.removeAll();
                                console.log(itemData.tags)
                                for (var i = 0; i < itemData.tags.length; ++i) {
                                    tagsStore.insert(0, itemData.tags[i]);
                                }
                            }
                        });
                    }
                    
                        
                }
            },
            enableDrop: true,
            columnWidth: 0.5
        });

        itemTagsWindow = Ext.create('widget.window', {
            title: (itemType === 'asset' ? 'Tags of Assets ' : 'Tags of Channel ') + itemData.name,
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
                items: [allTagsView, itemTagsView]
            }]
        });
    } else {
        itemTagsWindow.setTitle((itemType === 'asset' ? 'Tags of Assets ' : 'Tags of Channel ') + itemData.name);

        tagsStore.proxy.clear()
       // tagsStore.removeAll();
        for (var i = 0; i < itemData.tags.length; ++i) {
            tagsStore.insert(0, itemData.tags[i]);
        }
    }

    if (itemTagsWindow.isVisible()) {
        itemTagsWindow.hide();
    } else {
        itemTagsWindow.show();
        itemTagsWindow.restore();
    }
}


