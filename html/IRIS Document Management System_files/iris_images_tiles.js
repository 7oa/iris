(function () {

    angular.module('iris_images').factory('ImageTileSettings', ['$resource', function ($resource) {
        return $resource(iris.config.baseUrl + "/restful/images/tiles/:imageId/:z/:x/:y", {
            image_id: '@imageId',
            z: '@z',
            x: '@x',
            y: '@y'
        });
    }]);

    angular.module('iris_images').factory('TileService', ['ImageTileSettings',
        function (ImageTiles) {
            return {
                getTileByImageAndZXY: function (imageId, z, x, y) {
                    return ImageTiles.get({imageId: imageId, z: z, x: x, y: y}).$promise;
                }
            };
        }]);

})();