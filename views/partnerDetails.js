
var partnerDetailsWindow;
var partnerDetailsForm;
var currentPartner;

function loadPartnerDetails(partnerData) {
    currentPartner = partnerData.id;
    
    if (!partnerDetailsWindow) {
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
                value: currentPartner
            }, {
                id: 'publisherReason',
                xtype: 'textfield',
                name: 'information',
                fieldLabel: 'Reason'
            }],

            buttons: [{
                text: 'Request Publisher status',
                handler: function() {

                    var form = this.up('form').getForm();
                    if (form.isValid()) {
                        form.submit({
                            url: '/json/partner/request/publisher/' + currentPartner,
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
            }, {
                text: 'Request Distributor status',
                handler: function() {

                    var form = this.up('form').getForm();
                    if (form.isValid()) {
                        form.submit({
                            url: '/json/partner/request/distributor/' + currentPartner,
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
            }, {
                text: 'Cancel',
                handler: function() {
                    partnerDetailsWindow.hide();
                }
            }]
        });

        partnerDetailsWindow = Ext.create('widget.window', {
            title: 'Details of Partner ' + partnerData.name,
            closable: true,
            closeAction: 'hide',
            modal: true,
            width: '80%',
            layout: 'fit',
            bodyStyle: 'padding: 5px;',
            items: [partnerDetailsForm]
        });
    }

    if (partnerDetailsWindow.isVisible()) {
        partnerDetailsWindow.hide(this, function() {
            button.dom.disabled = false;
        });
    } else {
        partnerDetailsWindow.show(this, function() {
            button.dom.disabled = false;
        });
    }
}


