(function () {
    angular.module('iris_sensor_groups', []);

    angular.module('iris_sensor_groups').factory('SensorGroups', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/devices/:device_id/sensor-groups/:id", {
            device_id: '@device_id',
            id: '@id'
        });
    });

    angular.module('iris_sensor_groups').factory('SensorGroupsService',
        function (SensorGroups) {
            return {
                getSensorGroups: function (device_id, params) {
                    params = params || {};

                    params.device_id = device_id;

                    return SensorGroups.query(params).$promise;
                },
                getSensorGroup: function (device_id, id) {
                    return SensorGroups.get({device_id: device_id, id: id}).$promise;
                },
                saveSensorGroup: function (device_id, sensorGroup) {
                    return SensorGroups.save({device_id: device_id, id: sensorGroup.id}, sensorGroup).$promise;
                },
                deleteSensorGroup: function (sensorGroup) {
                    return SensorGroups.delete({device_id: sensorGroup.deviceId, id: sensorGroup.id}, sensorGroup).$promise;
                }
            };
        });

})();