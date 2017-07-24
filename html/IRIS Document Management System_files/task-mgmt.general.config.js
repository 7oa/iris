(function () {
    angular.module('iris_gs_task_mgmt').directive('taskMgmtGeneralConfig',
        function ($filter, $translate, WorkflowService, ProjectSettingsService) {
            return {
                replace: true,
                restrict: 'EA',

                scope: {
                    projectId: '=',
                    api: '='
                },

                templateUrl: `${iris.config.componentsUrl}/global-settings/templates/task-management/ms.task-management.general.config.html`,

                controller: function($scope) {
                    $scope.workflowStates = [];
                    $scope.workflows = [];
                    $scope.projectWorkflows = [];

                    WorkflowService.getAllWorkflowsByType('TASK_MANAGEMENT').then(wRes => {
                        $scope.workflows = wRes;
                    });

                    WorkflowService.getWorkflows($scope.projectId).then(wRes => {
                        $scope.projectWorkflows = wRes;
                    });

                    $scope.sortableOptions = {
                        handle: '.drag-target'
                    };
                },

                link: function (scope, element, attrs) {
                    ProjectSettingsService.getProjectSettingsById("TASK_MGMT", scope.projectId).then(res => {
                        res.settings = res.settings || {};
                        scope.task_settings = res;
                        scope.refreshKanbanStates(scope.task_settings.settings.defaultWorkflowId);
                    });

                    scope.refreshKanbanStates = function(workflowId, initial) {
                        if (!workflowId) {
                            scope.workflowStates = [];
                            scope.task_settings.settings.kanbanStates = [];
                            return;
                        }

                        (initial || !scope.task_settings.settings.kanbanStates) && (scope.task_settings.settings.kanbanStates = []);
                        WorkflowService.getWorkflowStates(workflowId).then(res => {
                            scope.workflowStates = res;
                            res.sort((a, b) => a.id - b.id);
                            res.forEach(s => {
                                if (!scope.task_settings.settings.kanbanStates.find(t => t.workflowStateIds.find(ws => ws == s.id))) {
                                    scope.task_settings.settings.kanbanStates.push({
                                        workflowStateIds: [s.id],
                                        title: $filter("irisTranslate")(s.name, s.nameTranslations),
                                        visible: !!initial
                                    });
                                }
                            });
                        });
                    };

                    function saveCore(saveSettings) {
                        return ProjectSettingsService.saveProjectSettings("TASK_MGMT", saveSettings, scope.projectId).then(res => {
                            scope.task_settings = res;
                            alertify.success($translate.instant("label.SavedSuccessfully"));
                        });
                    }

                    scope.saveSettings = function () {
                        var saveSettings = angular.copy(scope.task_settings);

                        if (saveSettings.settings.defaultWorkflowId && !scope.projectWorkflows.find(t => t.id == saveSettings.settings.defaultWorkflowId)) {
                            return WorkflowService.linkToProject(saveSettings.settings.defaultWorkflowId, scope.projectId).then(wRes => {
                                scope.projectWorkflows.push(wRes);
                                return saveCore(saveSettings);
                            });
                        } else {
                            return saveCore(saveSettings);
                        }
                    };

                    scope.api = {
                        save: scope.saveSettings
                    };
                }
            };
        });
})();