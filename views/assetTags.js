
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

    if (allTagsView) {
        tagsStore.destroy();
        itemTagsWindow.destroy();
        itemTagsView.destroy();
        allTagsView.destroy();
    }

    //FIXME: deletes and recreates everything every time
    //the store breaks if the data gets just changed after a dnd operation has been done
    tagsStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId:'collectionStore',
        fields:['id', 'title', 'type'],
        data: itemData.tags,
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
        },
        flex:1
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

                        var removedIndexes = new Array();
                        for (var i = itemData.tags.length-1; i >= 0; --i) {
                            if (data.id === itemData.tags[i].id) {
                                itemData.tags.splice(i, 1);
                                removedIndexes.push(i);
                            }
                        }

                        if (itemType == 'asset') {
                            Ext.Ajax.request({
                                url: '/json/asset/update/' + itemData.id,
                                method: 'POST',
                                params: $.param({info: itemData}),
                                callback: function(response) {
                                    tagsStore.remove(removedIndexes);
                                    tagsStore.reload();
                                }
                            });
                        } else {
                            var tags = new Array();
                            for (var i = 0; i < itemData.tags.length; ++i) {
                                tags.push(itemData.tags[i].id)
                            }
                            Ext.Ajax.request({
                                url: '/json/store/channel/update/' + currentStore + '/' + itemData.id,
                                method: 'POST',
                                params: $.param({'tags': tags}),
                                callback: function(response) {
                                    tagsStore.remove(removedIndexes);
                                    tagsStore.reload();
                                }
                            });
                        }
                    }
                }]
            }
        ],
        border: 0,
        flex:1,
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
                        var tags = new Array();
                        for (var i = 0; i < itemData.tags.length; ++i) {
                            tags.push(itemData.tags[i].id)
                        }
                        Ext.Ajax.request({
                            url: '/json/store/channel/update/' + currentStore + '/' + itemData.id ,
                            method: 'POST',
                            params: $.param({'tags': tags}),
                        });
                    }
                    tagsStore.loadData(data.records, true);
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
                            //console.log(itemData.tags)
                            for (var i = 0; i < itemData.tags.length; ++i) {
                                tagsStore.insert(0, itemData.tags[i]);
                            }
                        }
                    });
                } else {
                    var tags = new Array();
                    for (var i = 0; i < itemData.tags.length; ++i) {
                        tags.push(itemData.tags[i].id)
                    }
                    Ext.Ajax.request({
                        url: '/json/store/channel/update/' + currentStore + '/' + itemData.id,
                        method: 'POST',
                        params: $.param({'tags': tags}),
                        callback: function(response) {
                            tagsStore.removeAll();
                            //console.log(itemData.tags)
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
        layout: {
            type: 'hbox',
            pack: 'start',
            align: 'stretch'
        },
        bodyStyle: 'padding: 5px;',
        items: [allTagsView, itemTagsView]
    });

    if (itemTagsWindow.isVisible()) {
        itemTagsWindow.hide();
    } else {
        itemTagsWindow.show();
        itemTagsWindow.restore();
    }
}


