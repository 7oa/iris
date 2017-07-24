(function () {

    angular.module('irisFabric').factory('IrisFabricManagedTextElement', function ($interpolate, $filter, FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "managedText";

                this.managedVariables = {};
                this.textPlaceholder = "[edit me]";

                this.stateDefault = {
                    managedText: this.textPlaceholder,
                    managedTextTranslations: null,
                    bold: false,
                    italic: false,
                    underlined: false,
                    viewObject: {
                        fontFamily: "Helvetica",
                        fontSize: 28,
                        fill: "#424242",
                        opacity: 1,
                        borderWidth: 1,
                        borderFill: "#424242",
                        borderVisible: false,
                        textAlign: "left",
                        visible: true
                    }
                };
            },

            initialize: function (fabricEditor, options) {
                this.callSuper('initialize', fabricEditor, options);
            },

            toObject: function(viewObjectRelativeOptions) {
                return angular.extend(this.callSuper('toObject', viewObjectRelativeOptions), {
                    managedText: this.stateDefault.managedText,
                    managedTextTranslations: this.stateDefault.managedTextTranslations,
                    bold: this.stateDefault.bold,
                    italic: this.stateDefault.italic,
                    underlined: this.stateDefault.underlined
                });
            },

            createViewObject: function(options) {
                var that = this,
                    res = new FabricLib.TextWithBorder(that.managedText || that.textPlaceholder, options);
                return res;
            },

            refreshState: function(managedVariables) {
                this.stateDefault.managedText = (this.stateDefault.managedText && this.stateDefault.managedTextTranslations)
                    ? $filter('irisTranslate')(this.stateDefault.managedText, this.stateDefault.managedTextTranslations)
                    : (this.stateDefault.managedText ? this.stateDefault.managedText : this.textPlaceholder);

                this.callSuper('refreshState');
                this.refreshManagedVariables(managedVariables || {});

                this.viewObject.text = this.getInterpolateText();
                this.viewObject.fontWeight = this.bold ? "bold" : "normal";
                this.viewObject.fontStyle = this.italic ? "italic" : "normal";
                this.viewObject.textDecoration = this.underlined ? "underline" : "";

                if (!this.attached) return;
                this.fabricEditor.renderAll();
                this.viewObject.setCoords();
            },

            refreshManagedVariables: function(managedVariables) {
                this.managedVariables = angular.extend(this.managedVariables, managedVariables);
                this.managedVariables = angular.extend(this.managedVariables, {
                    dataSeries: {
                        value : this.dataSeriesValue,
                        name: this.dataSeries ? this.dataSeries.name : null,
                        unit: this.dataSeries ?  $filter('irisUnits')(this.dataSeries.irisUnit) : null
                    },
                    deviceSensor: {
                        name: this.dataSeries ? this.dataSeries.sensor_name : null
                    }
                });
            },

            getInterpolateText: function() {
                return this.managedText ? $interpolate(this.managedText)(this.managedVariables) : this.textPlaceholder;
            }
        });

        constructor.fromObject = function(fabricEditor, options) {
            return new constructor(fabricEditor, options);
        };

        return constructor;
    });
})();