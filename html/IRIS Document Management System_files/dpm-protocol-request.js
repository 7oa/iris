(function() {
    angular.module('iris_dpm').factory('DpmProtocolRequests', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/protocol-requests/:id", {
            projectId: '@projectId',
            id: '@id'
        }, {
            count: {
                method: "GET",
                url: iris.config.apiUrl + "/dpm/projects/:projectId/protocol-requests/count"
            }
        });
    });

    angular.module('iris_dpm')
        .factory('DpmProtocolRequestService', function (DpmProtocolRequests) {
            return {
                query: (projectId, filter) => {
                    filter = filter || {};
                    angular.extend(filter, {
                        projectId: projectId
                    });
                    return DpmProtocolRequests.query(filter).$promise;
                },

                get: (projectId, id) => DpmProtocolRequests.get({projectId, id}).$promise,

                save: (item) => DpmProtocolRequests.save({projectId: item.projectId, id: item.id}, item).$promise,

                create: (params) => new DpmProtocolRequests(params),

                remove: (item) => DpmProtocolRequests.remove({projectId: item.projectId, id: item.id}).$promise,

                count: (projectId, filter) => {
                    filter = filter || {};
                    angular.extend(filter, {
                        projectId: projectId
                    });
                    return DpmProtocolRequests.count(filter).$promise;
                }
            }
        });
})();
