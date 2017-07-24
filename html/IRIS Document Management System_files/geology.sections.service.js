(function () {
    'use strict';

    var module = angular.module('iris_geology');

    module.factory('GeologySections', function ($resource) {
        return $resource(iris.config.apiUrl + "/geology/project-devices/:projectDeviceId/geology/:geologyId/sections/:id", {
            projectDeviceId: '@projectDeviceId',
            geologyId: '@geologyId',
            id: '@id'
        });
    });

    /********************************/

    angular
        .module('iris_geology')
        .service('GeologySectionsService', GeologySectionsService);

    GeologySectionsService.$inject = ['$resource', '$http', '$translate', 'GeologySections'];


    function GeologySectionsService($resource, $http, $translate, GeologySections) {

        var service = {
            getGeologySections: getGeologySections,
            getGeologySection: getGeologySection,
            saveGeologySection: saveGeologySection,
            createGeologySection: createGeologySection,
            removeGeologySection: removeGeologySection
        };

        return service;

        function getGeologySections(projectDeviceId, geologyId, filter) {
           filter = filter || {};
            var params = angular.extend({
                projectDeviceId: projectDeviceId,
                geologyId: geologyId
            }, filter);
            return GeologySections.query(params).$promise;
        }

        function getGeologySection(projectDeviceId, geologyId, id) {
            return GeologySections.get({
                projectDeviceId: projectDeviceId,
                geologyId: geologyId,
                id: id
            }).$promise;
        }

        function saveGeologySection(geologySection) {
            return GeologySections.save(geologySection).$promise
        }

        function createGeologySection(params) {
            return new GeologySections(params);
        }

        function removeGeologySection(geologySection) {
            return GeologySections.remove(geologySection).$promise
        }

    }

})();