
var tosWindow;
var tosView;

function showTermsOfService(cb, partnerId, partnerName, type) {
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
                
                loader: {
                    url: '/html/TermsOfService.html',
                    autoLoad: true
                }
            }],

            buttons: [{
                id: 'acceptBox',
                xtype: 'checkbox',
                boxLabel: 'I agree to the terms of service',
                handler: function () {
                    Ext.getCmp('acceptButton').setDisabled(!Ext.getCmp('acceptBox').getValue());
                }
            }, {
                id: 'acceptButton',
                text: 'Accept',
                disabled: true,
                handler: function() {
                    tosWindow.hide();
                    cb(partnerId, partnerName, type);
                }
            }, {
                id: 'rejectButton',
                text: 'Reject',
                handler: function() {
                    tosWindow.hide();
                }
            }]
        });

        tosWindow = Ext.create('widget.window', {
            title: 'Terms of service',
            closable: false,
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