
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
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'Name',
                value: assetData.name
            }, {
                xtype: 'numberfield',
                name: 'license',
                fieldLabel: 'License (TODO: combobox)',
                value: assetData.license,
                minValue: 0,
                maxValue: 200
            }, {
                xtype: 'textfield',
                name: 'version',
                fieldLabel: 'Version',
                value: assetData.version
            }, {
                xtype: 'filefield',
                name: 'image',
                fieldLabel: 'Image (TODO)'
            }, {
                xtype: 'textareafield',
                name: 'description',
                fieldLabel: 'Description',
                value: assetData.description
            }, {
                xtype: 'numberfield',
                name: 'baseprice',
                fieldLabel: 'Base Price',
                value: assetData.baseprice,
                minValue: 0,
                maxValue: 200
            }, {
                xtype: 'checkboxfield',
                name: 'active',
                fieldLabel: 'Active',
                value: assetData.active
            }],

            buttons: [{
                text: 'Save',
                handler: function() {
                    var data = {};
                    data.name = assetDetailsForm.down('textfield[name=name]').getValue();
                    data.license = assetDetailsForm.down('numberfield[name=license]').getValue();
                    data.version = assetDetailsForm.down('textfield[name=version]').getValue();
                    data.description = assetDetailsForm.down('textareafield[name=description]').getValue();
                    data.baseprice = assetDetailsForm.down('numberfield[name=baseprice]').getValue();
                    data.active = assetDetailsForm.down('checkboxfield[name=active]').getValue();
                    data.posted = false;
                    console.log(data);

                    Ext.Ajax.request({
                        url: '/json/asset/update/' + currentAsset,
                        method: 'POST',
                        params: $.param({info: data}),
                        timeout: 1000,
                        callback: function(response) {
                            store.removeAll();
                            store.load();
                            assetDetailsWindow.hide();
                        }
                    });
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
        assetDetailsForm.down('textfield[name=name]').setValue(assetData.name);
        assetDetailsForm.down('numberfield[name=license]').setValue(assetData.license);
        assetDetailsForm.down('textfield[name=version]').setValue(assetData.version);
        assetDetailsForm.down('textareafield[name=description]').setValue(assetData.description);
        assetDetailsForm.down('numberfield[name=baseprice]').setValue(assetData.baseprice);
        assetDetailsForm.down('checkboxfield[name=active]').setValue(assetData.active);
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


