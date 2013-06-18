
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
                    this.up('form').getForm().isValid();
                }
            },{
                text: 'Cancel',
                handler: function() {
                    this.up('form').getForm().reset();
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


