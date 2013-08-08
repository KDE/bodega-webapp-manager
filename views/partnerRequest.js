
var partnerDetailsWindow;
var partnerDetailsForm;

function loadPartnerRequest(partnerId, partnerName, question) {

    if (partnerDetailsWindow) {
        partnerDetailsWindow.destroy();
    }

    partnerDetailsForm = Ext.create('Ext.form.Panel', {
        bodyPadding: 5,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 90,
            anchor: '100%'
        },

        items: [{
            id: 'partner',
            xtype: 'hidden',
            name: 'partner',
            value: partnerId
        }, {
            id: 'reason',
            xtype: 'textfield',
            name: 'reason',
            fieldLabel: 'Reason'
        }],

        buttons: [{
            text: 'Request',
            handler: function() {

                var form = this.up('form').getForm();
                if (form.isValid()) {
                    if (question === 'publisher') {
                        form.submit({
                            url: '/json/partner/request/publisher/' + partnerId,
                            waitMsg: 'Sending request...',
                            success: function(fp, o) {
                                partnerDetailsWindow.hide();
                            },
                            failure: function(form, action) {
                                partnerDetailsWindow.hide();
                            }
                        });
                    //distributor
                    } else {
                        form.submit({
                            url: '/json/partner/request/distributor/' + partnerId,
                            waitMsg: 'Sending request...',
                            success: function(fp, o) {
                                partnerDetailsWindow.hide();
                            },
                            failure: function(form, action) {
                                partnerDetailsWindow.hide();
                            }
                        });
                    }
                }
            }
        }, {
            text: 'Cancel',
            handler: function() {
                partnerDetailsWindow.hide();
            }
        }]
    });

    partnerDetailsWindow = Ext.create('widget.window', {
        title: 'Request ' + question +' status for Partner ' + partnerName,
        closable: true,
        closeAction: 'hide',
        modal: true,
        width: '80%',
        layout: 'fit',
        bodyStyle: 'padding: 5px;',
        items: [partnerDetailsForm]
    });


    if (partnerDetailsWindow.isVisible()) {
        partnerDetailsWindow.hide();
    } else {
        partnerDetailsWindow.show();
        partnerDetailsWindow.restore();
    }
}


