
var collectionsStore;
var collectionView;
var cellEditing;

function createCollectionList() {
    if (!collectionsStore) {
        collectionsStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            storeId:'collectionStore',
            fields:['id', 'name', 'public', 'type'],
            proxy: {
                type: 'ajax',
                // load remote data using HTTP
                url: '/json/collection/list',
                // specify a XmlReader (coincides with the XML format of the returned data)
                reader: {
                    type: 'json',
                    root: 'collections'
                }
            },
            listeners: {
                add: function (parent, component, index, eOpts ) {
                    console.log(component[0].raw)
                    Ext.Ajax.request({
                        url: '/json/collection/create/',
                        method: 'POST',
                        params: $.param(component[0].raw),
                        callback: function(response) {
                            collectionsStore.removeAll();
                            collectionsStore.load();
                            cellEditing.startEditByPosition({
                                row: 0,
                                column: 0
                            });
                        }
                    });
                },
                update: function(store, record, operation, eOpts ) {
                    record.raw.name = record.data.name;
                    record.raw.public = record.data.public;
                    //TODO: other types
                    record.raw.type = record.data.type;
                    console.log(record.raw)
                    Ext.Ajax.request({
                        url: '/json/collection/update/' + record.raw.id,
                        method: 'POST',
                        params: $.param(record.raw),
                        callback: function(response) {
                            collectionsStore.removeAll();
                            collectionsStore.load();
                        }
                    });
                }
            }
        });
        cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        collectionView = Ext.create('Ext.grid.Panel', {
            store: collectionsStore,
            selType: 'checkboxmodel',
            inline: true,
            columns: [
                { header: 'Name',  width: 180, dataIndex: 'name', flex: 1, field: {allowBlank: false} },
                { header: 'Public?', width: '20%', dataIndex: 'public', xtype: 'checkcolumn', field: {allowBlank: false}},
                { header: 'Type', width: '20%',  dataIndex: 'type', field: {allowBlank: false}}
            ],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'New Collection',
                    scope: this,
                    handler: function(){
                        var rec = {
                            name: 'Collection',
                            public: false,
                            type: ''
                        };

                        collectionsStore.insert(0, rec);
                        cellEditing.startEditByPosition({
                            row: 0, 
                            column: 0
                        });
                    }
                }]
            }],
            listeners: {
                selectionchange: function()
                {
                    
                }
            },
            plugins: [cellEditing],
            border: 0
        });
    }

    return collectionView;
}

