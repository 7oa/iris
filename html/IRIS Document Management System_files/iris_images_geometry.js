(function () {

    angular.module('iris_images').factory('Geometry', ['$resource', function ($resource) {
        return $resource(iris.config.baseUrl + "/restful/images/geometries/image/:image_id/geometry/:id", {
            image_id: '@image_id',
            id: '@id'
        }, {
            getForImage: {
                url: iris.config.baseUrl + "/restful/images/geometries/image/:image_id",
                params: {
                    image_id: '@image_id'
                },
                method: "GET",
                isArray: true
            }
        });
    }]);

    angular.module('iris_images').factory('GeometryService',
        function (Geometry) {
            return {
                getGeometriesForImage: function (imageId) {
                    return Geometry.getForImage({image_id: imageId}).$promise;
                },
                createGeometry: function (imageId) {
                    return new Geometry({image_id: imageId});
                },
                saveGeometry: function (imageId, geometry) {
                    return Geometry.save({image_id: imageId, id: geometry.id}).$promise
                },
                deleteGeometry: function (imageId, geometry) {
                    return Geometry.delete({image_id: imageId, id: geometry.id}).$promise
                }
            };
        });

})();
