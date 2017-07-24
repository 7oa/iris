(function () {
    angular.module('irisApp').controller('DmsFileChangeWfStateCtrl',
        function ($scope, $uibModalInstance, $translate, file, FilesService, workflowStates) {
            $scope.file = file;
            $scope.workflowStates = workflowStates;
            $scope.users = [];

            $scope.state = {
                fileId: file.id,
                comment:'',
                stateId: file.workflowStateId,
                notifyUsers: []
            };

            $scope.setState = function (stateId) {
                $scope.users = [];
                if(!stateId) return;

                var state = $scope.workflowStates.filter(s => s.id == stateId)[0];
                if(!state) return;

                $scope.users = state.mergedUsers;
            };

            $scope.changeState = function () {
                $scope.state.notifyUsers = $scope.gridOptions.gridAPI ? $scope.gridOptions.gridAPI.selection.getSelectedRows() : [];
                FilesService.changeWorkflowState($scope.state).then(function () {
                    alertify.success($translate.instant('label.workflows.StateChanged'));
                    $uibModalInstance.close();
                });
            };

            $scope.gridOptions = {
                data: 'users',
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                enableFullRowSelection: true,
                enableSelectAll: true,
                selectionRowHeaderWidth: 35,
                multiSelect: true,
                columnDefs: [
                    {
                        field: 'id',
                        width: 50,
                        displayName: $translate.instant('label.Id')
                    },
                    {
                        field: 'email',
                        width: '*',
                        displayName: $translate.instant('label.Email')
                    },
                    {
                        field: 'profile.lastname',
                        width: '**',
                        displayName: $translate.instant('label.Name'),
                        cellTemplate:  `
                            <div class="ui-grid-cell-contents">
                                {{row.entity.profile.lastname}} {{row.entity.profile.firstname}}
                            </div>`
                    },
                    {
                        field: 'profile.company.name',
                        width: '*',
                        displayName: $translate.instant('label.Company')
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                    $scope.gridOptions.gridAPI.core.on.rowsRendered( $scope, function() { $scope.gridOptions.gridAPI.selection.selectAllRows(); } );
                }
            };
        });
})();