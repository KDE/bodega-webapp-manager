
    var peopleWindow;
    var peopleStore;
    var peopleView;
    var currentPartner;

    var contactInputView;

    function loadPartnerPeople(partnerData) {

        currentPartner = partnerData.id;

        if (peopleWindow) {
            peopleWindow.destroy();
            peopleStore.destroy();
            peopleView.destroy();
        }

        peopleStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            storeId: 'peopleStore',
            fields:['name', 'email', 'roles'],
            clearOnLoad: true,
            data: partnerData ? partnerData.people : null,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        });

        peopleView = Ext.create('Ext.grid.Panel', {
            id: 'peopleView',
            store: peopleStore,
            inline: true,
            columns: [
                { header: 'Name',  dataIndex: 'name', flex: 1},
                { header: 'Email', dataIndex: 'email', flex: 1},
                { header: 'Roles', dataIndex: 'roles', flex: 1}
                ],
            rootVisible: false,
            region: 'center',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'Add Person',
                    scope: this,
                    handler: function() {
                        contactInputView.items.get('email').setReadOnly(false);
                        contactInputView.items.get('email').setValue('')

                        contactInputView.items.get('roles[contentcreator]').setValue(false);
                        contactInputView.items.get('roles[accounts]').setValue(false);
                        contactInputView.items.get('roles[partnermanager]').setValue(false);
                        contactInputView.items.get('roles[storemanager]').setValue(false);
                        contactInputView.items.get('roles[validator]').setValue(false);
                        contactInputView.show();
                    }
                }, {
                    xtype: 'button',
                    text: 'Remove Person',
                    hidden: true,
                    handler: function() {
                        Ext.MessageBox.confirm('Delete', 'Are you sure you want to remove the selected people from the partner?', function(btn) {
                            if (btn === 'yes') {
                                var s = peopleView.getSelectionModel().getSelection();
                                selected = [];
                                Ext.each(s, function (item) {
                                    Ext.Ajax.request({
                                        url: '/json/partner/roles/update/' + currentPartner,
                                        params: $.param({person: item.email}),
                                    });
                                });
                            }
                        });
                    }
                }]
            }],
            listeners: {
                selectionchange: function() {
                    var s = peopleView.getSelectionModel().getSelection();

                    if (s.length > 0) {
                        peopleView.dockedItems.get(1).items.get(1).show();

                        contactInputView.items.get('email').setReadOnly(true);
                        contactInputView.items.get('email').setValue(s[0].data.email)

                        contactInputView.items.get('roles[contentcreator]').setValue(s[0].data.roles.indexOf('Content Creator') !== -1);
                        contactInputView.items.get('roles[accounts]').setValue(s[0].data.roles.indexOf('Accounts') !== -1);
                        contactInputView.items.get('roles[partnermanager]').setValue(s[0].data.roles.indexOf('Partner Manager') !== -1);
                        contactInputView.items.get('roles[storemanager]').setValue(s[0].data.roles.indexOf('Store Manager') !== -1);
                        contactInputView.items.get('roles[validator]').setValue(s[0].data.roles.indexOf('Validator') !== -1);

                        contactInputView.show();
                    } else {
                        peopleView.dockedItems.get(1).items.get(1).hide();
                        contactInputView.hide();
                    }
                },
                load: function( parent, node, records, successful, eOpts ) {
                    if (successful) {
                        peopleView.expandAll();
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
                id: 'email',
                xtype: 'textfield',
                name: 'email',
                fieldLabel: 'Email',
            }, {
                id: 'roles[accounts]',
                xtype: 'checkboxfield',
                name: 'roles[accounts]',
                fieldLabel: 'Accounts',
            }, {
                id: 'roles[contentcreator]',
                xtype: 'checkboxfield',
                name: 'roles[contentcreator]',
                fieldLabel: 'Content Creator',
            }, {
                id: 'roles[partnermanager]',
                xtype: 'checkboxfield',
                name: 'roles[partnermanager]',
                fieldLabel: 'Partner Manager',
            }, {
                id: 'roles[storemanager]',
                xtype: 'checkboxfield',
                name: 'roles[storemanager]',
                fieldLabel: 'Store Manager',
            }, {
                id: 'roles[validator]',
                xtype: 'checkboxfield',
                name: 'roles[validator]',
                fieldLabel: 'Validator',
            }],

            buttons: [{
                text: 'Save',
                handler: function() {
                    // Create a model instance
                    var roles = [];
                    if (contactInputView.items.get('roles[accounts]').getValue()) {
                        roles.push('Accounts');
                    }
                    if (contactInputView.items.get('roles[contentcreator]').getValue()) {
                        roles.push('Content Creator');
                    }
                    if (contactInputView.items.get('roles[partnermanager]').getValue()) {
                        roles.push('Partner Manager');
                    }
                    if (contactInputView.items.get('roles[storemanager]').getValue()) {
                        roles.push('Store Manager');
                    }
                    if (contactInputView.items.get('roles[validator]').getValue()) {
                        roles.push('Validator');
                    }
                    var rec = {
                        person: contactInputView.items.get('email').getValue(),
                        roles: roles
                    };

                    Ext.Ajax.request({
                        url: '/json/partner/roles/update/' + currentPartner,
                        method: 'POST',
                        params: $.param(rec),
                        callback: function(response) {
                            for (var i in partnerData.people) {
                                if (partnerData.people[i].email === rec.person) {
                                    partnerData.people[i].roles = roles;
                                    break;
                                }
                            }
                            loadPartnerPeople(partnerData);
                        }
                    });
                }
            }, {
                text: 'Cancel',
                handler: function() {
                    contactInputView.hide();
                }
            }]
        });

        peopleWindow = Ext.create('widget.window', {
            title: 'Contacts for Partner ' + partnerData.name,
            closable: true,
            closeAction: 'hide',
            modal: true,
            //animateTarget: this,
            width: '80%',
            height: '80%',
            layout: 'border',
            bodyStyle: 'padding: 5px;',
            items: [peopleView, contactInputView]
        });



        if (peopleWindow.isVisible()) {
            peopleWindow.hide();
        } else {
            peopleWindow.show();
            peopleWindow.restore();
        }
    }

