(function() {
    angular.module('iris_dpm').factory('DpmBlocks', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/buildings/:buildingId/protocol-blocks/:blockNumber", {
            projectId: '@projectId',
            buildingId: '@buildingId',
            blockNumber: '@blockNumber'
        }, {
            count: {
                method: "GET",
                url: iris.config.apiUrl + "/dpm/projects/:projectId/buildings/:buildingId/protocol-blocks/count"
            }
        });
    });

    angular.module('iris_dpm')
        .factory('DpmBlockService', function (DpmBlocks) {
            return {
                query: (projectId, buildingId, filter) => {
                    filter = filter || {};
                    angular.extend(filter, {
                        projectId: projectId,
                        buildingId: buildingId
                    });
                    return DpmBlocks.query(filter).$promise;
                },

                get: (projectId, buildingId, blockNumber) => DpmBlocks.get({projectId, buildingId, blockNumber}).$promise,

                save: (item) => DpmBlocks.save({projectId: item.projectId, buildingId: item.buildingId, blockNumber: item.blockNumber}, item).$promise,

                create: (params) => new DpmBlocks(params),

                remove: (item) => DpmBlocks.remove({projectId: item.projectId, buildingId: item.buildingId, blockNumber: item.blockNumber}).$promise,

                count: (projectId, buildingId, filter) => {
                    filter = filter || {};
                    angular.extend(filter, {
                        projectId: projectId,
                        buildingId: buildingId
                    });
                    return DpmBlocks.count(filter).$promise;
                }
            }
        });
})();
