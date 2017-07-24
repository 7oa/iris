(function () {

    angular.module('irisFabric').factory('IrisFabricFreeFormElement', function (FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "freeForm";

                this.viewObjectType = null;
                this.viewObjectTypeDefault = "circle";

                this.stateDefault = {
                    viewObject: {
                        fill: "#424242",
                        strokeWidth: 2,
                        stroke: "#93be3d",
                        opacity: 1,
                        visible: true
                    }
                };
            },

            initialize: function (fabricEditor, options) {
                this.callSuper('initialize', fabricEditor, options);
                this.viewObjectType || (this.viewObjectType = this.viewObjectTypeDefault);
            },

            toObject: function(viewObjectRelativeOptions) {
                return angular.extend(this.callSuper('toObject', viewObjectRelativeOptions), {
                    viewObjectType: this.viewObjectType
                });
            },

            createViewObject: function(options) {
                switch(this.viewObjectType) {
                    case "circle":
                        return new FabricLib.Circle(options);
                    case "rect":
                        return new FabricLib.Rect(options);
                    case "triangle":
                        return new FabricLib.Triangle(options);
                }
            },

            refreshState: function() {
                this.callSuper('refreshState');

                if (this.viewObject && this.viewObject.type && (this.viewObject.type !== this.viewObjectType)) {
                    this._changeViewObjectType();
                }
            },

            _changeViewObjectType: function() {
                var that = this,
                    collection = that.attached ? that.fabricEditor : (that.viewObject.group || null);
                if (!collection || !collection.contains(that.viewObject)) return;

                var viewObjectDump = that.viewObject.toObject(),
                    viewObjectIndex = collection._objects.indexOf(that.viewObject),
                    needFocus = (that.attached && (that.fabricEditor.getActiveObject() === that.viewObject));
                viewObjectDump.type = this.viewObjectType;
                viewObjectDump.radius = viewObjectDump.width / 2;

                collection.remove(that.viewObject);
                that.viewObject = that.createViewObject(viewObjectDump);
                that.viewObject.element = that;
                collection.addWithIndex(that.viewObject, viewObjectIndex);
                if (needFocus) that.fabricEditor.setActiveObject(that.viewObject);
            }
        });

        constructor.fromObject = function(fabricEditor, options) {
            return new constructor(fabricEditor, options);
        };

        return constructor;
    });
})();