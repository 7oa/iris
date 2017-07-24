(function() {

    'use strict';

    angular.module('iris_gs_task_mgmt_states', []);
    
    angular.module('iris_gs_task_mgmt_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.task-mgmt', {
                    url: '/task-management/project/:projectId',
                    resolve: {
                        'projects': (ProjectsService) => ProjectsService.getProjects()
                    },
                    controller: 'ModuleProjectsBaseCtrl',
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.task-mgmt.project-settings', {
                    url: '/project-settings',
                    controller: 'ModuleTaskMgmtProjectSettingsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/task-management/ms.task-management.project-settings.html`
                });
        }
    )
})();
