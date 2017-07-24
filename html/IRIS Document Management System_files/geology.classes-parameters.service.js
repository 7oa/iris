(function () {
    'use strict';

    const module = angular.module('iris_geology');

    module.factory('GeologyClassesParameters', function ($resource) {
        return $resource(iris.config.apiUrl + "/geology/projects/:projectId/geological-classes-parameters/:id", {
            id: '@id',
            projectId: '@projectId'
        });
    });

    module.factory('GeologyClassesParametersService', function ($translate, GeologyClassesParameters) {
        var geologicalClassesParameterTypes = [{
            id: 'ROCK',
            name: $translate.instant('label.geology.Rock')
        }, {
            id: 'SOIL',
            name: $translate.instant('label.geology.Soil')
        }, {
            id: 'ALL',
            name: $translate.instant('label.geology.All')
        }];
        
        return {
            getGeologyClassesParameters: projectId => {
                var params = {
                    projectId: projectId,
                    'order-by': angular.toJson([{name: 'name',value: 'asc'}])
                };
                return GeologyClassesParameters.query(params).$promise
            },

            getGeologyClassesParameter: (projectId, id) => GeologyClassesParameters.get({projectId: projectId, id: id}).$promise,

            saveGeologyClassesParameter: geologyClassesParameter => GeologyClassesParameters.save(geologyClassesParameter).$promise,

            createGeologyClassesParameter: params => new GeologyClassesParameters(params),

            removeGeologyClassesParameter: geologyClassesParameter => GeologyClassesParameters.remove({
                projectId: geologyClassesParameter.projectId,
                id: geologyClassesParameter.id
            }).$promise,

            getGeologicalClassesParameterTypes: () => geologicalClassesParameterTypes
        }
    });

})();
