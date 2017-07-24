(function () {

    angular.module('irisFabric').factory('IrisFabricGroupElement', function ($q, $filter, FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "group";
                this.viewObjectOptions = {};

                this.elements = [];
                this.elementsOptions = [];

                this.stateDefault = {
                    viewObject: {
                        visible: true
                    }
                };
            },

            initialize: function (fabricEditor, options, elements) {
                this.callSuper('initialize', fabricEditor, options);
                
                elements || (elements = []);
                var that = this;
                that.elements = elements;
                that.elements.forEach((e) => {
                    e.groupElement = that;
                    e.detach();
                });
            },

            toObject: function(viewObjectRelativeOptions) {
                var baseResult = this.callSuper('toObject', viewObjectRelativeOptions);
                if (!this.viewObject) return baseResult;

                for (var objectIndex = 0; objectIndex < this.viewObject._objects.length; objectIndex++) {
                    var object = this.viewObject._objects[objectIndex];
                    object.element.inGroupId = objectIndex;
                    baseResult.viewObjectOptions.objects[objectIndex].inGroupId = objectIndex;
                }

                return angular.extend(baseResult, {
                    elementsOptions: this.elements.map((e) => { return angular.extend(e.toObject(viewObjectRelativeOptions), {inGroupId: e.inGroupId}); })
                });
            },

            createViewObjectPromise: function(options) {
                var deferred = $q.defer(),
                    that = this;

                if (options && options.type === "group") {
                    FabricLib.Group.fromObject(options, function(grp) {
                        for (var i = 0; i < that.elements.length; i++) {
                            for (var j = 0; j < grp._objects.length; j++) {
                                if (that.elements[i].inGroupId === grp._objects[j].inGroupId) {
                                    that.elements[i].viewObject = grp._objects[j];
                                    grp._objects[j].element = that.elements[i];
                                    that.elements[i].rendered = true;
                                }
                            }
                        }

                        if (!that.rendered && !that.isClone) that.acceptScaleFactor(grp);
                        deferred.resolve(grp);
                    });
                } else {
                    var objects = that.elements.map((e) => { return e.viewObject }),
                        group = new FabricLib.Group(objects, options);
                    group._calcBounds(true);
                    deferred.resolve(group);
                }

                return deferred.promise;
            },

            refreshState: function() {
                this.callSuper('refreshState');

                this.elements.forEach((e) => {
                    e.refreshState();
                });
            }
        });

        constructor.fromObject = function(fabricEditor, options, elements) {
            return new constructor(fabricEditor, options, elements);
        };

        return constructor;
    });
})();