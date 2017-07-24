(function () {

    angular.module('irisFabric').factory('IrisFabricImageElement', function ($q, $filter, FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "image";

                this.stateDefault = {
                    imageId: null,
                    changeImageSizes: "fixAll",
                    viewObject: {
                        visible: true
                    }
                };
            },

            initialize: function (fabricEditor, options) {
                this.callSuper('initialize', fabricEditor, options);
                this.viewObjectOptions.autoResize = (options.viewObjectOptions === undefined);
            },

            toObject: function(viewObjectRelativeOptions) {
                return angular.extend(this.callSuper('toObject', viewObjectRelativeOptions), {
                    imageId: this.stateDefault.imageId,
                    changeImageSizes: this.stateDefault.changeImageSizes
                });
            },

            createViewObjectPromise: function(options) {
                var deferred = $q.defer(),
                    that = this;

                if (!that.imageId) deferred.resolve(null);

                FabricLib.ImageWithId.fromURL($filter('dmsFilePreview')(that.imageId), function(img) {
                    options || (options = {});
                    if (options.src) delete options.src;

                    if (!that.rendered && !that.groupElement) {
                        if (options.autoResize) {
                            var scaleFactor = Math.min(1, Math.min((that.fabricEditor.width - options.left) / img.width, (that.fabricEditor.height - options.top) / img.height));
                            options.width = img.width * scaleFactor;
                            options.height = img.height * scaleFactor;
                        } else {
                            that.acceptScaleFactor(options);
                        }
                    }

                    switch (that.changeImageSizes) {
                        case "fixNone":
                            var scaleFactor = Math.min(1, Math.min((that.fabricEditor.width - options.left) / img.width, (that.fabricEditor.height - options.top) / img.height));
                            options.width = img.width * scaleFactor;
                            options.height = img.height * scaleFactor;
                            break;
                        case "fixWidth":
                            if (options.width && options.height) {
                                options.height = img.height * options.width / img.width;
                            }
                            break;
                        case "fixHeight":
                            if (options.width && options.height) {
                                options.width = img.width * options.height / img.height;
                            }
                            break;
                        case "fixAll":
                            break;
                    }

                    angular.merge(img, options);
                    img.imageId = that.imageId;

                    deferred.resolve(img);
                });

                return deferred.promise;
            },

            refreshState: function() {
                this.callSuper('refreshState');

                if (this.viewObject && this.viewObject.imageId && (this.viewObject.imageId !== this.imageId)) {
                    this._changeImage();
                }
            },

            _changeImage: function() {
                var that = this,
                    collection = that.attached ? that.fabricEditor : (that.viewObject.group || null);
                if (!collection || !collection.contains(that.viewObject)) return;

                var viewObjectDump = that.viewObject._originalElement ? that.viewObject.toObject() : that.viewObjectOptions,
                    viewObjectIndex = collection._objects.indexOf(that.viewObject),
                    collectionState = {left: collection.left, top: collection.top},
                    needFocus = (that.attached && (that.fabricEditor.getActiveObject() === that.viewObject));
                viewObjectDump.src = $filter('dmsFilePreview')(that.imageId);

                collection.remove(that.viewObject);
                that.createViewObjectPromise(viewObjectDump).then(function (res) {
                    that.viewObject = res;
                    if (that.viewObject) {
                        that.viewObject.imageId = that.imageId;
                        that.viewObject.element = that;
                        collection.addWithIndex(that.viewObject, viewObjectIndex);
                        if (that.viewObject.group) {
                            collection._calcBounds();
                            collection._updateObjectsCoords();
                            angular.extend(collection, collectionState);
                            collection.setCoords();
                            that.fabricEditor.renderAll();
                        }
                        if (needFocus) that.fabricEditor.setActiveObject(that.viewObject);
                    }
                });
            }
        });

        constructor.fromObject = function(fabricEditor, options) {
            return new constructor(fabricEditor, options);
        };

        return constructor;
    });
})();