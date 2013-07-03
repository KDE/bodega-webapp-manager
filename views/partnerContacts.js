
    var contactsWindow;
    var contactsStore;
    var contactsView;
    var currentPartner;

    var contactInputView;

    function loadPartnerContacts(partnerData) {

        if (!contactsWindow) {
            contactsStore = Ext.create('Ext.data.Store', {
                autoLoad: true,
                storeId: 'contactsStore',
                fields:['partner', 'service', 'account', 'url'],
                clearOnLoad: true,
                data: partnerData ? partnerData.tags : null,
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json'
                    }
                }
            });

            contactsView = Ext.create('Ext.grid.Panel', {
                id: 'contactsView',
                store: contactsStore,
                selType: 'checkboxmodel',
                inline: true,
                columns: [
                    { header: 'Service',  dataIndex: 'service', flex: 1},
                    { header: 'Account', dataIndex: 'account', flex: 1},
                    { header: 'Url', dataIndex: 'url', flex: 1}
                    ],
                rootVisible: false,
                region: 'center',
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        text: 'New Contact',
                        scope: this,
                        handler: function() {
                            contactInputView.show();
                        }
                    }, {
                        xtype: 'button',
                        text: 'Delete channels',
                        hidden: true,
                        handler: function() {
                            Ext.MessageBox.confirm('Delete', 'Are you sure you want to delete the selected items?', function(btn) {
                                if (btn === 'yes') {
                                    var s = contactsView.getSelectionModel().getSelection();
                                    selected = [];
                                    Ext.each(s, function (item) {
                                        Ext.Ajax.request({
                                            url: '/json/partner/' + currentPartner + '/link/delete/',
                                        });
                                    });
                                }
                            });
                        }
                    }]
                }],
                listeners: {
                    selectionchange: function() {
                        var s = contactsView.getSelectionModel().getSelection();

                        if (s.length > 0) {
                            contactsView.dockedItems.get(1).items.get(1).show();
                        } else {
                            contactsView.dockedItems.get(1).items.get(1).hide();
                        }
                    },
                    load: function( parent, node, records, successful, eOpts ) {
                        if (successful) {
                            contactsView.expandAll();
                        }
                    }
                }
            });

            contactInputView = Ext.create('Ext.form.Panel', {
                region: 'south',
                hidden: true,

                fieldDefaults: {
                    labelAlign: 'right',
                    labelWidth: 90,
                    anchor: '100%'
                },

                items: [{
                    id: 'service',
                    name: 'service',
                    xtype: 'combobox',
                    value: 'website',
                    fieldLabel: 'Service',
                    editable: false,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['name', 'value'],
                        data: [
                            {'name': 'Website', 'value': 'website'},
                            {'name': 'Identi.ca', 'value': 'identi.ca'},
                            {'name': 'Blog', 'value': 'blog'},
                            {'name': 'Facebook', 'value': 'facebook'},
                            {'name': 'Google+', 'value': 'google+'},
                            {'name': 'Twitter', 'value': 'twitter'}
                            ]
                    }),
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'value'
                }, {
                    id: 'account',
                    xtype: 'textfield',
                    name: 'account',
                    fieldLabel: 'Account',
                }, {
                    id: 'url',
                    xtype: 'textfield',
                    name: 'url',
                    fieldLabel: 'Url',
                }],

                buttons: [{
                    text: 'Save',
                    handler: function() {
                        // Create a model instance
                        var rec = {
                            partner: partnerData.id,
                            service: contactInputView.items.get('service').getValue(),
                            account: contactInputView.items.get('account').getValue(),
                            url: contactInputView.items.get('url').getValue()
                        };

                        Ext.Ajax.request({
                            url: '/json/partner/' + currentPartner + '/link/create',
                            method: 'POST',
                            params: $.param(rec),
                        });

                        contactsStore.insert(0, rec);
                        contactInputView.hide();
                    }
                }, {
                    text: 'Cancel',
                    handler: function() {
                        contactInputView.hide();
                    }
                }]
            });

            contactsWindow = Ext.create('widget.window', {
                title: 'Contacts for Partner ' + partnerData.name,
                closable: true,
                closeAction: 'hide',
                modal: true,
                //animateTarget: this,
                width: '80%',
                height: '80%',
                layout: 'border',
                bodyStyle: 'padding: 5px;',
                items: [contactsView, contactInputView]
            });
        } else {
            contactsStore.removeAll();
            for (var i = 0; i < partnerData.links.length; ++i) {
                contactsStore.insert(0, partnerData.links[i]);
            }
        }

        currentPartner = partnerData.id;

        if (contactsWindow.isVisible()) {
            contactsWindow.hide();
        } else {
            contactsWindow.show();
            contactsWindow.restore();
        }
    }

