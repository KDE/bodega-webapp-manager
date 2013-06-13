
    var win;
    var channelView;
    var cellEditing;
    var storeId;

    var channelStore;

    function setStoreId(id) {
        storeId = id
        channelStore.proxy.url = '/json/store/structure/' + id;
        channelStore.getRootNode().removeAll();
        channelStore.load();
    }

    function channelList(storeData) {
        var win;
        if (!win) {
            channelStore = Ext.create('Ext.data.TreeStore', {
                autoLoad: true,
                storeId:'channelStore',
                fields:['id', 'name', 'description', 'image', 'active'],
                //folderSort: true,
                root: 'channels',
                clearOnLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/json/store/structure/',
                    reader: {
                        type: 'json',
                        root: 'channels'
                    }
                },
                listeners: {
                    update: function(store, record, operation, eOpts ) {
                        //only go forward if eOpts is the name of a column
                        if (!record.data.name || !eOpts || eOpts.length === 0 ||
                            ['id', 'name', 'description', 'image', 'active'].indexOf(eOpts[0]) === -1) {
                            return;
                        }
                        var data = {};
                        record.raw.channel = {};
                        record.raw.channel.name = record.data.name;
                        record.raw.channel.desc = record.data.desc;
                        record.raw.channel.image = record.data.image;
                        record.raw.channel.parent = record.data.parentId;
                        record.raw.channel.active = record.data.active;

                        Ext.Ajax.request({
                            url: '/json/store/channel/update/' + storeId + '/' + record.raw.id,
                            method: 'POST',
                            params: $.param(record.raw),
                            callback: function(response) {
                                channelStore.getRootNode().removeAll();
                                store.load();
                            }
                        });
                    },
                    add: function(store, records, index, eOpts) {
                        var record;
                        for (var i in records) {
                            record = records[i];
                            record.raw.channel = {};
                            record.raw.channel.name = record.data.name;
                            record.raw.channel.desc = record.data.desc;
                            record.raw.channel.image = record.data.image;
                            record.raw.channel.parent = record.data.parentId;
                            record.raw.channel.active = record.data.active;

                            Ext.Ajax.request({
                                url: '/json/store/channel/create/' + storeId,
                                method: 'POST',
                                params: $.param(record.raw),
                                callback: function(response) {
                                    store.load();
                                }
                            });
                        }
                    }
                }
                
            });
            cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            });
            channelView = Ext.create('Ext.tree.Panel', {
                id: 'channelView',
                store: channelStore,
                selType: 'checkboxmodel',
                inline: true,
                columns: [
                    { xtype: 'treecolumn', header: 'Name',  dataIndex: 'name', field: {allowBlank: false}},
                    { header: 'Description',  dataIndex: 'description', flex: 1, field: {allowBlank: false}},
                    { header: 'Active', dataIndex: 'active', xtype: 'checkcolumn'},
                    {
                        header: 'New subchannel',
                        xtype: 'actioncolumn',
                        width: 50,
                        items: [{
                            icon: '/css/edit.png',
                            tooltip: 'Create Subchannel',
                            handler: function(grid, rowIndex, colIndex) {
                                //HACK to find the node from the row number
                                var node = channelView.getRootNode();
                                for (var i = 0; i <= rowIndex; ++i) {
                                    if (node.firstChild !== null) {
                                        node = node.firstChild;
                                    } else if (node.nextSibling !== null) {
                                        node = node.nextSibling
                                    } else {
                                        break;
                                    }
                                }
                                console.log(node)
                                
                                var rec = {
                                     name: 'Channel',
                                     description: 'New Channel',
                                     parent: node.data.id
                                };
                                
                                node.insertChild(0, rec);
                            }
                        }]
                    }
                    ],
                rootVisible: false,
                region: 'center',
                plugins: [cellEditing],
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        text: 'New Channel',
                        scope: this,
                        handler: function(){
                            // Create a model instance
                            var rec = {
                                name: 'Channel',
                                description: 'New Channel'
                            };
                            channelStore.insert(0, rec);
                        }
                    }]
                }]
            });
            win = Ext.create('widget.window', {
                title: 'Channels of Store ' + storeData.name,
                closable: true,
                closeAction: 'hide',
                modal: true,
                //animateTarget: this,
                width: '80%',
                height: '80%',
                layout: 'border',
                bodyStyle: 'padding: 5px;',
                items: [{
                    region: 'west',
                    title: 'Tags',
                    width: 200,
                    split: true,
                    collapsible: true,
                    floatable: false
                }, channelView]
            });
        }

        setStoreId(storeData.id);

        if (win.isVisible()) {
            win.hide(this, function() {
                button.dom.disabled = false;
            });
        } else {
            win.show(this, function() {
                button.dom.disabled = false;
            });
        }
    }

