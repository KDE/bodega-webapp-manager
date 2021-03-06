
var creationFormWindow;
var creationFormForm;

function showStoreCreationForm(dataStore) {

    if (creationFormWindow) {
        creationFormForm.destroy();
        creationFormWindow.destroy();
    }

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
                    refreshAssetsStore();
                }
            }
        });

    creationFormForm = Ext.create('Ext.form.Panel', {
        bodyPadding: 5,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 90,
            anchor: '100%'
        },

        items: [{
            xtype: 'label',
            text: 'Enter an identifier name for this store below. Note that the name must be unique in the warehouse as this name will be used to know which store to show when people authenticate using a Bodega client.'
        }, {
            id: 'id',
            xtype: 'textfield',
            name: 'id',
            fieldLabel: 'ID',
            allowBlank: false
        }, {
            xtype: 'combobox',
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            name: 'partner',
            id: 'partner',
            fieldLabel: 'Partner',
            store: partnerStore,
            listeners: {
                afterrender: function (combo, eopts) {
                    partnerStore.combo = combo;
                }
            }
        }, {
            id: 'name',
            xtype: 'textfield',
            name: 'name',
            fieldLabel: 'Name',
            allowBlank: false
        }, {
            id: 'desc',
            xtype: 'textfield',
            name: 'desc',
            fieldLabel: 'Description',
            allowBlank: false
        }, {
            id: 'minMarkup',
            xtype: 'numberfield',
            name: 'minMarkup',
            fieldLabel: 'Min Markup',
            allowBlank: false
        }, {
            id: 'maxMarkup',
            xtype: 'numberfield',
            name: 'maxMarkup',
            fieldLabel: 'Max Markup',
            allowBlank: false
        }, {
            id: 'markup',
            xtype: 'numberfield',
            name: 'markup',
            fieldLabel: 'Markup',
            allowBlank: false
        }],

        buttons: [{
            text: 'Create Store',
            handler: function() {

                var form = this.up('form').getForm();

                if (form.isValid()) {
                    form.submit({
                        url: '/json/store/create',
                        waitMsg: 'Sending request...',
                        success: function(form, opts) {
                            var resp = JSON.parse(opts.response.responseText);
                            if (resp.success) {
                                creationFormWindow.hide();
                                Ext.MessageBox.alert('', 'Store created successfully.');
                                dataStore.reload();
                                dataStore.reload();
                            } else {
                                //console.log(resp);
                                //console.log(opts)
                                Ext.MessageBox.alert('Error', 'Error during store creation.<br/>' + (resp.message ? resp.message : resp.error.type));
                            }
                        },
                        failure: function(form, opts) {
                            var resp = JSON.parse(opts.response.responseText);
                            Ext.MessageBox.alert('Error', 'Error during store creation.<br/>' + (resp.message ? resp.message : resp.error.type));
                        }
                    });
                }
            }
        }, {
            text: 'Cancel',
            handler: function() {
                creationFormWindow.hide();
            }
        }]
    });

    creationFormWindow = Ext.create('widget.window', {
        title: 'Create A New Store',
        closable: true,
        closeAction: 'hide',
        modal: true,
        width: '80%',
        layout: 'fit',
        bodyStyle: 'padding: 5px;',
        items: [creationFormForm]
    });

    creationFormWindow.show();
    creationFormWindow.restore();

}


