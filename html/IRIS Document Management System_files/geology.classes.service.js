(function () {
    'use strict';

    const module = angular.module('iris_geology');

    module.factory('GeologyClasses', function ($resource) {
        return $resource(iris.config.apiUrl + "/geology/projects/:projectId/geological-classes/:id", {
            projectId: '@projectId',
            id: '@id'
        });
    });

    module.factory('GeologyClassesService', function ($translate, GeologyClasses) {

        return {
       
            getGeologyClasses: projectId => {
                var params = {
                    projectId: projectId,
                    'order-by': angular.toJson([{name: 'name',value: 'asc'}])
                };
                return GeologyClasses.query(params).$promise
            },

            getGeologyClass: (projectId, id) => GeologyClasses.get({projectId: projectId, id: id}).$promise,

            saveGeologyClass: geologyClass => GeologyClasses.save(geologyClass).$promise,

            createGeologyClass: params => new GeologyClasses(params),

            removeGeologyClass: geologyClass => GeologyClasses.remove({
                projectId: geologyClass.projectId,
                id: geologyClass.id
            }).$promise,

            getImportClassesUrl: projectId => {
                return iris.config.apiUrl + `/geology/projects/${projectId}/geological-classes/import`
            },

            getExportClassesUrl: projectId => {
                return iris.config.apiUrl + `/geology/projects/${projectId}/geological-classes/export`
            }
        }
    });

})();
