
var creationFormWindow;
var creationFormForm;

function showPartnerCreationForm(store) {

    if (creationFormWindow) {
        creationFormForm.destroy();
        creationFormWindow.destroy();
    }

    function checkCreateButton() {
        Ext.getCmp('createButton').setDisabled(
                !(Ext.getCmp('confirmation').getValue() &&
                  Ext.getCmp('name').getValue().length > 0 &&
                  Ext.getCmp('email').getValue().length > 0
                 )
                );
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
            fieldLabel: 'Name',
            listeners: {
                change: checkCreateButton
            }
        }, {
            id: 'confirmation',
            xtype: 'checkbox',
            name: 'confirmation',
            fieldLabel: ' ',
            labelSeparator: '',
            boxLabel: 'I confirm that I represent the above person or organization.',
            handler: function () {
                checkCreateButton();
            }
        }, {
            id: 'email',
            xtype: 'textfield',
            name: 'email',
            fieldLabel: 'Email',
            listeners: {
                change: checkCreateButton
            }
        }],

        buttons: [{
            id: 'createButton',
            text: 'Create Partner',
            disabled: true,
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
                            //console.log(resp);
                            //console.log(opts)
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


