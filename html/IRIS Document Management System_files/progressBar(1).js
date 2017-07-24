(function(undefined) {

    angular.module('irisFabric').factory('IrisFabricProgressBarElement', function ($filter, FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "progressBar";

                this.dataSeriesMin = null;
                this.dataSeriesMinValue = null;
                this.dataSeriesMax = null;
                this.dataSeriesMaxValue = null;

                this.relWidth = 20;
                this.relHeight = 2;

                this.stateDefault = {
                    units: null,
                    bold: false,
                    italic: false,
                    minValue: 0,
                    maxValue: 100,
                    viewObject: {
                        fillProgress: '#93be3d',
                        fill: "#424242",
                        fillLabel: '#ffffff',
                        fontSize: 24,
                        labelPlaceholder: 'n/a',
                        labelDecimals: 3,
                        labelAngle: 0,
                        showLabel: true,
                        showUnits: false,
                        visible: true
                    }
                };
            },

            initialize: function (fabricEditor, options) {
                this.callSuper('initialize', fabricEditor, options);
            },

            createViewObject: function(options) {
                return new FabricLib.ProgressBar(options);
            },

            toObject: function(viewObjectRelativeOptions) {
                return angular.extend(this.callSuper('toObject', viewObjectRelativeOptions), {
                    minValue: this.stateDefault.minValue,
                    maxValue: this.stateDefault.maxValue,
                    dataSeriesMin: this.dataSeriesMin,
                    dataSeriesMax: this.dataSeriesMax,
                    units: this.stateDefault.units,
                    bold: this.stateDefault.bold,
                    italic: this.stateDefault.italic
                });
            },

            refreshState: function () {
                this.callSuper('refreshState');

                if (!this.dataSeriesMin) this.dataSeriesMinValue = null;
                if (!this.dataSeriesMax) this.dataSeriesMaxValue = null;

                this.viewObject.units = $filter('irisUnits')(this.units);
                this.viewObject.fontWeight = this.bold ? "bold" : "normal";
                this.viewObject.fontStyle = this.italic ? "italic" : "normal";

                var bound1 = this.dataSeriesMinValue == undefined ? this.minValue : this.dataSeriesMinValue,
                    bound2 = this.dataSeriesMaxValue == undefined ? this.maxValue : this.dataSeriesMaxValue;
                this.minValue = Math.min(bound1, bound2);
                this.maxValue = Math.max(bound1, bound2);

                this.viewObject.minValue = this.minValue;
                this.viewObject.maxValue = this.maxValue;
                this.viewObject.progress = this.dataSeriesValue;
            }
        });

        constructor.fromObject = function(fabricEditor, options) {
            return new constructor(fabricEditor, options);
        };

        return constructor;
    });
})();