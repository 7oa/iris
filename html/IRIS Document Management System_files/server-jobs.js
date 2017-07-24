(function () {

    irisAppDependencies.add("iris_server_jobs");

    angular.module('iris_server_jobs', []);

    angular.module('iris_server_jobs').factory('ServerJobs', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/jobs/:type/list", {
            type: '@type'
        });
    }]);

    angular.module('iris_server_jobs').factory('ServerJobsTypes', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/jobs/types");
    }]);

    angular.module('iris_server_jobs').factory('ServerJobsService', ['ServerJobs', 'ServerJobsTypes', '$filter',
        function (ServerJobs, ServerJobsTypes, $filter) {
            var server_jobs_types = ServerJobsTypes.query();

            return {
                getServerJobsByType: function (type, filter) {
                    filter = filter || {limit: 30, offset: 0};
                    return ServerJobs.query({type: type, limit: filter.limit, offset: filter.offset}).$promise;
                },

                getServerJobsTypes: function () {
                    return server_jobs_types;
                },

                getServerJobTypeByName: function (name) {
                    return $filter('filter')(server_jobs_types, {name: name}, true)[0];
                }
            };
        }
    ]);

})();
