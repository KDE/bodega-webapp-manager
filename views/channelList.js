
    var win;
    var channelView;
    var channelStore = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        storeId:'channelStore',
        fields:['id', 'name', 'description', 'image', 'active'],
        folderSort: true,
        root: 'channels',
        proxy: {
            type: 'ajax',
            url: '/json/store/structure/',
            reader: {
                type: 'json',
                root: 'channels'
            },
            writer: {
                type: 'json',
                writeAllFields: false,
                root: 'channels'
            }
        }/*,
        listeners: {
            write: function(proxy, operation) {
                console.log(operation);
                if (operation.action == 'destroy') {
                    main.child('#form').setActiveRecord(null);
                }
                Ext.example.msg(operation.action, operation.resultSet.message);
            },
            update: function(store, record, operation, eOpts ) {
                record.raw.name = record.data.name;
                record.raw.desc = record.data.desc;
                record.raw.flatmarkup = record.data['markups.flat'];
                record.raw.markup = record.data['markups.markup'];
                record.raw.maxmarkup = record.data['markups.max'];
                record.raw.minmarkup = record.data['markups.min'];

                Ext.Ajax.request({
                    url: '/json/store/update/' + record.raw.id,
                    method: 'POST',
                    params: $.param(record.raw),
                    callback: function(response) {
                        store.load();
                    }
                });
            },
            add: function(store, records, index, eOpts) {
                console.log(records)
                var record;
                for (var i in records) {
                    record = records[i];
                    record.raw.name = record.data.name;
                    record.raw.desc = record.data.desc;
                    record.raw.flatmarkup = record.data['markups.flat'];
                    record.raw.markup = record.data['markups.markup'];
                    record.raw.maxmarkup = record.data['markups.max'];
                    record.raw.minmarkup = record.data['markups.min'];

                    Ext.Ajax.request({
                        url: '/json/store/create',
                        method: 'POST',
                        params: $.param(record.raw),
                        callback: function(response) {
                            store.load();
                        }
                    });
                }
            }
        }*/
        
    });

    function channelList(storeData) {
        var win;
        if (!win) {
            channelView = Ext.create('Ext.tree.Panel', {
                store: channelStore,
                selType: 'checkboxmodel',
                inline: true,
                columns: [
                    { xtype: 'treecolumn', header: 'Name',  dataIndex: 'name', field: {allowBlank: false}},
                    { header: 'Description',  dataIndex: 'description', flex: 1, field: {allowBlank: false}},
                    { header: 'Active', dataIndex: 'active', xtype: 'checkcolumn'}
                    ],
                rootVisible: false,
                region: 'center'
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

        channelStore.proxy.url = '/json/store/structure/' + storeData.id;
        channelStore.load();
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

