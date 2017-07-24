(function(){
'use strict';

angular.module('iris_gs_geology_states', []).config(config);

function config($stateProvider) {
    
    $stateProvider.state('module.geology', {
        url: '/geology/project/:projectId',
        resolve: {
            'projects': function (ProjectsService){
                return ProjectsService.getPreloadedProjects();
            }
        },
        controller: 'ModuleGeologicalBaseCtrl',
        controllerAs: 'vm',
        template: `<div class="b-content b-window flex-grid" ui-view></div>`
    });

    $stateProvider.state('module.geology.geological-classes-parameters', {
        url: '/geological-classes-parameters',
        controllerAs: 'vm',
        controller: 'ModuleGeologicalClassesParametersViewCtrl',
        templateUrl: `${iris.config.componentsUrl}/global-settings/templates/geology/ms.geology.classes.parameters.html`,
        resolve: {
            'geologyClassesParameters': function ($stateParams, GeologyClassesParametersService){
                if($stateParams.projectId == '-')
                    $stateParams.projectId = '1';
                return GeologyClassesParametersService.getGeologyClassesParameters($stateParams.projectId);
            }
        }
    });
    
    $stateProvider.state('module.geology.geological-classes', {
        url: '/geological-classes',
        controllerAs: 'vm',
        controller: 'ModuleGeologicalClassesViewCtrl',
        templateUrl: `${iris.config.componentsUrl}/global-settings/templates/geology/ms.geology.classes.html`,
        resolve: {
            'geologyClasses': function ($stateParams, GeologyClassesService){
                if($stateParams.projectId == '-')
                    $stateParams.projectId = '1';
                return GeologyClassesService.getGeologyClasses($stateParams.projectId);
            }
        }
    });
}
})();