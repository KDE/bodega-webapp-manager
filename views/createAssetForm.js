
var assetDetailsForm;

function createToolBar() {
    return {
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'button',
            text: 'Mass create',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/mass";
            }
        }, {
            xtype: 'button',
            text: 'Generic Asset',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/generic";
            }
        }, {
            xtype: 'button',
            text: 'Book Asset',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/book";
            }
        }, {
            xtype: 'button',
            text: 'Plasma Package',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/plasmapackage";
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

function createPanel(extraFields) {
    return Ext.create('Ext.Panel', {
        collapsible: false,
        region: 'center',
        dockedItems: [createToolBar()],
        items: [createAssetForm(extraFields)]
    });
}

function createAssetForm(extraFields) {
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
                        document.getElementById('file'+el.numericalId+'-button-fileInputEl').name = file.name;


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
        assetDetailsForm.add({
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
        });
        assetDetailsForm.add({
            xtype: 'combobox',
            id: 'info[previews][' + lastImageField + '][subtype]',
            name: 'info[previews][' + lastImageField + '][subtype]',
            displayField: 'value',
            valueField: 'value',
            value: 'screen1',
            fieldLabel: 'Image subtype',
            store: Ext.create('Ext.data.Store', {
                fields: ['value'],
                data: [{'value': 'screen1'},
                    {'value': 'screen2'},
                    {'value': 'front'},
                    {'value': 'back'}],
            }),
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
            value: 'contentrating'
        }, {
            xtype: 'combobox',
            name: 'info[tags][0][title]',
            fieldLabel: 'Rating',
            displayField: 'title',
            valueField: 'title',
            store: ratingStore,
            editable: false,
            allowBlank: false
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
                            window.location.href = "/asset/list/incoming";
                        },
                        failure: function(form, action) {
                            window.location.href = "/asset/list/incoming";
                        }
                    });
                }
            }
        }]
    });
    assetDetailsForm.add(extraFields);
    addImageField();


    return assetDetailsForm;
}


