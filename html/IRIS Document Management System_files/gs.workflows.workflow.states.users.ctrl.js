(function () {
    angular.module('iris_gs_workflows').controller('ModuleWorkflowStatesUsersCtrl',
        function ($scope, selectedUsers, $state, $timeout, $uibModalInstance, $translate, users) {
            $scope.users = users;

            $scope.gridOptions = {
                data: 'users',
                enableFiltering: true,
                enableFullRowSelection: true,
                enableSelectAll: true,
                selectionRowHeaderWidth: 35,
                multiSelect: true,
                columnDefs: [
                    {
                        field: 'id',
                        enableFiltering: false,
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
                        width: '*',
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
                    },
                    {
                        name: 'userGroups',
                        field: 'userGroupsList()',
                        width: '*',
                        displayName: $translate.instant('label.UserGroups')
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    //preselect users
                    $timeout(() => {
                        users.forEach(user => {
                            if(selectedUsers.find(u => u.id == user.id)){
                                $scope.gridOptions.gridAPI.selection.selectRow(user);
                            }
                        });
                    })
                }
            };

            $scope.selectUsers = function () {
                $uibModalInstance.close($scope.gridOptions.gridAPI.selection.getSelectedRows());
            }

        })
})();
