
var tosWindow;
var tosView;

function showTermsOfService(remoteUrl, partnerId, partnerName, type, cb) {
    if (!tosWindow) {
        tosView = Ext.create('Ext.form.Panel', {
            bodyPadding: 5,
            overflowY: 'auto',

            fieldDefaults: {
                labelAlign: 'right',
                labelWidth: 90,
                anchor: '100%'
            },

            items: [ {
                xtype: 'label',

                style: {
                    cursor: 'auto'
                },

                loader: {
                    type: 'jsonp',
                    url: remoteUrl + '/TOS/participant.html',
                    autoLoad: true
                }
            }],

            buttons: [{
                id: 'acceptBox',
                hidden: !cb,
                xtype: 'checkbox',
                boxLabel: 'I agree to the terms of service',
                handler: function () {
                    Ext.getCmp('acceptButton').setDisabled(!Ext.getCmp('acceptBox').getValue());
                }
            }, {
                id: 'acceptButton',
                hidden: !cb,
                text: 'Accept',
                disabled: true,
                handler: function() {
                    tosWindow.hide();
                    cb(partnerId, partnerName, type);
                }
            }, {
                id: 'rejectButton',
                hidden: !cb,
                text: 'Reject',
                handler: function() {
                    tosWindow.hide();
                }
            }]
        });

        tosWindow = Ext.create('widget.window', {
            title: 'Terms of service',
            closable: !cb,
            modal: true,
            //animateTarget: this,
            width: '80%',
            height: '80%',
            layout: 'fit',
            bodyStyle: 'padding: 5px;',
            items: [tosView]
        });
    }

    tosWindow.show();
    tosWindow.restore();
}
