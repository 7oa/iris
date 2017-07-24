(function () {

    angular.module('irisFabric').factory('IrisFabricSpeedometerElement', function ($filter, FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "speedometer";

                this.viewObjectType = null;
                this.viewObjectTypeDefault = "halfCircleSpeedometer";

                this.dataSeriesMin = null;
                this.dataSeriesMinValue = null;
                this.dataSeriesMax = null;
                this.dataSeriesMaxValue = null;

                this.relWidth = 20;
                this.relHeight = 10;

                this.stateDefault = {
                    units: null,
                    bold: false,
                    italic: false,
                    minValue: 0,
                    maxValue: 100,
                    viewObject: {
                        fill: null,
                        progressFill: '#ff0000',
                        gaugeStepCount: 5,
                        gaugeStepMiddle: true,
                        gaugeFill: '#424242',
                        backgroundFill: null,
                        centerPointFill: '#424242',
                        centerPointStrokeStyle: '#93be3d',
                        showUnits: false,
                        showProgressLabel: false,
                        showBoundsLabel: false,
                        fontSize: 24,
                        labelPlaceholder: 'n/a',
                        labelDecimals: 3,
                        labelAngle: 0,
                        fillLabel: "#424242",
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
                    viewObjectType: this.viewObjectType,
                    minValue: this.stateDefault.minValue,
                    maxValue: this.stateDefault.maxValue,
                    dataSeriesMin: this.dataSeriesMin,
                    dataSeriesMax: this.dataSeriesMax,
                    units: this.stateDefault.units,
                    bold: this.stateDefault.bold,
                    italic: this.stateDefault.italic
                });
            },

            createViewObject: function(options) {
                switch(this.viewObjectType) {
                    case "quarterCircleSpeedometer":
                        return new FabricLib.QuarterCircleSpeedometer(options);
                    case "halfCircleSpeedometer":
                        return new FabricLib.HalfCircleSpeedometer(options);
                    case "threeQuarterCircleSpeedometer":
                        return new FabricLib.ThreeQuarterCircleSpeedometer(options);
                }
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
                if (this.viewObjectType == "quarterCircleSpeedometer" && viewObjectDump.type != "quarterCircleSpeedometer") {
                    viewObjectDump.width = viewObjectDump.width * 0.6;
                } else if (this.viewObjectType != "quarterCircleSpeedometer" && viewObjectDump.type == "quarterCircleSpeedometer") {
                    viewObjectDump.width = viewObjectDump.width / 0.6;
                }
                viewObjectDump.type = this.viewObjectType;

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