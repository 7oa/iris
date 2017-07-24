(function () {
    angular.module('iris_geo_sensors', []);

    angular.module('iris_geo_sensors').factory('Geosensors', function ($resource) {
        return $resource(iris.config.apiUrl + "/geoposition/geosensors/sensor/:sensor_id/geosensor/:id", {
            sensor_id: '@sensor_id',
            id: '@id',
            device_id: '@device_id'
        }, {
            getByDevice: {
                method: "GET",
                url: iris.config.apiUrl + "/geoposition/geosensors/device/:device_id/geosensors",
                isArray: true
            }
        });
    });

    angular.module('iris_geo_sensors').factory('GeosensorsService',
        function (Geosensors) {
            return {
                getByDeviceId: function(device_id) {
                    return Geosensors.getByDevice({device_id: device_id}).$promise;
                },
                createGeosensor: function (deviceSensor) {
                    return new Geosensors({sensor: deviceSensor});
                },
                getGeosensor: function (deviceSensor) {
                    return Geosensors.get({sensor_id: deviceSensor.id}).$promise;
                },
                saveGeosensor: function (deviceSensor, geosensor) {
                    return Geosensors.save({sensor_id: deviceSensor.id}, geosensor).$promise
                },
                deleteGeosensor: function (deviceSensor, id) {
                    return Geosensors.delete({sensor_id: deviceSensor.id, id: id}).$promise
                }

            };
        });

    angular.module('iris_geo_sensors').factory('GeosensorTypes', function ($resource) {
        return $resource(iris.config.apiUrl + "/geoposition/geosensortypes/:id", {
            id: '@id'
        }, {
            getAllGeosensorTypes: {
                method: "GET",
                url: iris.config.apiUrl + "/geoposition/geosensortypes",
                isArray: true
            }
        });
    });

    angular.module('iris_geo_sensors').factory('GeosensorTypesService',
        function (GeosensorTypes) {
            return {
                getSensorTypes: function () {
                    return GeosensorTypes.getAllGeosensorTypes().$promise;
                },
                getSensorType: function (id) {
                    return GeosensorTypes.get({id: id}).$promise;
                },
                saveGeosensorType: function (geosensorType) {
                    return GeosensorTypes.save(geosensorType).$promise
                },
                deleteGeosensorType: function (id) {
                    return GeosensorTypes.delete({id: id}).$promise
                }

            };
        });

})();