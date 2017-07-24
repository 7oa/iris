(function () {
    angular.module('iris_gs_personnel_mgmt').controller('ModuleJobTitlesViewCtrl',
        function ($scope, $state, $translate, JobTitleService) {

            var requestJobTitles = function () {
                $scope.jobTitles = [];
                JobTitleService.getJobTitles($state.params.deviceId)
                    .then(jobTitles => $scope.jobTitles = jobTitles);
            };
            requestJobTitles();


            $scope.createJobTitle = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.jobTitle = {}
            };
            $scope.createJobTitle();


            $scope.saveJobTitle = function () {
                JobTitleService.saveJobTitle($scope.jobTitle).then(jobTitle => {
                    alertify.success($translate.instant('label.JobTitleSaved'));
                    requestJobTitles();
                    $scope.createJobTitle();
                });
            };


            $scope.gridOptions = {
                data: 'jobTitles',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'description',
                        width: '*',
                        displayName: $translate.instant('label.Description')
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
                                    ng-click="grid.appScope.removeJobTitle(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    $scope.gridOptions.gridAPI.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.jobTitle.id == row.entity.id) {
                            $scope.createJobTitle();
                        } else {
                            $scope.jobTitle = angular.copy(row.entity);
                        }
                    });
                }
            };


            $scope.removeJobTitle = function (jobTitle) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        JobTitleService.removeJobTitle(jobTitle.id).then(() => {
                            alertify.success($translate.instant('label.JobTitleRemoved'));
                            requestJobTitles();
                            $scope.createJobTitle();
                        });
                    }
                });
            }
        })
})();
