(function () {
    angular.module('iris_gs_workflows')
        .controller('ModuleWorkflowViewCtrl', function ($scope, $state, $uibModal, $translate, projects, WorkflowService, ModuleService) {

            $scope.projects = projects;
            $scope.availableProjects = [];

            var activeModuleCodes = ModuleService.getActiveModules().map(m => m.moduleCode)
            $scope.entities = WorkflowService.getWorkflowEntities().filter(t => activeModuleCodes.indexOf(t.moduleCode) >= 0);

            $scope.requestWorkflows = function () {
                $scope.workflows = [];
                if($scope.projects.selectedId) {
                    WorkflowService.getWorkflows($scope.projects.selectedId)
                        .then(workflows => $scope.workflows = workflows);
                } else {
                    WorkflowService.getAllWorkflows($state.params.projectId)
                        .then(workflows => $scope.workflows = workflows);
                }
            };
            $scope.requestWorkflows();

            $scope.createWorkflow = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.workflow = {
                    type: 'DOCUMENT',
                    color: '#93be3d',
                    notificationSubject: "Process status change for file {{file.name}} in the project {{project.name}}",
                    notificationMessage: "Dear {{user.name}},\r\n\r\nThe process status of the file {{file.name}} in the project {{project.name}} has been changed from {{status.old}} to {{status.new}} by {{status.new.by}}. For a further processing, you can find or download the file via the provided links:\r\n\r\nLocation: {{file.link}}\r\n\Download: {{file.download.link}}"
                }
            };
            $scope.createWorkflow();

            $scope.saveWorkflow = function () {
                WorkflowService.saveWorkflow($scope.workflow).then(workflow => {
                    alertify.success($translate.instant('label.workflows.WorkflowSaved'));
                    var id = $scope.workflow.id;
                    $scope.workflow = workflow;
                    if (!id && $scope.projects.selectedId) {
                        $scope.addLinkedProject($scope.projects.selectedId);
                    } else if(id) {
                        $scope.workflows[$scope.workflows.findIndex(element => element.id == $scope.workflow.id)] = angular.copy(workflow);
                    } else {
                        $scope.workflows.push(workflow);
                    }
                    $scope.createWorkflow();
                });
            };

            $scope.toggleWorkflowSelected = function (workflow) {
                workflow.isSelected = !workflow.isSelected;
                $scope.workflow = angular.copy(workflow);
            };

            $scope.editNotificationMessage = function(workflow) {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/workflows/ms.workflows.workflow.notification.html',
                    controller: 'ModuleWorkflowNotificationCtrl',
                    resolve: {
                        'workflow': function () {
                            return workflow;
                        }
                    }
                }).result.then(function (newWorkflow) {
                        workflow.notificationSubject = newWorkflow.notificationSubject;
                        workflow.notificationSubjectTranslations = newWorkflow.notificationSubjectTranslations;
                        workflow.notificationMessage = newWorkflow.notificationMessage;
                        workflow.notificationMessageTranslations = newWorkflow.notificationMessageTranslations;
                    });
            };
            
            $scope.copyWorkflow = function (workflow) {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/workflows/ms.workflows.workflow.copy.html',
                    controller: 'ModuleWorkflowCopyCtrl',
                    resolve: {
                        "workflow": function () {
                            return workflow;
                        }
                    }
                }).result.then(function (newWorkflowId) {
                    alertify.success($translate.instant('label.workflows.WorkflowCopied'));
                    $scope.requestWorkflows();
                });
            };

            $scope.gridOptions = {
                data: 'workflows',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'id',
                        width: 50,
                        displayName: $translate.instant('label.Id')
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'type',
                        width: '*',
                        displayName: $translate.instant('label.Type'),
                        cellFilter: 'IrisFilterField:[grid.appScope.entities]'
                    },
                    {
                        field: 'color',
                        width: '*',
                        displayName: $translate.instant('label.Color'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <i class="fa fa-circle" ng-style="{color: row.entity.color}"></i>
                            </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 180,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a ui-sref="module.workflows.workflow.states({workflowId: row.entity.id})"
                               uib-tooltip="{{::'label.workflows.GoToStates' | translate}}"
                               ng-click="$event.stopPropagation();"
                               class="btn btn-link">
                                <i class="fa fa-sitemap"></i>
                            </a>

                            <button class="btn btn-link"
                                    uib-tooltip="{{::'label.ShowDiagram' | translate}}"
                                    ng-click="grid.appScope.openWorkflowStatesDiagram(row.entity.id); $event.stopPropagation();">
                                <i class="fa fa-picture-o"></i>
                            </button>

                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.Copy' | translate}}"
                                    ng-click="grid.appScope.copyWorkflow(row.entity); $event.stopPropagation();">
                                <i class="fa fa-copy"></i>
                            </button>
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.removeWorkflow(row.entity); $event.stopPropagation();">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        $scope.availableProjects = [];
                        if ($scope.workflow.id == row.entity.id) {
                            $scope.createWorkflow();
                        } else {
                            $scope.setAvailableProjects(angular.copy(row.entity));
                        }
                    });
                }
            };

            $scope.setAvailableProjects = function (workflow) {
                $scope.workflow = workflow;
                $scope.availableProjects = [];
                $scope.availableProjects = $scope.projects.filter(p => !workflow.projects.find(wfp => wfp.id == p.id));
            };

            $scope.removeWorkflow = function (workflow) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        WorkflowService.removeWorkflow(workflow).then(workflow => {
                            alertify.success($translate.instant('label.workflows.WorkflowRemoved'));
                            $scope.requestWorkflows();
                            $scope.createWorkflow();
                        });
                    }
                });
            };

            $scope.openWorkflowStatesDiagram = function (workflowId) {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/workflows/ms.workflows.workflow.states.diagram.html',
                    controller: 'ModuleWorkflowStatesDiagramCtrl',
                    size: 'lg',
                    resolve: {
                        'states': function (WorkflowService) {
                            return WorkflowService.getWorkflowStates(workflowId);
                        }
                    }
                })
            };

            $scope.addLinkedProject = function (projectId) {
                $scope.workflow.linkedProjectId = null;
                WorkflowService.linkToProject($scope.workflow.id, projectId)
                    .then((workflow) => {
                        $scope.setAvailableProjects(workflow);
                        var wf = $scope.workflows[$scope.workflows.findIndex(element => element.id == $scope.workflow.id)];
                        if (wf) {
                            wf.projects = angular.copy(workflow.projects);
                        } else {
                            $scope.workflows.push(workflow);
                        }
                    });
            };

            $scope.removeLinkedProject = function (projectId) {
                WorkflowService.unlinkFromProject($scope.workflow.id, projectId)
                    .then((workflow) => {
                        $scope.setAvailableProjects(workflow);
                        $scope.workflows[$scope.workflows.findIndex(element => element.id == $scope.workflow.id)].projects = angular.copy(workflow.projects);
                    });
            };

        })
})();
