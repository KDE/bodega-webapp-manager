// A DropZone which cooperates with DragZones whose dragData contains
// a "field" property representing a form Field. Fields may be dropped onto
// grid data cells containing a matching data type.
Ext.define('Ext.ux.dd.AssetCellFieldDropZone', {
    extend: 'Ext.dd.DropZone',

    constructor: function(cfg){
        cfg = cfg || {};
        if (cfg.onCellDrop) {
            this.onCellDrop = cfg.onCellDrop;
        }
        if (cfg.ddGroup) {
            this.ddGroup = cfg.ddGroup;
        }
    },

//  Call the DropZone constructor using the View's scrolling element
//  only after the grid has been rendered.
    init: function(grid) {
        var me = this;

        if (grid.rendered) {
            me.grid = grid;
            grid.getView().on({
                render: function(v) {
                    me.view = v;
                    Ext.ux.dd.AssetCellFieldDropZone.superclass.constructor.call(me, me.view.el);
                },
                single: true
            });
        } else {
            grid.on('render', me.init, me, {single: true});
        }
    },

//  Scroll the main configured Element when we drag close to the edge
    containerScroll: true,

    getTargetFromEvent: function(e) {
        var me = this,
            v = me.view;

//      Ascertain whether the mousemove is within a grid cell
        var cell = e.getTarget(v.getCellSelector());
        if (cell) {

//          We *are* within a grid cell, so ask the View exactly which one,
//          Extract data from the Model to create a target object for
//          processing in subsequent onNodeXXXX methods. Note that the target does
//          not have to be a DOM element. It can be whatever the noNodeXXX methods are
//          programmed to expect.
            var row = v.findItemByChild(cell),
                columnIndex = cell.cellIndex;

            if (row && Ext.isDefined(columnIndex)) {
                return {
                    node: cell,
                    record: v.getRecord(row),
                    fieldName: me.grid.columns[columnIndex].dataIndex
                };
            }
        }
    },

//  On Node enter, see if it is valid for us to drop the field on that type of column.
    onNodeEnter: function(target, dd, e, dragData) {
        delete this.dropOK;
        if (!target) {
            return;
        }

        if (!dragData.records[0].data.id) {
            return;
        }

        this.dropOK = true;
        Ext.fly(target.node).addCls('x-drop-target-active');
    },

//  Return the class name to add to the drag proxy. This provides a visual indication
//  of drop allowed or not allowed.
    onNodeOver: function(target, dd, e, dragData) {
        return this.dropOK ? this.dropAllowed : this.dropNotAllowed;
    },

//  highlight the target node.
    onNodeOut: function(target, dd, e, dragData) {
        Ext.fly(target.node).removeCls('x-drop-target-active');
    },

//  Process the drop event if we have previously ascertained that a drop is OK.
    onNodeDrop: function(target, dd, e, dragData) {
        if (this.dropOK) {
            this.onCellDrop(target, dragData);
            return true;
        }
    },

    onCellDrop: Ext.emptyFn
});