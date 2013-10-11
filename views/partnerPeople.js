
    var peopleWindow;
    var peopleStore;
    var peopleView;
    var currentPartner;

    var personInputView;

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

        Ext.Ajax.request({
            url: '/json/partner/roles/list',
            method: 'GET',
            success: function(response) {
                var responseObj = Ext.decode(response.responseText);
                if (!responseObj.roles || responseObj.roles.length === 0) {
                    return;
                }

                var roleTypes = responseObj.roles;

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
                                personInputView.items.get('email').setReadOnly(false);
                                personInputView.items.get('email').setValue('')

                                for (var i in roleTypes) {
                                    var fieldName = roleTypes[i].toLowerCase();
                                    fieldName = fieldName.replace(/\s+/g, '');
                                    fieldName = 'roles[' + fieldName + ']';
                                    personInputView.items.get(fieldName).setValue(false);
                                }
                                personInputView.show();
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

                                personInputView.items.get('email').setReadOnly(true);
                                personInputView.items.get('email').setValue(s[0].data.email)

                                for (var i in roleTypes) {
                                    var fieldName = roleTypes[i].toLowerCase();
                                    fieldName = fieldName.replace(/\s+/g, '');
                                    fieldName = 'roles[' + fieldName + ']';
                                    personInputView.items.get(fieldName).setValue(s[0].data.roles.indexOf(roleTypes[i]) !== -1);
                                }

                                personInputView.show();
                            } else {
                                peopleView.dockedItems.get(1).items.get(1).hide();
                                personInputView.hide();
                            }
                        },
                        load: function( parent, node, records, successful, eOpts ) {
                            if (successful) {
                                peopleView.expandAll();
                            }
                        }
                    }
                });

                personInputView = Ext.create('Ext.form.Panel', {
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
                    }],

                    buttons: [{
                        text: 'Save',
                        handler: function() {
                            // Create a model instance
                            var roles = [];

                            for (var i in roleTypes) {
                                var fieldName = roleTypes[i].toLowerCase();
                                fieldName = fieldName.replace(/\s+/g, '');
                                fieldName = 'roles[' + fieldName + ']';

                                if (personInputView.items.get(fieldName).getValue()) {
                                    roles.push(roleTypes[i]);
                                }
                            }

                            var rec = {
                                person: personInputView.items.get('email').getValue(),
                                roles: roles
                            };

                            Ext.Ajax.request({
                                url: '/json/partner/roles/update/' + currentPartner,
                                method: 'POST',
                                params: $.param(rec),
                                success: function(response) {
                                    var responseObj = Ext.decode(response.responseText);

                                    if (responseObj.error && responseObj.error.type === 'InvalidAccount') {
                                        Ext.Msg.alert('Error', 'The account ' + rec.person + ' does not exist.');
                                        return;
                                    }

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
                            personInputView.hide();
                        }
                    }]
                });

                //Add a checkbox for each fetched role
                for (var i in roleTypes) {
                    var fieldName = roleTypes[i].toLowerCase();
                    fieldName = fieldName.replace(/\s+/g, '');
                    fieldName = 'roles[' + fieldName + ']';
                    personInputView.add({
                        id: fieldName,
                        xtype: 'checkboxfield',
                        name: fieldName,
                        fieldLabel: roleTypes[i]
                     });
                }

                peopleWindow = Ext.create('widget.window', {
                    title: 'People with ' + partnerData.name,
                    closable: true,
                    closeAction: 'hide',
                    modal: true,
                    //animateTarget: this,
                    width: '80%',
                    height: '80%',
                    layout: 'border',
                    bodyStyle: 'padding: 5px;',
                    items: [peopleView, personInputView]
                });

                if (peopleWindow.isVisible()) {
                    peopleWindow.hide();
                } else {
                    peopleWindow.show();
                    peopleWindow.restore();
                }
            }
        });
    }

