
    var win;
    var channelStore;
    var channelView;
    var cellEditing;
    var storeId;


    function setStoreId(id) {
        storeId = id
        channelStore.proxy.url = '/json/store/structure/' + id;
        channelStore.getRootNode().removeAll();
        channelStore.load();
    }

    function dataFromCell(view, rowIndex) {
        //HACK to find the node from the row number
        var node = view.getRootNode();
        var nodes = [node];
        var visited = {};
        var i = 0;
        var iteration = 0;
        while (i <= rowIndex) {
            ++iteration;

            if (node.firstChild !== null && !visited[node.internalId]) {
                visited[node.internalId] = true;
                nodes.push(node);
                node = node.firstChild;
                ++i;
            } else if (node.nextSibling !== null) {
                node = node.nextSibling;
                ++i;
            } else {
                while (nodes.length > 0 && nodes[nodes.length-1].nextSibling === null) {
                    nodes.pop();
                }
                node = nodes[nodes.length-1];
            }
            if (iteration > 10000) {
                break;
            }
        }

        return node;
    }

    function channelList(storeData) {
        if (!win) {
            channelStore = Ext.create('Ext.data.TreeStore', {
                autoLoad: true,
                storeId:'channelStore',
                fields:['id', 'store', 'name', 'description', 'image', 'active', 'tags'],
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
                        record.raw.name = record.data.name;
                        record.raw.description = record.data.description;
                        record.raw.image = record.data.image;
                        record.raw.parent = record.data.parentId;
                        record.raw.active = record.data.active;

                        Ext.Ajax.request({
                            url: '/json/store/channel/update/' + storeId + '/' + record.raw.id,
                            method: 'POST',
                            params: $.param(record.raw),
                            callback: function(response) {
                                channelStore.reload();
                                channelStore.reload();
                            }
                        });
                    },
                    insert: function( parent, node, refNode, eOpts ) {
                        var data = {};
                        data.channel = {};
                        data.name = node.data.name;
                        data.description = node.data.description;
                        data.image = node.data.image;
                        data.parent = node.data.parentId;
                        data.active = false;

                        Ext.Ajax.request({
                            url: '/json/store/channel/create/' + storeId,
                            method: 'POST',
                            params: $.param(data),
                            callback: function(response) {
                                channelStore.reload();
                                channelStore.reload();
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
                    { xtype: 'treecolumn', header: 'Name', width:'40%',  dataIndex: 'name', field: {allowBlank: false}},
                    { header: 'Description',  dataIndex: 'description', flex: 1, field: {allowBlank: false}},
                    { header: 'Active', dataIndex: 'active', xtype: 'checkcolumn'},
                    {
                        xtype: 'actioncolumn',
                        width: 50,
                        items: [{
                            icon: '/css/list-add.png',
                            tooltip: 'Create Subchannel',
                            handler: function(grid, rowIndex, colIndex) {
                                var node = dataFromCell(channelView, rowIndex);
                                var rec = {
                                     name: 'Channel',
                                     description: 'New Channel',
                                     parent: node.data.id
                                };

                                node.insertChild(0, rec);
                            }
                        }, {
                            icon: '/css/tags.png',
                            tooltip: 'Tags',
                            handler: function(grid, rowIndex, colIndex) {
                                loadChannelTags(dataFromCell(channelView, rowIndex).data, storeId);
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
                        text: 'Reload',
                        scope: this,
                        handler: function() {
                            channelStore.getRootNode().removeAll();
                            channelStore.reload();
                        }
                    }, {
                        xtype: 'button',
                        text: 'Delete channels',
                        hidden: true,
                        handler: function() {
                            Ext.MessageBox.confirm('Delete', 'Are you sure you want to delete the selected channels?', function(btn){
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
                    load: function( parent, node, records, successful, eOpts ) {
                        if (successful) {
                            channelView.expandAll();
                        }
                    },
                    selectionchange: function() {
                        var s = channelView.getSelectionModel().getSelection();
                        if (s.length > 0) {
                            channelView.dockedItems.get(1).items.get(2).show();
                        } else {
                            channelView.dockedItems.get(1).items.get(2).hide();
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
                items: [channelView]
            });
        }

        setStoreId(storeData.id);

        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.restore();
        }
    }

