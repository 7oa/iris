(function() {
    var originalImageToObject = fabric.Image.prototype.toObject;
    fabric.Image.prototype.toObject = function(propertiesToInclude) {
        var res = originalImageToObject.call(this, propertiesToInclude);
        if (!res.crossOrigin) {
            delete res.crossOrigin;
        }
        return res;
    };

    fabric.ImageWithId = fabric.util.createClass(fabric.Image, {
        type: 'imageWithId',

        imageId: null,
        async: true,

        toObject : function() {
            return fabric.util.object.extend(this.callSuper('toObject'), {
                imageId: this.imageId
            });
        }
    });

    fabric.util.object.extend(fabric.ImageWithId, {
        async: true,

        fromObject: function (object, callback) {
            fabric.util.loadImage(object.src, function (img) {
                fabric.Image.prototype._initFilters.call(object, object, function (filters) {
                    object.filters = filters || [];
                    var instance = new fabric.ImageWithId(img, object);
                    callback && callback(instance);
                });
            }, null, object.crossOrigin);
        },

        fromURL: function (url, callback, imgOptions) {
            fabric.util.loadImage(url, function (img) {
                callback(new fabric.ImageWithId(img, imgOptions));
            }, null, imgOptions && imgOptions.crossOrigin);
        }
    });
})();