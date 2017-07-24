//(function() {
//    angular.module('iris_dpm').factory('DpmProtocolHeaderStructures', function ($resource) {
//        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/protocol-header-structures/:action", {
//            projectId: '@projectId',
//            action: '@action'
//        }, {
//            current: {
//                method: "GET",
//                params: { action: "current" }
//            }
//        });
//    });
//
//    angular.module('iris_dpm')
//        .factory('DpmProtocolHeaderStructureService', function (DpmProtocolHeaderStructures) {
//            return {
//                current: (projectId) => DpmProtocolHeaderStructures.current({projectId}).$promise,
//
//                save: (item) => DpmProtocolHeaderStructures.save({projectId: item.projectId}, item).$promise
//            }
//        });
//})();
