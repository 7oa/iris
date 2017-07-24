(function () {
    'use strict';

    angular
        .module('iris_geology')
        .service('GeologyClassesParameters', GeologyClassesParameters);

    GeologyClassesParameters.$inject = ['$resource'];


    function GeologyClassesParameters($resource) {
        return $resource(iris.config.apiUrl + "/geology/projects/:projectId/geological-classes-parameters/:id", {
            id: '@id',
            projectId: '@projectId'
        }, {
            getGeologyClassesParameters: {
                method: "GET",
                params: { projectId: 'projectId' },
                isArray: true
            }
        });
    }

    /********************************/

    angular
        .module('iris_geology')
        .service('GeologyEntity', GeologyEntity);

    GeologyEntity.$inject = ['$resource'];


    function GeologyEntity($resource) {
        return $resource(iris.config.apiUrl + "/geology/project-devices/:projectDeviceId/geology/:id", {
            projectDeviceId: '@projectDeviceId',
            id: '@id'
        })
    }

    /********************************/

    angular
        .module('iris_geology')
        .service('GeologyService', GeologyService);

    GeologyService.$inject = ['$resource', '$http', '$translate', 'GeologyClassesParameters', 'GeologyEntity'];


    function GeologyService($resource, $http, $translate, GeologyClassesParameters, GeologyEntity) {

        var geologyTypes = [{
            id: 'TARGET',
            name: $translate.instant('label.geology.Target')
        }, {
            id: 'ACTUAL',
            name: $translate.instant('label.geology.Actual')
        }];

        var geologyReferenceTypes = [{
            id: 'CHAINAGE',
            name: $translate.instant('label.geology.Chainage')
        }, {
            id: 'TUNNELMETER',
            name: $translate.instant('label.geology.Tunnelmeter')
        }, {
            id: 'DEPTH',
            name: $translate.instant('label.geology.Depth')
        }];

        var service = {
            newGeologyEntity,
            getGeologyEntities,
            saveGeology,
            getGeologyEntity,
            getGeologyTypes,
            getGeologyReferenceTypes,
            getImportUrl,
            getExportUrl,
            removeGeology
        };

        return service;

        function newGeologyEntity(params) {
            return new GeologyEntity(params);
        }

        function getGeologyEntities(projectDeviceId) {
            return GeologyEntity.query({
                projectDeviceId: projectDeviceId
            }).$promise;
        }

        function saveGeology(geologyEntity) {
            return GeologyEntity.save(geologyEntity).$promise
        }

        function getGeologyEntity(projectDeviceId, id) {
            return GeologyEntity.get({
                projectDeviceId: projectDeviceId,
                id: id
            }).$promise;
        }
        
        function removeGeology(projectDeviceId, id) {
            return GeologyEntity.remove({
                projectDeviceId: projectDeviceId,
                id: id
            }).$promise;
        }

        function getGeologyTypes() {
            return geologyTypes
        }

        function getGeologyReferenceTypes() {
            return geologyReferenceTypes
        }

        function getImportUrl(geology) {
            return iris.config.apiUrl + `/geology/project-devices/${geology.projectDeviceId}/geology/${geology.id}/sections/import`
        }

        function getExportUrl(geology, format) {
            return iris.config.apiUrl + `/geology/project-devices/${geology.projectDeviceId}/geology/${geology.id}/sections/export?format=${format}`
        }
    }

})();
