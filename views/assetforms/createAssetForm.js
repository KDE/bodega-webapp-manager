
var assetDetailsForm;

function createToolBar() {
    return {
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'button',
            text: 'Single Asset',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/single";
            }
        }, {
            xtype: 'button',
            text: 'Mass create',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/mass";
            }
        }, {
            xtype: 'button',
            text: 'App from OBS',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/obs";
            }
        }]
    }
}

function createPanel(extraFields, title, assetType) {
    return Ext.create('Ext.Panel', {
        collapsible: false,
        title: title,
        region: 'center',
        overflowY: 'auto',
        dockedItems: [createToolBar()],
        items: [createAssetForm(extraFields, assetType)]
    });
}

function createAssetForm(extraFields, assetType) {
    var lastImageField = 0;

    var ratingStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'ratingStore',
        fields:['type', 'title'],
        proxy: {
            type: 'ajax',
            url: '/json/tag/list/contentrating',
            reader: {
                type: 'json',
                root: 'tags'
            }
        }
    });

    var partnerStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'typeStore',
        fields:['id', 'name'],
        proxy: {
            type: 'ajax',
            url: '/json/partner/list',
            reader: {
                type: 'json',
                root: 'partners'
            }
        },
        listeners: {
            load: function ( store, records, successful, eOpts ) {
                currentPartner = records[0].internalId;
                partnerStore.combo.setValue(currentPartner);
            }
        }
    });

    var typeStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'typeStore',
        fields:['id', 'type', 'title'],
        proxy: {
            type: 'ajax',
            url: '/json/tag/list/assetType',
            reader: {
                type: 'json',
                root: 'tags'
            }
        }
    });

    var lastTagIndex = 1;

    var relatedStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'relatedStore',
        fields:['name', 'multi', 'required', 'tags', 'type'],
        proxy: {
            type: 'ajax',
            url: '/json/tag/list/forAssetType/',
            reader: {
                type: 'json',
                //root: 'tags'
            }
        },
        listeners: {
            load: function ( store, records, successful, eOpts ) {

                var fields = Ext.getCmp('typeSpecificFields');
                var assetTypeCombo = Ext.getCmp('assetTypeCombo');
               // var newType = records[0].data.title;

                var record;

                var fieldsData = records[0].data.tags;
                for (var i in fieldsData) {
                    record = fieldsData[i];
                    fields.add([{
                            id: record.type + 'TagFields',
                            xtype:'fieldset',
                            collapsible: false,
                            defaultType: 'textfield',
                            layout: 'anchor',
                            border: 0,
                            padding: 0,
                            fieldRecord: record,
                            addItem: function(isFirst) {
                                var fields = Ext.getCmp(record.type + 'TagFields');
                                this.add([
                                    {
                                        xtype: 'hidden',
                                        name: 'info[tags][' + lastTagIndex + '][type]',
                                        value: this.fieldRecord.type
                                    }, {
                                        xtype: this.fieldRecord.tags === undefined ? 'textfield' : 'combobox',
                                        name: 'info[tags][' + lastTagIndex + '][title]',
                                        fieldLabel: this.fieldRecord.name,
                                        displayField: 'title',
                                        editable: this.fieldRecord.tags === undefined,
                                        valueField: 'title',
                                        generateClone: this.fieldRecord.multi,
                                        store: Ext.create('Ext.data.Store', {
                                            autoLoad: true,
                                            storeId:'tagStore',
                                            fields:['type', 'title'],
                                            data: this.fieldRecord,
                                            proxy: {
                                                type: 'memory',
                                                reader: {
                                                    type: 'json',
                                                    root: 'tags'
                                                }
                                            }
                                        }),
                                        allowBlank: !this.fieldRecord.required || !isFirst,
                                        listeners: {
                                            change: function( parent, value, eOpts ) {
                                                if (!this.generateClone) {
                                                    return;
                                                }
                                                var fields = this.up('fieldset');
                                                fields.addItem(false);
                                                this.generateClone = false;
                                            }
                                        }
                                    }
                                ]);
                                ++lastTagIndex;
                            },
                            defaults: {
                                anchor: '100%'
                            },
                            items :[]
                        }
                    ]);
                    var tagFields = Ext.getCmp(record.type + 'TagFields');
                    tagFields.addItem(true);
                }
            }
        }
    });

    function addImageField() {

        var form = Ext.create('Ext.form.field.File', {
            xtype: 'filefield',
            id: 'file-' + lastImageField,
            name: 'file-' + lastImageField,
            numericalId: lastImageField,
            fieldLabel: 'Image:',
            listeners: {
                change: function( parent, value, eOpts ) {
                    addImageField();
                },
                afterrender: function(el) {
                    var element = el.fileInputEl;

                    document.getElementById('file-'+el.numericalId+'-button-fileInputEl').addEventListener('change', function () {
                        var file = this.files[0];
                        if (!file.type) {
                            return;
                        }

                        //HACK: rename the file field on the fly: the actual internal input field and all its wrapping objects
                        el.name = file.name;
                        el.config.name = file.name;
                        element.name = file.name;

                        document.getElementById('file-'+el.numericalId+'-button-fileInputEl').name = file.name;

                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[previews][' + el.numericalId + '][file]',
                            value: file.name
                        });
                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[previews][' + el.numericalId + '][mimetype]',
                            value: file.type
                        });
                    });
                }
            }
        });

        assetDetailsForm.add(form);
        var typeCombo = assetDetailsForm.add({
            xtype: 'combobox',
            id: 'info[previews][' + lastImageField + '][type]',
            name: 'info[previews][' + lastImageField + '][type]',
            displayField: 'value',
            valueField: 'value',
            value: 'screenshot',
            fieldLabel: 'Image type',
            store: Ext.create('Ext.data.Store', {
                fields: ['value'],
                data: [{'value': 'screenshot'},
                    {'value': 'icon'},
                    {'value': 'cover'}],
            }),
            listeners:{
                'select': function() {
                    subTypeCombo.store.removeAll();
                    subTypeCombo.store.loadData(subTypeData(typeCombo.value));
                    subTypeCombo.setValue(subTypeCombo.store.data.items[0].data.value);
                }
            }
        });

        function subTypeData(type) {
            if (type === 'screenshot') {
                return [{'value': 'screen1'},
                        {'value': 'screen2'}];
            } else if (type === 'icon') {
                return [{'value': 'tiny'},
                        {'value': 'small'},
                        {'value': 'medium'},
                        {'value': 'big'},
                        {'value': 'large'},
                        {'value': 'huge'}];
            //Assume "cover"
            } else {
                return [{'value': 'front'},
                        {'value': 'back'}];
            }
        }

        var subTypeCombo = assetDetailsForm.add({
            xtype: 'combobox',
            id: 'info[previews][' + lastImageField + '][subtype]',
            name: 'info[previews][' + lastImageField + '][subtype]',
            displayField: 'value',
            valueField: 'value',
            value: 'screen1',
            fieldLabel: 'Image subtype',
            store: Ext.create('Ext.data.Store', {
                fields: ['value'],
                data: subTypeData('screenshot')
            })
        });
        assetDetailsForm.doLayout();
        ++lastImageField;
    }

    if (assetDetailsForm) {
        assetDetailsForm.destroy();
    }
    assetDetailsForm = Ext.create('Ext.form.Panel', {
        //frame: true,
        bodyPadding: 5,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 90,
            anchor: '100%'
        },

        overflowY: 'auto',

        items: [{
            id: 'assetTypeCombo',
            xtype: 'combobox',
            name: 'info[tags][0][title]',
            fieldLabel: 'Type',
            displayField: 'title',
            valueField: 'title',
            store: typeStore,
            editable: false,
            allowBlank: false,
            listeners: {
                'select': function (combo, records, eOpts) {
                    var fields = Ext.getCmp('typeSpecificFields');

                    //get rid of old fields
                    for (var i = fields.items.items.length -1; i >=0; --i) {
                        fields.items.items[i].destroy();
                    }
                    lastImageField = 1;

                    relatedStore.proxy.url = '/json/tag/list/forAssetType/' + records[0].data.title;
                    relatedStore.reload();
                }
            }
        }, {
            xtype: 'combobox',
            fieldLabel: 'Partner',
            name: 'info[partner]',
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            width: 120,
            //value: '#{listType}',
            store: partnerStore,
            listeners: {
                'select': function(combo, record, index) {
                    currentPartner = combo.getValue();
                },
                afterrender: function (combo, eopts) {
                    partnerStore.combo = combo;
                }
            }
        }, {
            id: 'name',
            xtype: 'textfield',
            name: 'info[name]',
            fieldLabel: 'Name',
            allowBlank: false
        }, {
            id: 'license',
            xtype: 'combobox',
            name: 'info[license]',
            fieldLabel: 'License',
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'value',
            value: '4',
            store: Ext.create('Ext.data.Store', {
                fields: ['name', 'value'],
                data: [{'name': 'GPL', 'value': '1'},
                    {'name': 'LGPL', 'value': '2'},
                    {'name': 'BSD', 'value': '3'},
                    {'name': 'Creative Commons Attribution', 'value': '4'},
                    {'name': 'Creative Commons Attribution-ShareAlike', 'value': '5'},
                    {'name': 'Creative Commons Attribution-NoDerivs', 'value': '6'},
                    {'name': 'Creative Commons Attribution-NonCommercial', 'value': '7'},
                    {'name': 'Creative Commons Attribution-NonCommercial-ShareAlike', 'value': '8'},
                    {'name': 'Creative Commons Attribution-NonCommercial-NoDerivs', 'value': '9'},
                    {'name': 'Proprietary', 'value': '10'}],
            }),
            allowBlank: false
        }, {
            id: 'version',
            xtype: 'textfield',
            name: 'info[version]',
            fieldLabel: 'Version',
            value: '1.0',
            allowBlank: false
        }, {
            id: 'asset',
            xtype: 'filefield',
            name: 'asset',
            fieldLabel: 'File',
            listeners: {
                afterrender: function(el) {
                    //It doesn't work if el.fileInputEl is used
                    //var element = el.fileInputEl;

                    document.getElementById('asset-button-fileInputEl').addEventListener('change', function () {
                        var file = this.files[0];
                        if (!file.size) {
                            return;
                        }

                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[file]',
                            value: file.name
                        });
                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[size]',
                            value: file.size
                        });
                    });
                }
            },
            allowBlank: false
        }, {
            id: 'description',
            xtype: 'textareafield',
            name: 'info[description]',
            fieldLabel: 'Description',
            allowBlank: false
        }, {
            id: 'baseprice',
            xtype: 'numberfield',
            name: 'info[baseprice]',
            fieldLabel: 'Base Price',
            minValue: 0,
            value: 0,
            allowBlank: false
        }, {
            id: 'posted',
            xtype: 'hidden',
            name: 'info[posted]',
            value: false
        }, {
            xtype: 'hidden',
            name: 'info[tags][0][type]',
            value: 'assetType'
        }, {
            id: 'typeSpecificFields',
            xtype:'fieldset',
            collapsible: false,
            defaultType: 'textfield',
            layout: 'anchor',
            border: 0,
            padding: 0,
            defaults: {
                anchor: '100%'
            },
            items :[]
        }],

        buttons: [{
            text: 'Create',
            handler: function() {

                var form = this.up('form').getForm();
                if (form.isValid()) {
                    //disable the last file field, since is empty and with invalid data
                    assetDetailsForm.items.get('file-' + (lastImageField-1)).disable();
                    assetDetailsForm.items.get('info[previews][' + (lastImageField-1) + '][type]').disable();
                    assetDetailsForm.items.get('info[previews][' + (lastImageField-1) + '][subtype]').disable();

                    form.submit({
                        url: '/json/asset/create',
                        waitMsg: 'Creating the asset...',
                        //params: $.param({info: data}),
                        success: function(fp, o) {
                            var resp = JSON.parse(response.responseText);
                            if (resp.success) {
                                window.location.href = "/asset/list/incoming";
                            } else {
                                Ext.MessageBox.alert('Error', 'Error in uploading the asset.<br/>' + (resp.message ? resp.message : resp.error.type));
                            }
                        },
                        failure: function(form, action) {
                            Ext.MessageBox.alert('Error', 'Error in uploading the asset');
                            //window.location.href = "/asset/list/incoming";
                        }
                    });
                }
            }
        }]
    });

    if (assetType) {
        var assetTypeCombo = Ext.getCmp('assetTypeCombo');
        if (assetTypeCombo) {
            assetTypeCombo.select(assetType);
            assetTypeCombo.hidden = true;
            relatedStore.proxy.url = '/json/tag/list/forAssetType/' + assetType;
        }
    }

    assetDetailsForm.add(extraFields);
    addImageField();


    return assetDetailsForm;
}


