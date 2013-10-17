
var creationFormWindow;
var creationFormForm;

function showPartnerCreationForm(store) {

    if (creationFormWindow) {
        creationFormForm.destroy();
        creationFormWindow.destroy();
    }

    creationFormForm = Ext.create('Ext.form.Panel', {
        bodyPadding: 5,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 90,
            anchor: '100%'
        },

        items: [{
            id: 'name',
            xtype: 'textfield',
            name: 'name',
            fieldLabel: 'Name'
        }, {
            id: 'email',
            xtype: 'textfield',
            name: 'email',
            fieldLabel: 'Email'
        }],

        buttons: [{
            text: 'Create Partner',
            handler: function() {

                /*record.raw.name = record.data.name;
                record.raw.email = record.data.email;
                var form = this.up('form').getForm();
                var assetsCount = selection.length;*/
                var form = this.up('form').getForm();

                form.submit({
                    url: '/json/partner/create',
                    waitMsg: 'Sending request...',
                    success: function(form, opts) {
                        var resp = JSON.parse(opts.response.responseText);
                        if (resp.success) {
                            creationFormWindow.hide();
                            Ext.MessageBox.alert('', 'Partner created successfully.');
                            store.reload();
                        } else {
                            console.log(resp);
                            console.log(opts)
                            Ext.MessageBox.alert('Error', 'Error during partner creation.<br/>' + (resp.message ? resp.message : resp.error.type));
                        }
                    },
                    failure: function(form, opts) {
                        var resp = JSON.parse(opts.response.responseText);
                        Ext.MessageBox.alert('Error', 'Error during partner creation.<br/>' + (resp.message ? resp.message : resp.error.type));
                    }
                });
            }
        }, {
            text: 'Cancel',
            handler: function() {
                creationFormWindow.hide();
            }
        }]
    });

    creationFormWindow = Ext.create('widget.window', {
        title: 'Create A New Partner',
        closable: true,
        closeAction: 'hide',
        modal: true,
        width: '80%',
        layout: 'fit',
        bodyStyle: 'padding: 5px;',
        items: [creationFormForm]
    });


    if (creationFormWindow.isVisible()) {
        creationFormWindow.hide();
    } else {
        creationFormWindow.show();
        creationFormWindow.restore();
    }
}


