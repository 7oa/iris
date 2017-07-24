(function() {

    'use strict';

    angular.module('iris_gs_workflows_states', []);
    
    angular.module('iris_gs_workflows_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.workflows', {
                    url: '/workflows',
                    controller: function() {},
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.workflows.workflow', {
                    url: '/workflows',
                    resolve: {
                        'projects': function (ProjectsService) {
                            return ProjectsService.getPreloadedProjects();
                        }
                    },
                    controller: 'ModuleWorkflowViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/workflows/ms.workflows.workflow.html`
                })
                .state('module.workflows.workflow.states', {
                    url: '/:workflowId/states',
                    controller: 'ModuleWorkflowStatesViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/workflows/ms.workflows.workflow.states.html`,
                    resolve: {
                        'workflow': function (WorkflowService, $stateParams) {
                            return WorkflowService.getWorkflow($stateParams.projectId, $stateParams.workflowId);
                        },
                        'userGroups': function (UserGroupsService) {
                            return UserGroupsService.getUserGroups();
                        }
                    }
                });
        }
    )
})();
