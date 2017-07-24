(function () {

    angular.module('irisFabric').factory('IrisFabricFreeFormWithTextElement', function (FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "freeFormWithText";

                this.viewObjectType = null;
                this.viewObjectTypeDefault = "circleWithText";

                this.textPlaceholder = "[edit me]";

                this.stateDefault = {
                    managedText: this.textPlaceholder,
                    bold: false,
                    italic: false,
                    underlined: false,
                    visible: true
                };
            },

            initialize: function (fabricEditor, options) {
                this.callSuper('initialize', fabricEditor, options);
                this.viewObjectType || (this.viewObjectType = this.viewObjectTypeDefault);
            },

            toObject: function(viewObjectRelativeOptions) {
                return angular.extend(this.callSuper('toObject', viewObjectRelativeOptions), {
                    viewObjectType: this.viewObjectType,
                    managedText: this.stateDefault.managedText,
                    bold: this.stateDefault.bold,
                    italic: this.stateDefault.italic,
                    underlined: this.stateDefault.underlined
                });
            },

            createViewObject: function(options) {
                options || (options = {});
                angular.extend(options, {text: this.managedText || this.textPlaceholder});
                switch(this.viewObjectType) {
                    case "circleWithText":
                        return new FabricLib.CircleWithText(options);
                }
            },

            refreshState: function() {
                this.callSuper('refreshState');

                this.viewObject.text = this.managedText;
                this.viewObject.fontWeight = this.bold ? "bold" : "normal";
                this.viewObject.fontStyle = this.italic ? "italic" : "normal";
                this.viewObject.textDecoration = this.underlined ? "underline" : "";

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