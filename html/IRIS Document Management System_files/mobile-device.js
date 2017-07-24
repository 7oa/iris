(function() {
    irisAppDependencies.add('iris_integration');

    angular.module('iris_integration', []);

    angular.module('iris_integration').factory('MobileDevices', function ($resource) {
        return $resource(iris.config.apiUrl + "/external-devices/register/:id", {
            id: '@id'
        });
    });

    angular.module('iris_integration')
        .factory('MobileDeviceService', function ($translate, MobileDevices) {
            //function query(filter) {
            //    filter = filter || [];
            //    filter = angular.toJson(filter);
            //    return MobileDevices.query({filter}).$promise
            //};

            return {
                query: () => MobileDevices.query().$promise,

                get: (id) => MobileDevices.get({id}).$promise,

                save: (item) => MobileDevices.save({id: item.id}, item).$promise,

                create: (params) => new MobileDevices(params),

                remove: (item) => MobileDevices.remove({id: item.id}).$promise
            }
        });
})();
