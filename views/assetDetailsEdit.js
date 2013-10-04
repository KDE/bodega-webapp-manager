
var assetDetailsWindow;
var assetDetailsForm;
var currentAsset;

function loadAssetDetails(assetData, remoteUrl) {
    currentAsset = assetData.id;
    var lastImageField = 0;

    function addImageField() {

        var form = Ext.create('Ext.form.field.File', {
            xtype: 'filefield',
            id: 'file-' + lastImageField,
            name: 'file-' + lastImageField,
            numericalId: lastImageField,
            fieldLabel: 'Image:',
            listeners: {
                change: function( parent, value, eOpts ) {
                    addImageField();
                },
                afterrender: function(el) {
                    var element = el.fileInputEl;

                    document.getElementById('file-'+el.numericalId+'-button-fileInputEl').addEventListener('change', function () {
                        var file = this.files[0];
                        if (!file.type) {
                            return;
                        }

                        //HACK: rename the file field on the fly: the actual internal input field and all its wrapping objects
                        el.name = file.name;
                        el.config.name = file.name;
                        element.name = file.name;

                        document.getElementById('file-'+el.numericalId+'-button-fileInputEl').name = file.name;

                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[previews][' + el.numericalId + '][file]',
                            value: file.name
                        });
                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[previews][' + el.numericalId + '][mimetype]',
                            value: file.type
                        });
                    });
                }
            }
        });

        assetDetailsForm.add(form);
        var typeCombo = assetDetailsForm.add({
            xtype: 'combobox',
            id: 'info[previews][' + lastImageField + '][type]',
            name: 'info[previews][' + lastImageField + '][type]',
            displayField: 'value',
            valueField: 'value',
            value: 'screenshot',
            fieldLabel: 'Image type',
            store: Ext.create('Ext.data.Store', {
                fields: ['value'],
                data: [{'value': 'screenshot'},
                    {'value': 'icon'},
                    {'value': 'cover'}],
            }),
            listeners:{
                'select': function() {
                    subTypeCombo.store = previewStoreForType(typeCombo.value);
                    subTypeCombo.store.load();
                    subTypeCombo.reset();
                    subTypeCombo.resetOriginalValue();
                }
            }
        });

        function previewStoreForType(type) {
            if (type === 'screenshot') {
                return Ext.create('Ext.data.Store', {
                    fields: ['value'],
                    data: [{'value': 'screen1'},
                        {'value': 'screen2'}],
                });
            } else if (type === 'icon') {
                return Ext.create('Ext.data.Store', {
                    fields: ['value'],
                    data: [{'value': 'tiny'},
                        {'value': 'small'},
                        {'value': 'medium'},
                        {'value': 'big'},
                        {'value': 'large'},
                        {'value': 'huge'}],
                });
            //Assume "cover"
            } else if (type === 'icon') {
                return Ext.create('Ext.data.Store', {
                    fields: ['value'],
                    data: [{'value': 'front'},
                        {'value': 'back'}],
                });
            }
        }

        var subTypeCombo = assetDetailsForm.add({
            xtype: 'combobox',
            id: 'info[previews][' + lastImageField + '][subtype]',
            name: 'info[previews][' + lastImageField + '][subtype]',
            displayField: 'value',
            valueField: 'value',
            value: 'screen1',
            fieldLabel: 'Image subtype',
            store: previewStoreForType(typeCombo.value),
        });
        assetDetailsForm.doLayout();
        ++lastImageField;
    }

    if (assetDetailsWindow) {
        assetDetailsWindow.destroy();
        assetDetailsForm.destroy();
    }

    assetDetailsForm = Ext.create('Ext.form.Panel', {
        //frame: true,
        bodyPadding: 5,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 90,
            anchor: '100%'
        },

        overflowY: 'auto',

        items: [
            Ext.create('Ext.view.View', {
                store: Ext.create('Ext.data.Store', {
                    autoLoad: true,
                    storeId: 'typeStore',
                    fields:['path', 'type', 'subtype'],
                    proxy: {
                        type: 'ajax',
                        url: '/json/asset/' + currentAsset + '?previews=true' + (assetData.status != 'published' ? '&incoming=true' : ''),
                        reader: {
                            type: 'json',
                            root: 'asset.previews'
                        }
                    }
                }),
                margin: 4,
                colspan: 2,
                tpl: [
                    '<tpl for=".">',
                        '<div class="thumb-wrap">',
                        '<div class="thumb"><img src="{url}" title="{path}" width="64" height="64" style="margin:auto;display:block"/></div>',
                        '<span class="x-editable">{type} - {subtype}</span></div>',
                    '</tpl>',
                    '<div class="x-clear"></div>'
                ],
                multiSelect: false,
                trackOver: false,

                prepareData: function(data) {
                    console.log(data)

                    if (assetData.status != 'published') {
                        data.url = '/json/incomingassetpreview/' + assetData.id + '/' +  encodeURIComponent(data.path);
                    } else {
                        if (data.type == 'icon') {
                            var size;
                            if (data.subtype == 'huge') {
                                size = '512';
                            } else if (data.subtype == 'large') {
                                size = '256';
                            } else if (data.subtype == 'big') {
                                size = '128';
                            } else if (data.subtype == 'medium') {
                                size = '64';
                            } else if (data.subtype == 'small') {
                                size = '32';
                            } else if (data.subtype == 'tiny') {
                                size = '22';
                            } 
                            data.url = remoteUrl + '/icons/' + size + '/' + data.path;
                        } else {
                            data.url = remoteUrl + '/previews/' + data.path;
                        }
                    }
                    return data;
                }
            }), {
            id: 'name',
            xtype: 'textfield',
            name: 'info[name]',
            fieldLabel: 'Name',
            value: assetData.name
        }, {
            id: 'license',
            xtype: 'combobox',
            name: 'info[license]',
            fieldLabel: 'License',
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'value',
            value: String(assetData.license),
            store: Ext.create('Ext.data.Store', {
                fields: ['name', 'value'],
                data: [{'name': 'GPL', 'value': '1'},
                    {'name': 'LGPL', 'value': '2'},
                    {'name': 'BSD', 'value': '3'},
                    {'name': 'Creative Commons Attribution', 'value': '4'},
                    {'name': 'Creative Commons Attribution-ShareAlike', 'value': '5'},
                    {'name': 'Creative Commons Attribution-NoDerivs', 'value': '6'},
                    {'name': 'Creative Commons Attribution-NonCommercial', 'value': '7'},
                    {'name': 'Creative Commons Attribution-NonCommercial-ShareAlike', 'value': '8'},
                    {'name': 'Creative Commons Attribution-NonCommercial-NoDerivs', 'value': '9'},
                    {'name': 'Proprietary', 'value': '10'}],
            })
        }, {
            id: 'version',
            xtype: 'textfield',
            name: 'info[version]',
            fieldLabel: 'Version',
            value: assetData.version
        }, {
            id: 'asset',
            xtype: 'filefield',
            name: 'asset',
            fieldLabel: 'File',
            listeners: {
                afterrender: function(el) {
                    //It doesn't work if el.fileInputEl is used
                    //var element = el.fileInputEl;

                    document.getElementById('asset-button-fileInputEl').addEventListener('change', function () {
                        var file = this.files[0];
                        if (!file.size) {
                            return;
                        }

                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[file]',
                            value: file.name
                        });
                        assetDetailsForm.add({
                            xtype: 'hidden',
                            name: 'info[size]',
                            value: file.size
                        });
                    });
                }
            }
        }, {
            xtype: 'label',
            html: '<a href="/json/asset/download/' + assetData.id + '" style="margin-left:8em">' + assetData.file + '</a>'
        }, {
            id: 'description',
            xtype: 'textareafield',
            name: 'info[description]',
            fieldLabel: 'Description',
            value: assetData.description
        }, {
            id: 'baseprice',
            xtype: 'numberfield',
            name: 'info[baseprice]',
            fieldLabel: 'Base Price',
            value: assetData.baseprice,
            minValue: 0
        }, {
            id: 'active',
            xtype: 'checkboxfield',
            name: 'info[active]',
            fieldLabel: 'Active',
            value: assetData.active
        }, {
            id: 'posted',
            xtype: 'hidden',
            name: 'info[posted]',
            value: false
        }, {
            id: 'id',
            xtype: 'hidden',
            name: 'info[id]',
            value: assetData.id
        }, {
            id: 'id',
            xtype: 'hidden',
            name: 'info[partner]',
            value: assetData.partner
        }],

        buttons: [{
            text: 'Save',
            handler: function() {

                var form = this.up('form').getForm();
                if (form.isValid()) {
                    //disable the last file field, since is empty and with invalid data
                    assetDetailsForm.items.get('file-' + (lastImageField-1)).disable();
                    assetDetailsForm.items.get('info[previews][' + (lastImageField-1) + '][type]').disable();
                    assetDetailsForm.items.get('info[previews][' + (lastImageField-1) + '][subtype]').disable();

                    //disable the asset file if empty
                    var uploadAssetField = assetDetailsForm.items.get('asset');
                    if (!uploadAssetField.value) {
                        uploadAssetField.disable();
                    }

                    form.submit({
                        url: '/json/asset/update/' + currentAsset,
                        waitMsg: 'Updating the asset...',
                        //params: $.param({info: data}),
                        success: function(fp, o) {
                            store.removeAll();
                            store.load();
                            assetDetailsWindow.hide();
                            Ext.MessageBox.alert('', 'Asset successfully updated.');
                        },
                        failure: function(form, action) {
                            var resp = JSON.parse(action.response.responseText);
                            assetDetailsWindow.hide();
                            Ext.MessageBox.alert('Error', 'Error in sending the asset.<br/>'+resp.message);
                        }
                    });
                }
            }
        },{
            text: 'Cancel',
            handler: function() {
                assetDetailsWindow.hide();
            }
        }]
    });
    addImageField();


    assetDetailsWindow = Ext.create('widget.window', {
        title: 'Details of Assets ' + assetData.name,
        closable: true,
        closeAction: 'hide',
        modal: true,
        width: '80%',
        height: '80%',
        layout: 'fit',
        bodyStyle: 'padding: 0;',
        items: [assetDetailsForm]
    });


    if (assetDetailsWindow.isVisible()) {
        assetDetailsWindow.hide();
    } else {
        assetDetailsWindow.show();
        assetDetailsWindow.restore();
    }
}


