(function() {
    angular.module('iris_dpm').factory('DpmPlans', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/plans/:fileName", {
            projectId: '@projectId',
            fileName: '@fileName'
        }, {
            count: {
                method: "GET",
                url: iris.config.apiUrl + "/dpm/projects/:projectId/plans/count"
            },
            remove: {
                method: "DELETE",
                isArray: true
            }
        });
    });

    angular.module('iris_dpm')
        .factory('DpmPlanService', function (DpmPlans) {
            return {
                query: (projectId, params) => {
                    params = params || {};
                    angular.extend(params, {
                        projectId: projectId
                    });
                    return DpmPlans.query(params).$promise;
                },

                get: (projectId, fileName) => DpmPlans.get({projectId, fileName}).$promise,

                remove: (item) => DpmPlans.remove({projectId: item.projectId, fileName: item.fileName}).$promise,

                count: (projectId, params) => {
                    params = params || {};
                    angular.extend(params, {
                        projectId: projectId
                    });
                    return DpmPlans.count(params).$promise;
                }
            }
        });
})();
