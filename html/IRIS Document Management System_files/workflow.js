(function() {
    irisAppDependencies.add('iris_workflow');

    angular.module('iris_workflow', []);

    angular.module('iris_workflow').factory('Workflows', function ($resource) {
        return $resource(iris.config.apiUrl + "/workflow/workflows/:id", {
            id: '@id',
            projectId: '@projectId'
        }, {
            copyWorkflow: {
                url: iris.config.apiUrl + "/workflow/workflows/:id/copy",
                method: 'POST'
            },
            getByProjectId: {
                isArray: true,
                url: iris.config.apiUrl + "/workflow/projects/:projectId/workflows",
            },

            linkToProject: {
                url: iris.config.apiUrl + "/workflow/workflows/:workflowId/projects/:projectId",
                method: "POST",
                params: {
                    workflowId: '@workflowId',
                    projectId: '@projectId'
                }
            },
            unlinkFromProject: {
                url: iris.config.apiUrl + "/workflow/workflows/:workflowId/projects/:projectId",
                method: "DELETE",
                params: {
                    workflowId: '@workflowId',
                    projectId: '@projectId'
                }
            },

        });
    });

    angular.module('iris_workflow').factory('AllWorkflows', function ($resource) {
        return $resource(iris.config.apiUrl + "/workflow/workflows");
    });

    angular.module('iris_workflow').factory('WorkflowStates', function ($resource) {
        return $resource(iris.config.apiUrl + "/workflow/workflows/:workflowId/states/:id", {
            id: '@id',
            workflowId: '@workflowId'
        }, {
            getWorkflowNextStates: {
                url: iris.config.apiUrl + "/workflow/workflows/:workflowId/states/:id/next-states",
                isArray: true
            }
        });
    });

    angular.module('iris_workflow')
        .factory('WorkflowService', function ($translate, Workflows, AllWorkflows, WorkflowStates) {
            var workflowEntities = [{
                id: 'DOCUMENT',
                name: $translate.instant('label.Document'),
                moduleCode: 'DMS'
            }, {
                id: 'SEGMENT',
                name: $translate.instant('label.Segment'),
                moduleCode: 'CONSTRUCTION'
            }, {
                id: 'DPM',
                name: $translate.instant('label.DigitalProtocolManagement'),
                moduleCode: 'DPM'
            }, {
                id: 'TASK_MANAGEMENT',
                name: $translate.instant('label.TaskManagement'),
                moduleCode: 'TASK_MGMT'
            }, {
                id: 'DSM',
                name: $translate.instant('label.DigitalDamageManagement'),
                moduleCode: 'DAMAGE_MGMT'
            }, {
                id: 'PROJECT',
                name: $translate.instant('label.Project'),
                moduleCode: 'PROJECT_HIERARCHY'
            }];

            var workflowStateTypes = [{
                id: 'START',
                name: $translate.instant('label.Start')
            }, {
                id: 'STEP',
                name: $translate.instant('label.Step')
            }, {
                id: 'END',
                name: $translate.instant('label.End')
            }];

            var workflowStateResolutionTypes = [{
                id: 'RESOLVED',
                name: $translate.instant('label.Resolved')
            }, {
                id: 'REJECTED',
                name: $translate.instant('label.Rejected')
            }];

            function getWorkflows(projectId, filter) {
                filter = filter || [];
                filter = angular.toJson(filter);
                return Workflows.getByProjectId({projectId, filter}).$promise
            }

            function getAllWorkflows(filter) {
                filter = filter || [];
                filter = angular.toJson(filter);
                return AllWorkflows.query({filter}).$promise
            }

            return {
                getWorkflows,
                getAllWorkflows,

                getPreloadedWorkflows: () => iris.data.workflows || [],
                getAllWorkflowsByType: (type) => {
                    var filter = [{
                        f: 'type', v: [type]
                    }];
                    return getAllWorkflows(filter)
                },

                getWorkflowsByType: (projectId, type) => {
                    var filter = [{
                        f: 'type', v: [type]
                    }];
                    return getWorkflows(projectId, filter)
                },

                getWorkflow: (projectId, id) => Workflows.get({projectId, id}).$promise,

                saveWorkflow: workflow => Workflows.save({id: workflow.id}, workflow).$promise,

                createWorkflow: params => new Workflows(params),

                copyWorkflow: (workflow, newWorkflow) => Workflows.copyWorkflow({id: workflow.id}, newWorkflow).$promise,

                removeWorkflow: workflow => Workflows.remove({
                    id: workflow.id
                }).$promise,

                getWorkflowEntities: () => workflowEntities,
                getWorkflowStateTypes: () => workflowStateTypes,
                getWorkflowStateResolutionTypes: () => workflowStateResolutionTypes,

                getWorkflowStates: workflowId => WorkflowStates.query({workflowId}).$promise,

                getWorkflowState: (workflowId, id) => WorkflowStates.get({workflowId, id}).$promise,

                getWorkflowNextStates: (workflowId, id) => WorkflowStates.getWorkflowNextStates({workflowId, id}).$promise,

                saveWorkflowState: workflowState => WorkflowStates.save({id: workflowState.id, workflowId: workflowState.workflowId}, workflowState).$promise,

                createWorkflowState: params => {
                    params = angular.extend({
                        successorsIds: [],
                        successors: [],
                        users: [],
                        type: null
                    }, params);
                    return new WorkflowStates(params)
                },

                removeWorkflowState: (workflowState, newStateId) => WorkflowStates.remove({
                    workflowId: workflowState.workflowId,
                    id: workflowState.id,
                    'set-state': newStateId
                }).$promise,

                linkToProject: (workflowId, projectId) => Workflows.linkToProject({workflowId, projectId}).$promise,
                unlinkFromProject: (workflowId, projectId) => Workflows.unlinkFromProject({workflowId, projectId}).$promise

            }
        });
})();
