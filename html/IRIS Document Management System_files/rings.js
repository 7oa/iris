(function () {
    irisAppDependencies.add('iris_rings');

    angular.module('iris_rings', []);

    angular.module('iris_rings').factory('Rings', function ($resource) {
        return $resource(iris.config.apiUrl + `/construction/projects-device/:projectDeviceId/rings/:ringNumber`, {
            projectDeviceId: '@projectDeviceId',
            ringNumber: '@ringNumber'
        });
    });

    angular.module('iris_rings').factory('RingsService',
        function ($filter, Rings) {
            return {
                getRings: projectDeviceId => Rings.query({projectDeviceId}).$promise,
                
                getRing: (projectDeviceId, ringNumber) => Rings.get({projectDeviceId, ringNumber}).$promise
                
            }
        });

})();
