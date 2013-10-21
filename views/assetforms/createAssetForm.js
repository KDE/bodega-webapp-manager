
var assetDetailsForm;
var assetDetailsWindow;

function createToolBar() {
    return {
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'button',
            text: 'Single Asset',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/single";
            }
        }, {
            xtype: 'button',
            text: 'App from OBS',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/obs";
            }
        }, {
            xtype: 'button',
            text: 'Mass create',
            scope: this,
            handler: function() {
                window.location.href = "/asset/create/mass";
            }
        }]
    }
}

function createAssetWindow(extraFields, assetType, assetData, remoteUrl) {

    if (assetDetailsWindow) {
        assetDetailsWindow.destroy();
        assetDetailsForm.destroy();
    }

    assetDetailsWindow = Ext.create('widget.window', {
        title: 'Details of Assets ' + assetData.name,
        closable: true,
        closeAction: 'hide',
        modal: true,
        width: '80%',
        height: '80%',
        layout: 'fit',
        bodyStyle: 'padding: 0;',
        items: []
    });
    assetDetailsWindow.items.add(createAssetForm(extraFields, assetType, assetData, remoteUrl))

    assetDetailsWindow.show();
    assetDetailsWindow.restore();
}

function createPanel(extraFields, title, assetType, assetData, remoteUrl) {
    return Ext.create('Ext.Panel', {
        collapsible: false,
        title: title,
        region: 'center',
        overflowY: 'auto',
        dockedItems: [createToolBar()],
        items: [createAssetForm(extraFields, assetType, assetData, remoteUrl)]
    });
}

function createAssetForm(extraFields, assetType, assetData, remoteUrl) {
    var lastImageField = 1;
    var lastTagIndex = 1;

    var tagsByType = {};
    if (assetData && assetData.tags) {
        for (var i = 0; i < assetData.tags.length; ++i) {
            if (tagsByType[assetData.tags[i].type]) {
                tagsByType[assetData.tags[i].type].push(assetData.tags[i].title);
            } else {
                tagsByType[assetData.tags[i].type] = [assetData.tags[i].title];
            }
        }
    }

    var imagesByType = {};

    var licenseStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'licenseStore',
        fields: ['id', 'name'],
        proxy: {
            type: 'ajax',
            url: '/json/asset/types/application/licenses',
            reader: {
                type: 'json',
                root: 'licenses'
            }
        }
    });

    var ratingStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'ratingStore',
        fields:['type', 'title'],
        proxy: {
            type: 'ajax',
            url: '/json/tag/list/contentrating',
            reader: {
                type: 'json',
                root: 'tags'
            }
        }
    });

    var partnerStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'typeStore',
        fields:['id', 'name'],
        proxy: {
            type: 'ajax',
            url: '/json/partner/list',
            reader: {
                type: 'json',
                root: 'partners'
            }
        },
        listeners: {
            load: function ( store, records, successful, eOpts ) {
                if (!assetData || assetData.partner === undefined) {
                    currentPartner = records[0].internalId;
                    partnerStore.combo.setValue(currentPartner);
                }
            }
        }
    });

    var typeStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'typeStore',
        fields:['id', 'type', 'title'],
        proxy: {
            type: 'ajax',
            url: '/json/tag/list/assetType',
            reader: {
                type: 'json',
                root: 'tags'
            }
        }
    });

    function imageUrl(path, type, subtype) {

        if (assetData.status != 'published') {
            return '/json/incomingassetpreview/' + assetData.id + '/' +  encodeURIComponent(path);
        } else {
            if (type == 'icon') {
                var size;
                if (subtype == 'huge') {
                    size = '512';
                } else if (subtype == 'large') {
                    size = '256';
                } else if (subtype == 'big') {
                    size = '128';
                } else if (subtype == 'medium') {
                    size = '64';
                } else if (subtype == 'small') {
                    size = '32';
                } else if (subtype == 'tiny') {
                    size = '22';
                } 
                return remoteUrl + '/icons/' + size + '/' + path;
            } else {
                return remoteUrl + '/previews/' + path;
            }
        }
    }

    var previewsStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'typeStore',
        fields:['path', 'type', 'subtype'],
        proxy: {
            type: 'ajax',
            url: assetData ? '/json/asset/' + assetData.id + '?previews=true' + (assetData.status != 'published' ? '&incoming=true' : '') : '',
            reader: {
                type: 'json',
                root: 'asset.previews'
            }
        },
        listeners: {
            load: function ( store, records, successful, eOpts ) {
                var imageFields = Ext.getCmp('imageSpecificFields');
                for (var i in records) {
                    if (imageFields.items.items.length > 0) {
                        imagesByType[records[i].data.type+'-'+records[i].data.subtype] = records[i].data.path;
                        var thumbnailElement =  imageFields.items.get('thumbnail-'+records[i].data.type+'-'+records[i].data.subtype);

                        if (thumbnailElement) {
                            thumbnailElement.update(
                                'Current image: <a href="'+imageUrl(records[i].data.path, records[i].data.type, records[i].data.subtype)+'" target="_blank"><img src="'+imageUrl(records[i].data.path, records[i].data.type, records[i].data.subtype)+'" title="'+records[i].data.path+'" width="64" height="64" /></a>'
                             );
                        }
                    }
                }
            }
        }
    })

    var relatedStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'relatedStore',
        fields:['name', 'multi', 'required', 'tags', 'type'],
        proxy: {
            type: 'ajax',
            reader: {
                type: 'json',
                //root: 'tags'
            }
        },
        listeners: {
            load: function ( store, records, successful, eOpts ) {

                var fields = Ext.getCmp('typeSpecificFields');
                var assetTypeCombo = Ext.getCmp('assetTypeCombo');
               // var newType = records[0].data.title;

                var record;

                //tags we'll have to add, all current tags - those in the form fields
                var extraTags = [];
                if (assetData) {
                    extraTags= assetData.tags;
                }

                var fieldsData = records[0].data.tags;
                for (var i in fieldsData) {
                    record = fieldsData[i];
                    fields.add([{
                            id: record.type + 'TagFields',
                            xtype:'fieldset',
                            collapsible: false,
                            defaultType: 'textfield',
                            layout: 'anchor',
                            border: 0,
                            padding: 0,
                            fieldRecord: record,
                            addItem: function(isFirst) {
                                var fields = Ext.getCmp(record.type + 'TagFields');
                                this.add([
                                    {
                                        xtype: 'hidden',
                                        name: 'info[tags][' + lastTagIndex + '][type]',
                                        value: this.fieldRecord.type
                                    }, {
                                        xtype: this.fieldRecord.tags === undefined ? 'textfield' : 'combobox',
                                        name: 'info[tags][' + lastTagIndex + '][title]',
                                        value: tagsByType[this.fieldRecord.type] ? tagsByType[this.fieldRecord.type][0] : '',
                                        fieldLabel: this.fieldRecord.name,
                                        displayField: 'title',
                                        editable: this.fieldRecord.tags === undefined,
                                        valueField: 'title',
                                        generateClone: this.fieldRecord.multi,
                                        store: Ext.create('Ext.data.Store', {
                                            autoLoad: true,
                                            storeId:'tagStore',
                                            fields:['type', 'title'],
                                            data: this.fieldRecord,
                                            proxy: {
                                                type: 'memory',
                                                reader: {
                                                    type: 'json',
                                                    root: 'tags'
                                                }
                                            }
                                        }),
                                        allowBlank: !this.fieldRecord.required || !isFirst,
                                        listeners: {
                                            change: function( parent, value, eOpts ) {
                                                if (!this.generateClone) {
                                                    return;
                                                }
                                                var fields = this.up('fieldset');
                                                fields.addItem(false);
                                                this.generateClone = false;
                                            }
                                        }
                                    }
                                ]);
                                ++lastTagIndex;
                            },
                            defaults: {
                                anchor: '100%'
                            },
                            items :[]
                        }
                    ]);
                    var tagFields = Ext.getCmp(record.type + 'TagFields');
                    tagFields.addItem(true);

                    extraTags = extraTags.filter(function(el) { return el.type != record.type});
                }

                //Now, add hidden fields for all extra tags added by hand
                for (var i in extraTags) {
                    var fields = Ext.getCmp(record.type + 'TagFields');
                    fields.add([{
                            xtype: 'hidden',
                            name: 'info[tags][' + lastTagIndex + '][type]',
                            value: extraTags[i].type
                        }, {
                            xtype: 'hidden',
                            name: 'info[tags][' + lastTagIndex + '][title]',
                            value: extraTags[i].title
                        }]);
                    ++lastTagIndex;
                }
            }
        }
    });

    var imagesForAssetStore = Ext.create('Ext.data.Store', {
        autoLoad: true,
        storeId: 'imagesForAssetStore',
        fields:['type', 'subtype', 'name', 'props'],
        proxy: {
            type: 'ajax',
            reader: {
                type: 'json',
                root: 'images'
            }
        },
        listeners: {
            load: function ( store, records, successful, eOpts ) {
                var record;
                for (i in records) {
                    record = records[i];
                    createImageField(record.data)
                }
            }
        }
    });

    function createImageField(record) {
        var form = Ext.create('Ext.form.field.File', {
            xtype: 'filefield',
            id: 'file-' + lastImageField,
            name: 'file-' + lastImageField,
            numericalId: lastImageField,
            fieldLabel: record.name+':',
            listeners: {
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

                        var fields = Ext.getCmp('imageSpecificFields');

                        document.getElementById('file-'+el.numericalId+'-button-fileInputEl').name = file.name;

                        //get rid of info of old files
                        var previewFileField = Ext.getCmp('preview'+el.numericalId+'FileField');
                        var previewMimeField = Ext.getCmp('preview'+el.numericalId+'MimeField');
                        if (previewFileField) {
                            previewFileField.destroy();
                        }
                        if (previewMimeField) {
                            previewMimeField.destroy();
                        }
                        fields.add({
                            id: 'preview'+el.numericalId+'FileField',
                            xtype: 'hidden',
                            name: 'info[previews][' + el.numericalId + '][file]',
                            value: file.name
                        });
                        fields.add({
                            id: 'preview'+el.numericalId+'MimeField',
                            xtype: 'hidden',
                            name: 'info[previews][' + el.numericalId + '][mimetype]',
                            value: file.type
                        });
                    });
                }
            }
        });

        var fields = Ext.getCmp('imageSpecificFields');


        fields.add({
            xtype: 'label',
            html: '<hr/>'
        });

        if (record.type == 'icon' && record.subtype == 'huge') {
            fields.add({
                xtype: 'label',
                text: 'Smaller icons will be resized and generated from the "huge" one, you can always replace them in any moment.'
            });
        }
        fields.add(form);
        fields.add({
            xtype: 'hidden',
            id: 'info[previews][' + lastImageField + '][type]',
            name: 'info[previews][' + lastImageField + '][type]',
            value: record.type,
        });

        fields.add({
            xtype: 'hidden',
            id: 'info[previews][' + lastImageField + '][subtype]',
            name: 'info[previews][' + lastImageField + '][subtype]',
            value: record.subtype
        });

        fields.add({
            xtype: 'label',
            html: (record.props.sizes.min.w == record.props.sizes.max.w &&
                   record.props.sizes.min.h == record.props.sizes.max.h
            )
            ? '<p style="margin-left:7em">Required size: '+record.props.sizes.min.w+'x'+record.props.sizes.min.h+'</p>'
            :  '<p style="margin-left:7em">Minimum size: '+record.props.sizes.min.w+'x'+record.props.sizes.min.h+'. Maximum size: '+record.props.sizes.max.w+'x'+record.props.sizes.max.h+'</p>'
        });

        fields.add({
            id: 'thumbnail-'+record.type+'-'+record.subtype,
            xtype: 'label',
            html: imagesByType[record.type+'-'+record.subtype] !== undefined 
             ? 'Current image: <a href="'+imageUrl(imagesByType[record.type+'-'+record.subtype], record.type, record.subtype)+'" target="_blank"><img src="'+imageUrl(imagesByType[record.type+'-'+record.subtype], record.type, record.subtype)+'" title="'+imagesByType[record.type+'-'+record.subtype]+'" width="64" height="64" /></a>'
             : '',
        });

        fields.doLayout();
        ++lastImageField;
    }

    console.log(assetData)

    if (assetDetailsForm) {
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

        items: [{
            id: 'assetTypeCombo',
            xtype: 'combobox',
            name: 'info[tags][0][title]',
            fieldLabel: 'Type',
            displayField: 'title',
            valueField: 'title',
            store: typeStore,
            editable: false,
            allowBlank: false,
            listeners: {
                'select': function (combo, records, eOpts) {
                    var fields = Ext.getCmp('typeSpecificFields');

                    //get rid of old fields
                    for (var i = fields.items.items.length -1; i >=0; --i) {
                        fields.items.items[i].destroy();
                    }
                    var imageFields = Ext.getCmp('imageSpecificFields');

                    //get rid of old fields
                    for (var i = imageFields.items.items.length -1; i >=0; --i) {
                        imageFields.items.items[i].destroy();
                    }
                    lastImageField = 1;
                    lastTagIndex = 1;

                    relatedStore.proxy.url = '/json/asset/types/' + records[0].data.title + '/tags';
                    relatedStore.reload();

                    licenseStore.proxy.url =  '/json/asset/types/' + records[0].data.title + '/licenses';
                    licenseStore.reload();

                    imagesForAssetStore.proxy.url = '/json/asset/types/' + records[0].data.title + '/images';
                    imagesForAssetStore.reload();
                }
            }
        }, {
            xtype: 'combobox',
            fieldLabel: 'Partner',
            name: 'info[partner]',
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            width: 120,
            value: (assetData && assetData.partner !== undefined) ? assetData.partner : '',
            store: partnerStore,
            listeners: {
                'select': function(combo, record, index) {
                    currentPartner = combo.getValue();
                },
                afterrender: function (combo, eopts) {
                    partnerStore.combo = combo;
                }
            }
        }, {
            id: 'name',
            xtype: 'textfield',
            name: 'info[name]',
            fieldLabel: 'Name',
            value: assetData ? assetData.name : '',
            allowBlank: false
        }, {
            id: 'license',
            xtype: 'combobox',
            name: 'info[license]',
            fieldLabel: 'License',
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            value: assetData ? assetData.license : '',
            store: licenseStore,
            allowBlank: false
        }, {
            id: 'version',
            xtype: 'textfield',
            name: 'info[version]',
            fieldLabel: 'Version',
            value: assetData ? String(assetData.version) : '1.0',
            allowBlank: false
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

                        //get rid of info of old files
                        var assetFileName = Ext.getCmp('assetFileName');
                        var assetFileSize = Ext.getCmp('assetFileSize');
                        if (assetFileName) {
                            assetFileName.destroy();
                        }
                        if (assetFileSize) {
                            assetFileSize.destroy();
                        }
                        assetDetailsForm.add({
                            id: 'assetFileName',
                            xtype: 'hidden',
                            name: 'info[file]',
                            value: file.name
                        });
                        assetDetailsForm.add({
                            id: 'assetFileSize',
                            xtype: 'hidden',
                            name: 'info[size]',
                            value: file.size
                        });

                        //get rid of tag type of old files
                        var tagTypeField = Ext.getCmp('assetFileMimeTypeTagType');
                        var tagTitleField = Ext.getCmp('assetFileMimeTypeTagTitle');
                        if (tagTypeField) {
                            tagTypeField.destroy();
                        }
                        if (tagTitleField) {
                            tagTitleField.destroy();
                        }

                        if (file.type == 'image/png' || file.type == 'image/jpeg') {
                            assetDetailsForm.add({
                                id: 'assetFileMimeTypeTagType',
                                xtype: 'hidden',
                                name: 'info[tags][' + lastTagIndex + '][type]',
                                value: 'mimetype'
                            });
                            ++lastTagIndex;
                            assetDetailsForm.add({
                                id: 'assetFileMimeTypeTagTitle',
                                xtype: 'hidden',
                                name: 'info[tags][' + lastTagIndex + '][title]',
                                value: file.type
                            });
                            ++lastTagIndex;
                        }
                    });
                }
            },
            allowBlank: assetData ? true : false
        }, {
            xtype: 'label',
            hidden: assetData === undefined,
            html: assetData ? '<p style="margin-left:8em">Current file: <a href="/json/asset/download/' + assetData.id + '">' + assetData.file + '</a></p>' : ''
        }, {
            id: 'description',
            xtype: 'textareafield',
            name: 'info[description]',
            value: assetData ? assetData.description : '',
            fieldLabel: 'Description',
            allowBlank: false
        }, {
            id: 'baseprice',
            xtype: 'numberfield',
            name: 'info[baseprice]',
            value: assetData ? assetData.baseprice : '',
            fieldLabel: 'Base Price',
            minValue: 0,
            value: 0,
            allowBlank: false
        }, {
            id: 'posted',
            xtype: 'hidden',
            name: 'info[posted]',
            value: false
        }, {
            xtype: 'hidden',
            name: 'info[tags][0][type]',
            value: 'assetType'
        }, {
            id: 'typeSpecificFields',
            xtype:'fieldset',
            collapsible: false,
            defaultType: 'textfield',
            layout: 'anchor',
            border: 0,
            padding: 0,
            defaults: {
                anchor: '100%'
            },
            items :[]
        }, {
            id: 'extraFields',
            xtype:'fieldset',
            collapsible: false,
            defaultType: 'textfield',
            layout: 'anchor',
            border: 0,
            padding: 0,
            defaults: {
                anchor: '100%'
            },
            items :[]
        }, {
            id: 'imageSpecificFields',
            xtype:'fieldset',
            collapsible: false,
            defaultType: 'textfield',
            layout: 'anchor',
            border: 0,
            padding: 0,
            defaults: {
                anchor: '100%'
            },
            items :[]
        }],

        buttons: [{
            text: assetData ? 'Update' : 'Create',
            handler: function() {

                var formData = this.up('form').getForm();

                if (formData.isValid()) {
                    //disable the last file field, since is empty and with invalid data
                    var imgUploadForm;
                    var imageFields = Ext.getCmp('imageSpecificFields');
                    for (var i = 1; i < lastImageField; ++i) {
                        imgUploadForm = imageFields.items.get('file-' + i);

                        if (!imgUploadForm.rawValue) {
                            imgUploadForm.disable();
                            imageFields.items.get('info[previews][' + i + '][type]').disable();
                            imageFields.items.get('info[previews][' + i + '][subtype]').disable();
                        }
                    }

                    //disable the asset file if empty
                    var uploadAssetField = assetDetailsForm.items.get('asset');
                    if (!uploadAssetField.value) {
                        uploadAssetField.disable();
                    }

                    formData.submit({
                        url: assetData ? '/json/asset/update/'+assetData.id : '/json/asset/create',
                        waitMsg: assetData ? 'Updating the asset...' : 'Creating the asset...',
                        //params: $.param({info: data}),
                        success: function(fp, opts) {
                            var resp = JSON.parse(opts.response.responseText);
                            //console.log(resp)
                            if (resp.success) {
                                if (assetDetailsWindow) {
                                    assetDetailsWindow.hide();
                                    assetDetailsWindow.destroy();
                                } else {
                                    window.location.href = "/asset/list/incoming";
                                }
                            } else {
                                Ext.MessageBox.alert('Error', 'Error in uploading the asset.<br/>' + (resp.message ? resp.message : resp.error.type));
                            }
                            for (var i = imageFields.items.items.length -1; i >=0; --i) {
                                imageFields.items.items[i].enable();
                            }
                        },
                        failure: function(formData, opts) {
                            var resp = JSON.parse(opts.response.responseText);
                            Ext.MessageBox.alert('Error', 'Error in uploading the asset.<br/>' + (resp.message ? resp.message : resp.error.type));
                            for (var i = imageFields.items.items.length -1; i >=0; --i) {
                                imageFields.items.items[i].enable();
                            }
                        }
                    });
                }
            }
        }, {
            text: 'Cancel',
            hidden: assetDetailsWindow == null,
            handler: function() {
                assetDetailsWindow.hide();
            }
        }]
    });

    if (assetType) {
        var assetTypeCombo = Ext.getCmp('assetTypeCombo');
        if (assetTypeCombo) {
            assetTypeCombo.select(assetType);
            assetTypeCombo.hidden = true;
            relatedStore.proxy.url = '/json/asset/types/' + assetType + '/tags';
            imagesForAssetStore.proxy.url = '/json/asset/types/' + assetType + '/images';
            licenseStore.proxy.url =  '/json/asset/types/' + assetType + '/licenses';
        }
    }

    var extraFieldsParent = Ext.getCmp('extraFields');
    extraFieldsParent.add(extraFields);

    return assetDetailsForm;
}


