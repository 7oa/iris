(function() {
    angular.module('fabric.core')
        .factory('FabricLib', function ($window, FabricConstant) {
            var lib = $window.fabric;

            var collectionExtensions = {
                addWithIndex: function (object, index) {
                    this._objects.splice(index, 0, object);
                    this._onObjectAdded(object);
                    this.renderOnAddRemove && this.renderAll();
                    return this;
                }
            };
            angular.extend(lib.StaticCanvas.prototype, collectionExtensions);
            angular.extend(lib.Group.prototype, collectionExtensions);

            angular.extend(lib.StaticCanvas.prototype, {
                removeActiveObject: function() {
                    this.remove(this.fabricEditor.getActiveObject());
                    this.renderAll();
                },

                shiftObject: function(object, leftShift, topShift) {
                    object.setPositionByOrigin(new fabric.Point(object.getCenterPoint().x + leftShift, object.getCenterPoint().y + topShift), 'center', 'center');
                    object.setCoords();
                    this.renderAll();
                    return this;
                },

                moveCenterH: function(object) {
                    object.centerH();
                    object.setCoords();
                    this.renderAll();
                    return this;
                },

                moveCenterV: function(object) {
                    object.centerV();
                    object.setCoords();
                    this.renderAll();
                    return this;
                },

                moveObjectLeft: function(object) {
                    object.setPositionByOrigin(new fabric.Point(object.getBoundingRectWidth() / 2, object.getCenterPoint().y), 'center', 'center');
                    object.setCoords();
                    this.renderAll();
                    return this;
                },

                moveObjectRight: function(object) {
                    object.setPositionByOrigin(new fabric.Point(this.width - object.getBoundingRectWidth() / 2, object.getCenterPoint().y), 'center', 'center');
                    object.setCoords();
                    this.renderAll();
                    return this;
                },

                moveObjectTop: function(object) {
                    object.setPositionByOrigin(new fabric.Point(object.getCenterPoint().x, object.getBoundingRectHeight() / 2), 'center', 'center');
                    object.setCoords();
                    this.renderAll();
                    return this;
                },

                moveObjectBottom: function(object) {
                    object.setPositionByOrigin(new fabric.Point(object.getCenterPoint().x, this.height - object.getBoundingRectHeight() / 2), 'center', 'center');
                    object.setCoords();
                    this.renderAll();
                    return this;
                },

                getActiveSelection: function() {
                    return this.getActiveObject() || this.getActiveGroup();
                },

                getScaleFactor: function() {
                    return this.getWidth() / FabricConstant.initialCanvasWidth;
                },

                resizeToWidth: function(newWidth, resizeObjects)
                {
                    if (!newWidth) newWidth = $(this.wrapperEl).parent().parent().width();
                    resizeObjects = (typeof resizeObjects === 'undefined') ? true : resizeObjects;

                    var factorHeight = this.fixAspectRatio ? (newWidth / this.getWidth()) : 1;
                    this.resize(newWidth, this.getHeight() * factorHeight, resizeObjects);
                },

                resizeToHeight: function(newHeight, resizeObjects)
                {
                    if (!newHeight) newHeight = $(this.wrapperEl).parent().parent().height();
                    resizeObjects = (typeof resizeObjects === 'undefined') ? true : resizeObjects;

                    var factorWidth = this.fixAspectRatio ? (newHeight / this.getHeight()) : 1;
                    this.resize(this.getWidth() * factorWidth, newHeight, resizeObjects);
                },

                resizeToBounds: function(newWidth, newHeight, resizeObjects)
                {
                    if (!newWidth) newWidth = $(this.wrapperEl).parent().parent().width();
                    if (!newHeight) newHeight = $(this.wrapperEl).parent().parent().height();
                    resizeObjects = (typeof resizeObjects === 'undefined') ? true : resizeObjects;

                    this.resize(newWidth, newHeight, resizeObjects);
                },

                resizeToAspectRatio: function(newAspectRatio, fixedRatio, resizeObjects)
                {
                    if (!newAspectRatio) return;
                    fixedRatio = (fixedRatio === "height") ? fixedRatio : "width";
                    resizeObjects = (typeof resizeObjects === 'undefined') ? false : resizeObjects;

                    var factorWidth = 1,
                        factorHeight = 1,
                        currentAspectRatio = this.getWidth() / this.getHeight();

                    if (fixedRatio === "height") {
                        factorWidth = newAspectRatio / currentAspectRatio;
                    } else if (fixedRatio === "width") {
                        factorHeight = currentAspectRatio / newAspectRatio;
                    }

                    var dump = this.fixAspectRatio;
                    this.fixAspectRatio = false;
                    this.resize(this.getWidth() * factorWidth, this.getHeight() * factorHeight, resizeObjects);
                    this.fixAspectRatio = dump;
                    this.aspectRatio = newAspectRatio;
                },

                resize: function(newWidth, newHeight, resizeObjects)
                {
                    if (!newWidth || !newHeight) return;
                    resizeObjects = (typeof resizeObjects === 'undefined') ? true : resizeObjects;

                    var oldWidth = this.getWidth(),
                        oldHeight = this.getHeight(),
                        factorWidth = newWidth / oldWidth,
                        factorHeight = newHeight / oldHeight;

                    if (this.fixAspectRatio) {
                        factorWidth = Math.min(factorWidth, factorHeight);
                        factorHeight = factorWidth;
                    }

                    this.setWidth(oldWidth * factorWidth);
                    this.setHeight(oldHeight * factorHeight);

                    if (this.backgroundImage) {
                        var bi = this.backgroundImage;
                        bi.width = bi.width * factorWidth;
                        bi.height = bi.height * factorHeight;
                    }

                    if (resizeObjects) {
                        var objects = this.getObjects();
                        for (var i = 0; i < objects.length; i++) {
                            objects[i].scaleWithFactor(factorWidth, factorHeight);
                            objects[i].setCoords();
                        }
                    }

                    this.renderAll();
                    this.calcOffset();
                },

                dblClickSupport: function() {
                    var dblClickTimer = 0,
                        dblClickInterval = 300,
                        that = this;
                    that.on('mouse:down', function(e) {
                        var d = new Date();
                        if ((d.getTime() - dblClickTimer) < dblClickInterval) {
                            that.fire('mouse:dblClick', e);
                        } else {
                            dblClickTimer = d.getTime();
                        }
                    });
                },

                keyboardSupport: function(enabled) {
                    var canvasWrapper = this.wrapperEl;
                    if (!canvasWrapper) return;

                    enabled || (enabled = false);
                    if (enabled) {
                        if (!$(canvasWrapper).data("fabricCanvas")) {
                            $(canvasWrapper).data("fabricCanvas", this);
                        }

                        canvasWrapper.tabIndex = 1000;
                        canvasWrapper.style.outline = "none";
                        canvasWrapper.addEventListener("keydown", this.keyboardSupportKeydownHandler);
                        canvasWrapper.addEventListener("focus", function(e) {
                            var scrollContainer = $(e.target).closest(".scrollable")[0] || $window.document.documentElement,
                                scrollTop = scrollContainer.scrollTop;
                            setTimeout(function() {
                                scrollContainer.scrollTop = scrollTop;
                            }, 0);
                        });
                    } else {
                        $(canvasWrapper).removeAttr("tabindex");
                        canvasWrapper.removeEventListener("keydown", this.keyboardSupportKeydownHandler);
                    }
                },

                keyboardSupportKeydownHandler: function(e) {
                    e = e || $window.event;

                    var shift = 5,
                        canvas = $(e.target).data("fabricCanvas");

                    if (!canvas || !canvas.getActiveSelection()) return;

                    switch (e.keyCode) {
                        case 37:
                            e.preventDefault();
                            canvas.shiftObject(canvas.getActiveSelection(), -shift, 0);
                            break;
                        case 38:
                            e.preventDefault();
                            canvas.shiftObject(canvas.getActiveSelection(), 0, -shift);
                            break;
                        case 39:
                            e.preventDefault();
                            canvas.shiftObject(canvas.getActiveSelection(), shift, 0);
                            break;
                        case 40:
                            e.preventDefault();
                            canvas.shiftObject(canvas.getActiveSelection(), 0, shift);
                            break;
                    }
                }
            });

            return lib;
        });
})();