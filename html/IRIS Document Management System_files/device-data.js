(function () {
    angular.module('iris_device_data', ['iris_projects']);

    angular.module('iris_device_data').factory('Advances', function ($resource) {
        return $resource(iris.config.apiUrl + "/device-data/projects/:project_id/devices/:device_id/advances", {
            project_id: '@project_id',
            device_id: '@device_id'
        });
    });

    angular.module('iris_device_data').factory('Phases', function ($resource) {
        return $resource(iris.config.apiUrl + "/device-data/devices/:device_id/interval-scanners/:scanner_id/intervals", {
            device_id: '@device_id',
            scanner_id: '@scanner_id'
        });
    });

    angular.module('iris_device_data').factory('DeviceDataService',
        function ($filter, Advances, Phases) {
            return {
                getAdvances(params){
                    params = params || {};

                    //todo this API doesn't support filtering and ordering =(( tobe rewritten
                    angular.extend(params, {
                        'order-by': angular.toJson([{
                            name: 'name',
                            value: 'desc'
                        }])
                    });

                    var advances = Advances.query(params);
                    return advances.$promise.then(values => values.sort((a,b) => b.name - a.name));
                },

                getPhases: function(params) {
                    return Phases.query(params).$promise;
                },

                filter: function (filter, strict) {
                    filter = filter || {};
                    strict = strict || true;
                    return $filter('filter')(projects, filter, strict);
                }
            };
        });

})();
