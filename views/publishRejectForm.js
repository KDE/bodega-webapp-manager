
var rejectFormWindow;
var rejectFormForm;

function showRejectForm(selection, store) {

    if (rejectFormWindow) {
        rejectFormWindow.destroy();
    }

    rejectFormForm = Ext.create('Ext.form.Panel', {
        bodyPadding: 5,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 90,
            anchor: '100%'
        },

        items: [{
            id: 'reason',
            xtype: 'textfield',
            name: 'reason',
            fieldLabel: 'Reason'
        }],

        buttons: [{
            text: 'Reject',
            handler: function() {

                var form = this.up('form').getForm();
                var assetsCount = selection.length;

                Ext.each(selection, function (item) {
                    form.submit({
                        url: '/json/asset/publish/' + item.data.id + '?reject=true',
                        waitMsg: 'Sending request...',
                        success: function(fp, o) {
                            --assetsCount;
                            if (assetsCount == 0) {
                                rejectFormWindow.hide();
                                Ext.MessageBox.alert('', 'Assets rejected successfully.');
                                store.load();
                            }
                        },
                        failure: function(form, action) {
                            --assetsCount;
                            rejectFormWindow.hide();
                            Ext.MessageBox.alert('Error', 'Error in sending the rejection notice.');
                            store.load();
                        }
                    });
                });
            }
        }, {
            text: 'Cancel',
            handler: function() {
                rejectFormWindow.hide();
            }
        }]
    });

    rejectFormWindow = Ext.create('widget.window', {
        title: 'Reject',
        closable: true,
        closeAction: 'hide',
        modal: true,
        width: '80%',
        layout: 'fit',
        bodyStyle: 'padding: 5px;',
        items: [rejectFormForm]
    });


    if (rejectFormWindow.isVisible()) {
        rejectFormWindow.hide();
    } else {
        rejectFormWindow.show();
        rejectFormWindow.restore();
    }
}


