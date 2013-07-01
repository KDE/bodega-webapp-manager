
var tagStore;
var tagView;
var cellEditing;
var tagTypeStore;


var currentTag;


function createTagList() {
    if (!tagStore) {
        tagTypeStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            storeId:'tagStore',
            fields:['id', 'type'],
            proxy: {
                type: 'ajax',
                url: '/json/tag/types',
                reader: {
                    type: 'json',
                    root: 'types'
                }
            }
        });

        tagStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            storeId:'tagStore',
            fields:['id', 'typeid', 'type', 'title'],
            proxy: {
                type: 'ajax',
                url: '/json/tag/list',
                reader: {
                    type: 'json',
                    root: 'tags'
                }
            },
            listeners: {
                add: function (parent, component, index, eOpts ) {
                    console.log(component[0].raw)
                    Ext.Ajax.request({
                        url: '/json/tag/create/',
                        method: 'POST',
                        params: $.param(component[0].raw),
                        callback: function(response) {
                            tagStore.removeAll();
                            tagStore.load();
                            cellEditing.startEditByPosition({
                                row: 0,
                                column: 0
                            });
                        }
                    });
                },
                update: function(store, record, operation, eOpts ) {
                    record.raw.title = record.data.title;
                    record.raw.type = record.data.type;
                    console.log(record.raw)
                    Ext.Ajax.request({
                        url: '/json/tag/update/' + record.raw.id,
                        method: 'POST',
                        params: $.param(record.raw),
                        callback: function(response) {
                            tagStore.removeAll();
                            tagStore.load();
                        }
                    });
                }
            }
        });
        cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        tagView = Ext.create('Ext.grid.Panel', {
            store: tagStore,
            selType: 'checkboxmodel',
            inline: true,
            columns: [
                { header: 'Title',  width: '60%', dataIndex: 'title', flex: 1, field: {allowBlank: false} },
                {
                    header: 'Type',
                    width: '40%',
                    dataIndex: 'type',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        store: tagTypeStore,
                        displayField: 'type',
                        valueField: 'type',
                    })
                }
            ],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'New Tag',
                    scope: this,
                    handler: function(){
                        var rec = {
                            title: 'Tag',
                            type: 1
                        };

                        tagStore.insert(0, rec);
                        cellEditing.startEditByPosition({
                            row: 0, 
                            column: 0
                        });
                    }
                }, {
                    xtype: 'button',
                    text: 'Delete Tags',
                    hidden: true,
                    handler: function() {
                        Ext.MessageBox.confirm('Delete', 'Are you sure you want to delete the selected items?', function(btn){
                            if(btn === 'yes'){
                                var s = tagView.getSelectionModel().getSelection();
                                selected = [];
                                Ext.each(s, function (item) {
                                    Ext.Ajax.request({
                                        url: '/json/tag/delete/' + item.data.id,
                                        callback: function(response) {
                                            tagStore.load();
                                        }
                                    });
                                });
                            }
                        });
                    }
                }]
            }],
            listeners: {
                selectionchange: function()
                {
                    var s = tagView.getSelectionModel().getSelection();
                    if (s.length > 0) {
                        tagView.dockedItems.get(2).items.get(1).show();
                    } else {
                        tagView.dockedItems.get(2).items.get(1).hide();
                    }
                }
            },
            enableDrop: true,
            plugins: [cellEditing,
                new Ext.ux.dd.AssetCellFieldDropZone({
                    ddGroup: 'viewDDGroup',
                    onCellDrop: function(target, dragData) {
                        for (var i in dragData.records) {
                            console.log(dragData.records[i].data)
                            console.log(target.record.data);

                            dragData.records[i].data.tags.push(target.record.data);

                            Ext.Ajax.request({
                                url: '/json/asset/update/' + target.record.data.id,
                                method: 'POST',
                                params: $.param({info: dragData.records[i].data}),
                                callback: function(response) {
                                    //still nothing
                                    tagStore.load();
                                }
                            });
                        }
                        
                    }
                })
            ],
            border: 0,
            region: 'west',
            title: 'Tags',
            width: 300,
            split: true,
            collapsible: true,
            collapsed: true,
            floatable: false
        });
    }

    return tagView;
}

