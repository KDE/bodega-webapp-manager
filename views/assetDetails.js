
var assetDetailsWindow;
var assetDetailsForm;
var currentAsset;

function loadAssetDetails(assetData) {
    currentAsset = assetData.id;
    
    if (!assetDetailsWindow) {
        assetDetailsForm = Ext.create('Ext.form.Panel', {
            //frame: true,
            bodyPadding: 5,

            fieldDefaults: {
                labelAlign: 'right',
                labelWidth: 90,
                anchor: '100%'
            },

            items: [{
                id: 'name',
                xtype: 'textfield',
                name: 'info[name]',
                fieldLabel: 'Name',
                value: assetData.name
            }, {
                id: 'license',
                xtype: 'numberfield',
                name: 'info[license]',
                fieldLabel: 'License (TODO: combobox)',
                value: assetData.license,
                minValue: 0,
                maxValue: 200
            }, {
                id: 'version',
                xtype: 'textfield',
                name: 'info[version]',
                fieldLabel: 'Version',
                value: assetData.version
            }, {
                xtype: 'filefield',
                name: 'image',
                fieldLabel: 'Image (TODO)'
            }, {
                id: 'description',
                xtype: 'textareafield',
                name: 'info[description]',
                fieldLabel: 'Description',
                value: assetData.description
            }, {
                id: 'baseprice',
                xtype: 'numberfield',
                name: 'info[baseprice]',
                fieldLabel: 'Base Price',
                value: assetData.baseprice,
                minValue: 0,
                maxValue: 200
            }, {
                id: 'active',
                xtype: 'checkboxfield',
                name: 'info[active]',
                fieldLabel: 'Active',
                value: assetData.active
            }, {
                id: 'posted',
                xtype: 'hidden',
                name: 'info[posted]',
                value: false
            }, {
                id: 'id',
                xtype: 'hidden',
                name: 'info[id]',
                value: assetData.id
            }],

            buttons: [{
                text: 'Save',
                handler: function() {

                    var form = this.up('form').getForm();
                    if (form.isValid()) {
                        form.submit({
                            url: '/json/asset/update/' + currentAsset,
                            waitMsg: 'Updating the asset...',
                            //params: $.param({info: data}),
                            success: function(fp, o) {
                                store.removeAll();
                                store.load();
                                assetDetailsWindow.hide();
                            },
                            failure: function(form, action) {
                                assetDetailsWindow.hide();
                            }
                        });
                    }
                }
            },{
                text: 'Cancel',
                handler: function() {
                    assetDetailsWindow.hide();
                }
            }]
        });


        assetDetailsWindow = Ext.create('widget.window', {
            title: 'Details of Assets ' + assetData.name,
            closable: true,
            closeAction: 'hide',
            modal: true,
            width: '80%',
            height: '80%',
            layout: 'fit',
            bodyStyle: 'padding: 5px;',
            items: [assetDetailsForm]
        });
    } else {
        assetDetailsForm.items.get('name').setValue(assetData.name);
        assetDetailsForm.items.get('license').setValue(assetData.license);
        assetDetailsForm.items.get('version').setValue(assetData.version);
        assetDetailsForm.items.get('description').setValue(assetData.description);
        assetDetailsForm.items.get('baseprice').setValue(assetData.baseprice);
        assetDetailsForm.items.get('active').setValue(assetData.active);
        assetDetailsForm.items.get('id').setValue(assetData.id);
    }

    if (assetDetailsWindow.isVisible()) {
        assetDetailsWindow.hide(this, function() {
            button.dom.disabled = false;
        });
    } else {
        assetDetailsWindow.show(this, function() {
            button.dom.disabled = false;
        });
    }
}


