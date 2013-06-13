
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
                        record.raw.channel.desc = record.data.description;
                        record.raw.channel.image = record.data.image;
                        record.raw.channel.parent = record.data.parentId;
                        record.raw.channel.active = record.data.active;

                        Ext.Ajax.request({
                            url: '/json/store/channel/update/' + storeId + '/' + record.raw.id,
                            method: 'POST',
                            params: $.param(record.raw),
                            callback: function(response) {
                                channelStore.getRootNode().removeAll();
                                channelStore.load();
                            }
                        });
                    },
                    insert: function( parent, node, refNode, eOpts ) {
                        var data = {};
                        data.channel = {};
                        data.channel.name = node.data.name;
                        data.channel.desc = node.data.description;
                        data.channel.image = node.data.image;
                        data.channel.parent = record.data.parentId;
                        data.channel.active = false;

                        Ext.Ajax.request({
                            url: '/json/store/channel/create/' + storeId,
                            method: 'POST',
                            params: $.param(data),
                            callback: function(response) {
                                channelStore.getRootNode().removeAll();
                                channelStore.load();
                            }
                        });
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
                            channelView.getRootNode().insertChild(0, rec);
                        }
                    }, {
                        xtype: 'button',
                        text: 'Delete channels',
                        hidden: true,
                        handler: function() {
                            Ext.MessageBox.confirm('Delete', 'Are you sure you want to delete the selected items?', function(btn){
                                if(btn === 'yes') {
                                    var s = channelView.getSelectionModel().getSelection();
                                    selected = [];
                                    Ext.each(s, function (item) {
                                        Ext.Ajax.request({
                                            url: '/json/store/channel/delete/' + storeId + '/' + item.data.id,
                                            callback: function(response) {
                                                channelStore.getRootNode().removeAll();
                                                channelStore.load();
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    }]
                }],
                listeners: {
                    selectionchange: function() {
                        var s = channelView.getSelectionModel().getSelection();
                        if (s.length > 0) {
                            channelView.dockedItems.get(1).items.get(1).show();
                        } else {
                            channelView.dockedItems.get(1).items.get(1).hide();
                        }
                    }
                }
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

