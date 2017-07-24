(function () {
    angular.module('iris_gs_workflows').controller('ModuleWorkflowStatesViewCtrl',
        function ($scope, $state, $uibModal, $translate, $filter, workflow, userGroups, WorkflowService) {
            $scope.workflow = workflow;
            $scope.userGroups = userGroups;
            $scope.workflowStateTypes = WorkflowService.getWorkflowStateTypes();
            $scope.workflowStateResolutionTypes = WorkflowService.getWorkflowStateResolutionTypes();

            $scope.filter = {
                workflowId: $state.params.workflowId
            };
            
            var requestWorkflowStates = function (triggerCreate) {
                $scope.states = [];
                WorkflowService.getWorkflowStates($state.params.workflowId)
                    .then(states => {
                        $scope.states = states;
                        $scope.successors = $scope.states;
                        if (!!triggerCreate) $scope.createWorkflowState();
                    });
            };
            requestWorkflowStates(true);

            $scope.calcAlias = function() {
                if (!$scope.workflowState || !$scope.workflowState.name) return;
                $scope.workflowState.alias = $filter("irisToAlias")($scope.workflowState.name);
            };

            $scope.changeWorkflow = function (workflowId) {
                if($scope.filter.workflowId == $state.params.workflowId) return;

                $state.go($state.current.name, {workflowId}, {reload: true});
            };

            $scope.createWorkflowState = function () {
                $scope.gridOptionsStates && $scope.gridOptionsStates.gridAPI.selection.clearSelectedRows();
                $scope.workflowState = WorkflowService.createWorkflowState({
                    workflowId: $state.params.workflowId,
                    userGroupIds: [],
                    resolution: null,
                    settings: {
                        showInWebUI: true,
                        showInMobileUI: true
                    }
                });
                $scope.successors = $scope.states;

                $scope.workflowState.type = $scope.states.length ? "STEP" : "START";
            };
            $scope.createWorkflowState();

            $scope.saveWorkflowState = function () {
                if ($scope.workflowState.type == "START") {
                    var startStates = $scope.states.filter((s) => s.type == "START");
                    if (startStates.length && startStates.map((s) => s.id).indexOf($scope.workflowState.id) < 0) {
                        alertify.alert($translate.instant('text.workflows.StartAlreadyExists'));
                        return;
                    }
                }

                var state = angular.copy($scope.workflowState);
                state.userGroups = state.userGroupIds.map(g => { return {id: g}; });
                WorkflowService.saveWorkflowState(state).then(() => {
                    alertify.success($translate.instant('label.workflows.WorkflowStateSaved'));
                    requestWorkflowStates(true);
                });
            };

            $scope.openSelectUsersModal = function () {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/workflows/ms.workflows.states.set-users.modal.html',
                    controller: 'ModuleWorkflowStatesUsersCtrl',
                    size: 'lg',
                    resolve: {
                        'users': function (UserService) {
                            return UserService.getUsers().$promise.then(a => a);
                        },
                        'selectedUsers': function () {
                            return $scope.workflowState.users ;
                        }
                    }
                }).result.then(function (users) {
                        $scope.workflowState.users = users;
                    })
            };

            $scope.gridOptionsStates = {
                data: 'states',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'id',
                        width: 50,
                        displayName: $translate.instant('label.Id'),
                        type: 'number'
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'alias',
                        width: '*',
                        displayName: $translate.instant('label.Alias')
                    },
                    {
                        field: 'color',
                        width: '60',
                        displayName: $translate.instant('label.Color'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div><i class="fa fa-circle" ng-style="{color: row.entity.color}"></i></div>
                            </div>`
                    },
                    {
                        field: 'type',
                        width: 150,
                        displayName: $translate.instant('label.Type'),
                        cellFilter: 'IrisFilterField:[grid.appScope.workflowStateTypes]'
                    },
                    {
                        field: 'toIds',
                        width: '*',
                        displayName: $translate.instant('label.numberSuccessor'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{row.entity.toIds.join(', ')}}
                            </div>`
                    },
                    {
                        field: 'nameSuccessor',
                        width: '*',
                        displayName: $translate.instant('label.nameSuccessor'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <span class="items-list" ng-repeat="s in row.entity.toIds">
                                    {{s | IrisFilterField:[grid.appScope.states]}}
                                </span>
                            </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 100,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.removeWorkflowState(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptionsStates.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.workflowState.id == row.entity.id) {
                            $scope.createWorkflowState();
                        } else {
                            $scope.workflowState = angular.copy(row.entity);
                            $scope.successors = $scope.states.filter(state => state.id != $scope.workflowState.id);
                        }
                    });
                }
            };

            $scope.fieldsToArray = function (array, field) {
                return array ? array.map(item => item[field]).join(', ') : '';
            };

            $scope.removeWorkflowState = function (workflowState) {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/workflows/ms.workflows.workflow.states.remove.html',
                    controller: 'ModuleWorkflowStatesRemoveCtrl',
                    resolve: {
                        'states': function () {
                            return $scope.states.filter(state => state.id != workflowState.id);
                        }
                    }
                }).result.then(function (newStateId) {
                    WorkflowService.removeWorkflowState(workflowState, newStateId).then(workflowState => {
                        alertify.success($translate.instant('label.workflows.WorkflowStateRemoved'));
                        requestWorkflowStates(true);
                    });
                })
            };

        })
})();