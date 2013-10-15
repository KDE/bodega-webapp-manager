
    var bankingView;
    var bankingWindow;
    var bankingStore;

    var accountDetailsWindow;
    var accountDetailsView;

    function loadPartnerBanking(partnerData) {

        if (bankingWindow) {
            bankingWindow.destroy();
            bankingStore.destroy();
            bankingView.destroy();
        }

        bankingStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            storeId: 'bankingStore',
            fields:['type', 'nameOnAccount', 'address', 'bank',
                    'bankAddress', 'account', 'swift', 'iban'],
            clearOnLoad: true,
            proxy: {
                type: 'ajax',
                url: '/json/partner/' + partnerData.id + '/banking/account/list',
                reader: {
                    type: 'json',
                    root: 'accounts'
                }
            }
        });


        bankingView = Ext.create('Ext.grid.Panel', {
            store: bankingStore,
            selType: 'checkboxmodel',
            inline: true,
            region: 'center',
            columns: [
                { header: 'Bank',  dataIndex: 'bank', field: {allowBlank: false}},
                { header: 'Account',  dataIndex: 'account', field: {allowBlank: false}},
                { header: 'Iban',  dataIndex: 'iban', field: {allowBlank: false}, flex: 1},
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [{
                        icon: '/css/edit.png',
                        tooltip: 'Edit account details',
                        handler: function(grid, rowIndex, colIndex) {
                            loadAccountDetails(partnerData, bankingStore.getAt(rowIndex).data);
                        }
                    }]
                }
            ],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'New Account',
                    scope: this,
                    handler: function() {
                        loadAccountDetails(partnerData, null);
                    }
                }, {
                    xtype: 'button',
                    text: 'Delete Accounts',
                    hidden: true,
                    handler: function() {
                        Ext.MessageBox.confirm('Delete', 'Are you sure you want to delete the selected accounts?', function(btn){
                            if(btn === 'yes'){
                                var s = bankingView.getSelectionModel().getSelection();
                                selected = [];
                                Ext.each(s, function (item) {
                                    Ext.Ajax.request({
                                        url: '/json/partner/' + partnerData.id + '/banking/account/delete?type='+item.data.type,
                                        success: function(response, opts) {
                                            var resp = JSON.parse(response.responseText);
                                            if (resp.success) {
                                                Ext.MessageBox.alert('', 'Account deleted successfully.');
                                                bankingStore.reload();
                                            } else {
                                                Ext.MessageBox.alert('Error', 'Error in deleting the account.<br/>' + (resp.message ? resp.message : resp.error.type));
                                            }
                                        },
                                        failure: function(response, opts) {
                                            console.log('server-side failure with status code ' + response.status);
                                            Ext.MessageBox.alert('Error', 'Error in deleting the partner.');
                                        }
                                    });
                                });
                            }
                        });
                    }
                }]
            }],
            listeners: {
                selectionchange: function() {
                    var s = bankingView.getSelectionModel().getSelection();
                    if (s.length > 0) {
                        bankingView.dockedItems.get(1).items.get(1).show();
                    } else {
                        bankingView.dockedItems.get(1).items.get(1).hide();
                    }
                }
            },
        });


        bankingWindow = Ext.create('widget.window', {
            title: 'Bank account of ' + partnerData.name,
            closable: true,
            closeAction: 'hide',
            modal: true,
            //animateTarget: this,
            width: '80%',
            height: '80%',
            layout: 'border',
            bodyStyle: 'padding: 5px;',
            items: [bankingView]
        });

        bankingWindow.show();
        bankingWindow.restore();
    }

    function loadAccountDetails(partnerData, accountData) {

        if (accountDetailsWindow) {
            accountDetailsWindow.destroy();
            accountDetailsView.destroy();
        }

        accountDetailsView = Ext.create('Ext.form.Panel', {
            region: 'center',
            bodyPadding: 5,

            fieldDefaults: {
                labelAlign: 'right',
                anchor: '100%'
            },

            items: [{
                xtype: 'label',
                text: 'Warning: only one account per type is allowed: changine the type of one that already has an account, will overwrite that old account.'
            }, {
                id: 'type',
                name: 'type',
                xtype: 'combobox',
                fieldLabel: 'Type',
                emptyText: 'destination',
                value: accountData ? accountData.type : 'destination',
                editable: false,
                allowBlank: false,
                store: Ext.create('Ext.data.Store', {
                    fields: ['name', 'value'],
                    data: [
                        {'value': 'destination'},
                        ]
                }),
                queryMode: 'local',
                displayField: 'value',
                valueField: 'value'
            }, {
                id: 'nameOnAccount',
                xtype: 'textfield',
                name: 'nameOnAccount',
                value: accountData ? accountData.nameOnAccount : '',
                fieldLabel: 'Name on account',
                allowBlank: false
            }, {
                id: 'address',
                xtype: 'textfield',
                name: 'address',
                value: accountData ? accountData.address : '',
                fieldLabel: 'Address',
                allowBlank: false
            }, {
                id: 'bank',
                xtype: 'textfield',
                name: 'bank',
                value: accountData ? accountData.bank : '',
                fieldLabel: 'Bank',
                allowBlank: false
            }, {
                id: 'bankAddress',
                xtype: 'textfield',
                name: 'bankAddress',
                value: accountData ? accountData.bankAddress : '',
                fieldLabel: 'Bank Address',
                allowBlank: false
            }, {
                id: 'account',
                xtype: 'textfield',
                name: 'account',
                value: accountData ? accountData.account : '',
                fieldLabel: 'Account',
                allowBlank: false
            }, {
                id: 'swift',
                xtype: 'textfield',
                name: 'swift',
                value: accountData ? accountData.swift : '',
                fieldLabel: 'Swift',
                allowBlank: false
            }, {
                id: 'iban',
                xtype: 'textfield',
                name: 'iban',
                value: accountData ? accountData.iban : '',
                fieldLabel: 'Iban',
                allowBlank: false
            }],

            buttons: [{
                text: 'Save',
                handler: function() {
                    var formData = this.up('form').getForm();

                    if (formData.isValid()) {
                        formData.submit({
                            headers: {'Connection': 'close' },
                            url: '/json/partner/' + partnerData.id + '/banking/account/update',
                            waitMsg: 'Sending Bank account informations',

                            success: function(fp, opts) {
                                var resp = JSON.parse(opts.response.responseText);
                                console.log(resp)
                                if (resp.success) {
                                    bankingStore.removeAll();
                                    bankingStore.load();
                                    bankingStore.load();
                                    accountDetailsWindow.hide();
                                    accountDetailsWindow.destroy();
                                } else {
                                    Ext.MessageBox.alert('Error', 'Error in account edit.<br/>' + (resp.message ? resp.message : resp.error.type));
                                }
                            },
                            failure: function(formData, opts) {
                                var resp = JSON.parse(opts.response.responseText);
                                Ext.MessageBox.alert('Error', 'Error in account edit<br/>' + (resp.message ? resp.message : resp.error.type));
                            }
                        });
                    }
                }
            }, {
                text: 'Cancel',
                handler: function() {
                    accountDetailsWindow.hide();
                    accountDetailsWindow.destroy();
                }
            }]
        });



        accountDetailsWindow = Ext.create('widget.window', {
            title: 'Bank account of ' + partnerData.name,
            closable: true,
            closeAction: 'hide',
            modal: true,
            //animateTarget: this,
            width: '80%',
            height: '80%',
            layout: 'border',
            bodyStyle: 'padding: 5px;',
            items: [accountDetailsView]
        });

        accountDetailsWindow.show();
        accountDetailsWindow.restore();
    }

