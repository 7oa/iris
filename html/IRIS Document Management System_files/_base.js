(function (undefined) {

    angular.module('irisFabric').factory('IrisFabricBaseElement', function ($q, $interpolate, FabricLib) {
        return FabricLib.util.createClass({
            initFields: function() {
                this.elementName = null;

                this.showTooltip = false;
                this.managedTooltip = null;
                this.tooltip = null;

                this.dataSeries = null;
                this.dataSeriesValue = null;

                this.attached = true;
                this.rendered = false;
                this.viewObject = null;
                this.viewObjectOptions = {
                    left: 20,
                    top: 20
                };

                this.stateConditions = [];
                this.stateDefault = {};

                this.relWidth = 4;
                this.relHeight = 4;
                this.relRadius = 2;
            },

            initialize: function (fabricEditor, options) {
                options || (options = {});
                this.fabricEditor = fabricEditor;

                this.initFields();
                angular.merge(this, options);

                var editorScaleFactor = this.fabricEditor.getWidth() / 100;
                angular.extend(this.viewObjectOptions, {
                    width: this.viewObjectOptions.width || this.relWidth * editorScaleFactor,
                    height: this.viewObjectOptions.height || this.relHeight * editorScaleFactor,
                    radius: this.viewObjectOptions.radius || this.relRadius * editorScaleFactor
                });

                //angular.merge(this, options);
            },

            toObject: function(viewObjectRelativeOptions) {
                var viewObjectOptions,
                    renderOrder;

                if (this.viewObject) {
                    renderOrder = this.fabricEditor._objects.indexOf(this.viewObject);

                    var viewObjectScaleFactor = viewObjectRelativeOptions ? this.fabricEditor.getScaleFactor() : 1;
                    this.viewObject.scaleWithFactor(1 / viewObjectScaleFactor);
                    viewObjectOptions = this.viewObject.toObject();
                    viewObjectOptions.relativeScale = viewObjectRelativeOptions;
                    this.viewObject.scaleWithFactor(viewObjectScaleFactor);
                } else {
                    renderOrder = -1;
                    viewObjectOptions = {};
                }

                return {
                    id: this.id,
                    attached: this.attached,
                    renderOrder: renderOrder,
                    elementType: this.elementType,
                    elementName: this.elementName,
                    showTooltip: this.showTooltip,
                    managedTooltip: this.managedTooltip,
                    tooltip: this.tooltip,
                    viewObjectOptions: viewObjectOptions,
                    stateConditions: this.stateConditions,
                    stateDefault: this.stateDefault,
                    dataSeries: this.dataSeries
                }
            },

            acceptScaleFactor: function(options) {
                if (!options.relativeScale) return;

                var scaleFactor = this.fabricEditor.getScaleFactor();
                options.scaleX = options.scaleX * scaleFactor;
                options.scaleY = options.scaleY * scaleFactor;
                options.left = options.left * scaleFactor;
                options.top = options.top * scaleFactor;
            },

            createViewObjectPromise: function(options) {
                var deferred = $q.defer();
                if (!this.rendered && !this.isClone) this.acceptScaleFactor(options);
                deferred.resolve(this.createViewObject(options));
                return deferred.promise;
            },

            createViewObject: function(options) {
                return null;
            },

            render: function () {
                var that = this,
                    deferred = $q.defer();

                if (!that.viewObject && that.attached) {
                    that.createViewObjectPromise(that.viewObjectOptions).then(function(res) {
                        if (!res || that.viewObject) return;
                        that.viewObject = res;
                        that.viewObject.element = that;
                        that.rendered = true;
                        that.refreshState();
                        deferred.resolve(that);
                    });
                } else {
                    that.rendered = true;
                    that.refreshState();
                    deferred.resolve(that);
                }

                return deferred.promise;
            },

            fixViewObjectPosition: function() {
                if (!this.viewObject) return;
                this.viewObject.left = Math.max(0, this.viewObject.left);
                this.viewObject.top = Math.max(0, this.viewObject.top);

                if (!this.fabricEditor) return;
                this.viewObject.left = Math.min(this.fabricEditor.width - this.viewObject.getBoundingRectWidth(), this.viewObject.left);
                this.viewObject.top = Math.min(this.fabricEditor.height - this.viewObject.getBoundingRectHeight(), this.viewObject.top);
            },

            refreshState: function() {
                //if (this.attached) this.fixViewObjectPosition();

                angular.merge(this, this.stateDefault);
                if (!this.dataSeries) this.dataSeriesValue = null;
                this.refreshStateConditions();
            },

            refreshStateConditions: function() {
                if (this.stateConditions.length <= 0) return;

                if (this.dataSeriesValue != undefined) {
                    for(var i = 0; i < this.stateConditions.length; i++) {
                        var condition = this.stateConditions[i],
                            fromValue = condition.from == undefined ? Number.MIN_SAFE_INTEGER : condition.from,
                            toValue = condition.to == undefined ? Number.MAX_SAFE_INTEGER : condition.to,
                            value = Number(this.dataSeriesValue);
                        if (value >= fromValue && value <= toValue) {
                            angular.merge(this, condition.state);
                            break;
                        }
                    }
                }
            },

            attach: function() {
                this.fabricEditor.add(this.viewObject);
                this.attached = true;
            },

            detach: function() {
                if (this.fabricEditor.getActiveObject() || this.fabricEditor.getActiveGroup()) this.fabricEditor.deactivateAllWithDispatch();
                this.fabricEditor.remove(this.viewObject);
                this.attached = false;
            },

            dispose: function() {
                this.detach();
                this.viewObject = null;
            },

            getTooltip: function(tooltipScope) {
                if (this.managedTooltip !== undefined && this.managedTooltip !== null) {
                    tooltipScope || (tooltipScope = this);
                    return $interpolate(this.managedTooltip)(tooltipScope);
                } else {
                    return this.tooltip;
                }
            }
        })
    });
})();