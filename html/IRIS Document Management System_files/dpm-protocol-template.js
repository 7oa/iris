(function() {
    angular.module('iris_dpm').factory('DpmProtocolTemplates', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/protocol-templates/:id", {
            projectId: '@projectId',
            id: '@id'
        });
    });

    angular.module('iris_dpm').factory('DpmBuildingProtocolTemplates', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/buildings/:buildingId/protocol-templates/:id", {
            projectId: '@projectId',
            buildingId: '@buildingId',
            id: '@id'
        });
    });

    angular.module('iris_dpm').factory('DpmProtocolTemplatesBuildings', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/protocol-templates/:protocolTemplateId/buildings/:buildingId", {
            projectId: '@projectId',
            buildingId: '@buildingId',
            protocolTemplateId: '@protocolTemplateId'
        });
    });

    angular.module('iris_dpm').factory('DpmProtocolTemplateStructures', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/protocol-templates/:id/structure", {
            projectId: '@projectId',
            id: '@id'
        });
    });

    angular.module('iris_dpm')
        .factory('DpmProtocolTemplateService', function ($translate, DpmProtocolTemplates, DpmProtocolTemplateStructures,
                                                         DpmBuildingProtocolTemplates, DpmProtocolTemplatesBuildings) {
            return {
                query: (projectId, params) => {
                    params = params || {};
                    params.projectId = projectId;
                    return DpmProtocolTemplates.query(params).$promise
                },

                get: (projectId, id) => DpmProtocolTemplates.get({projectId, id}).$promise,

                save: (item) => DpmProtocolTemplates.save({projectId: item.projectId, id: item.id}, item).$promise,

                create: (params) => new DpmProtocolTemplates(params),

                remove: (item) => DpmProtocolTemplates.remove({projectId: item.projectId, id: item.id}).$promise,

                getStructure: (projectId, id) => DpmProtocolTemplateStructures.get({projectId, id}).$promise,

                saveStructure: (projectId, id, structure) => DpmProtocolTemplateStructures.save({projectId, id}, structure).$promise,

                getProtocolTemplatesByBuilding:(projectId, buildingId, params) => {
                    params || (params = {});
                    params.projectId = projectId;
                    params.buildingId = buildingId;
                    return DpmBuildingProtocolTemplates.query(params).$promise;
                },

                assignProtocolTempalteToBuilding: (projectId, protocolTemplateId, buildingId) => DpmProtocolTemplatesBuildings.save({projectId, protocolTemplateId, buildingId}).$promise,

                unassignProtocolTempalteToBuilding: (projectId, protocolTemplateId, buildingId) => DpmProtocolTemplatesBuildings.delete({projectId, protocolTemplateId, buildingId}).$promise

            }
        });
})();
