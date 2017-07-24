(function() {

    'use strict';

    angular.module('iris_gs_efv_states', []);
    
    angular.module('iris_gs_efv_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.efv', {
                    url: '/efv/project/:projectId',
                    resolve: {
                        'projects': function (ProjectsService) {
                            return ProjectsService.getProjects();
                        }
                    },
                    controller: 'ModuleProjectsBaseCtrl',
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.efv.general', {
                    url: '/general',
                    controller: 'ModuleEfvGeneralViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/efv/ms.efv.general.html`
                });
        }
    )
})();
