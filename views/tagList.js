
function createTagList(config) {

    var tagTypeStore = Ext.create('Ext.data.Store', {
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

    var tagStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId:'tagStore',
        fields:['id', 'typeid', 'type', 'editable', 'title'],
        proxy: {
            type: 'ajax',
            url: '/json/tag/list',
            reader: {
                type: 'json',
                root: 'tags'
            }
        },
        listeners: {
            update: function(store, record, operation, eOpts ) {
                record.raw.title = record.data.title;
                record.raw.type = record.data.type;
                console.log(record.raw)
                if (record.raw.newData) {
                     Ext.Ajax.request({
                        url: '/json/tag/create/',
                        method: 'POST',
                        params: $.param(record.raw),
                        callback: function(response) {
                            tagStore.removeAll();
                            tagStore.load();
                            cellEditing.startEditByPosition({
                                row: 0,
                                column: 0
                            });
                        }
                    });
                } else {
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
        }
    });
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function(editor, e, eOpts) {
                console.log(e)
                if (!e.record.data.editable) {
                    return false;
                }
            }
        }
    });
    var tagView = Ext.create('Ext.grid.Panel', {
        store: tagStore,
        //selType: 'checkboxmodel',
        selModel: {
            selType: 'checkboxmodel',
            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                if (record.data.editable) {
                    var baseCSSPrefix = Ext.baseCSSPrefix;
                    metaData.tdCls = baseCSSPrefix + 'grid-cell-special ' + baseCSSPrefix + 'grid-cell-row-checker';
                    return '<div class="' + baseCSSPrefix + 'grid-row-checker">&#160;</div>';
                }
            }
        },
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
                        type: 'author',
                        editable: true,
                        newData: true
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
                                if (item.data.editable) {
                                    Ext.Ajax.request({
                                        url: '/json/tag/delete/' + item.data.id,
                                        callback: function(response) {
                                            tagStore.load();
                                        }
                                    });
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
                var s = tagView.getSelectionModel().getSelection();
                var show = false;

                Ext.each(s, function (item) {
                    if (item.data.editable) {
                        show = true;
                    }
                });

                if (show) {
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
        floatable: false,
        viewConfig: config
    });

    return tagView;
}

