(function () {
    //irisAppDependencies.add('iris_sensorboards');

    //angular.module('iris_sensorboards', []);

    angular.module('iris_sensorboards').factory('Sensorboards', function ($resource) {
        return $resource(iris.config.apiUrl + "/sensorboards/:id", {id: '@id'});
    });

    angular.module('iris_sensorboards').factory('SensorboardsService',
        function ($translate, Sensorboards) {
            var proportions = [{
                name: '16 x 9',
                width: 16,
                height: 9
            }, {
                name: '16 x 10',
                width: 16,
                height: 10
            }, {
                name: '4 x 3',
                width: 4,
                height: 3
            }];

            return {
                getSensorboardsPreloadedList: function () {
                    return iris.data.sensorboards;
                },

                getSensorboardsList: function () {
                    return Sensorboards.query().$promise;
                },

                getSensorboardById: function (id) {
                    return Sensorboards.get({id: id}).$promise;
                },

                saveSensorboard: function (sensorboard) {
                    sensorboard.projectDevice = {id: sensorboard.projectDeviceId};
                    return Sensorboards.save(sensorboard).$promise;
                },

                createSensorboard: function () {
                    return new Sensorboards({
                        width: 16,
                        height: 9,
                        refreshInterval: 10,
                        elements: [],
                        settings: {
                            fill: '#ffffff'
                        }
                    });
                },

                removeSensorboard: function (sensorboard_id) {
                    return Sensorboards.remove({id: sensorboard_id}).$promise;
                },

                getProportions: function () {
                    return proportions;
                }
            };
        });
})();
