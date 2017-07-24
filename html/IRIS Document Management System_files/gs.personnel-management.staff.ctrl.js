(function () {
    angular.module('iris_gs_personnel_mgmt').controller('ModuleStaffViewCtrl',
        function ($scope, $state, $translate, StaffService, JobTitleService) {
            $scope.jobTitles = [];
            $scope.staffs = [];

            JobTitleService.getJobTitles().then(titles => $scope.jobTitles = titles);

            var requestStaff = function () {
                StaffService.getAllStaff()
                    .then(staffs => {
                        $scope.staffs = staffs;
                    });
            };
            requestStaff();

            $scope.createStaff = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.staff = {}
            };
            $scope.createStaff();

            $scope.saveStaff = function () {
                StaffService.saveStaff($scope.staff).then(staff => {
                    alertify.success($translate.instant('label.StaffSaved'));
                    requestStaff();
                    $scope.createStaff();
                });
            };

            $scope.handleJobTitleChange = function() {
                if (!$scope.staff.jobTitle.id)
                    $scope.staff.jobTitle = null;
            };

            $scope.gridOptions = {
                data: 'staffs',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        name: $translate.instant('label.User'),
                        width: 50,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i class="fa fa-user text-success"
                                uib-tooltip="{{'label.ProfileHasSystemUser' | translate}}"
                                ng-if="row.entity.userId"></i>
                        </div>`
                    },
                    {
                        field: 'jobTitle.name',
                        width: '*',
                        displayName: $translate.instant('label.JobTitle')
                    },
                    {
                        field: 'firstname',
                        width: '*',
                        displayName: $translate.instant('label.FirstName')
                    },
                    {
                        field: 'lastname',
                        width: '*',
                        displayName: $translate.instant('label.LastName')
                    },
                    {
                        field: 'company.name',
                        width: '*',
                        displayName: $translate.instant('label.Company')
                    },
                    {
                        field: 'address',
                        width: '*',
                        displayName: $translate.instant('label.Address')
                    },
                    {
                        field: 'email',
                        width: '*',
                        displayName: $translate.instant('label.Email')
                    },
                    {
                        field: 'zip',
                        width: '*',
                        displayName: $translate.instant('label.ZIP')
                    },
                    {
                        field: 'city',
                        width: '*',
                        displayName: $translate.instant('label.City')
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
                                    ng-if="!row.entity.userId"
                                    ng-click="grid.appScope.removeStaff(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    $scope.gridOptions.gridAPI.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.staff.id == row.entity.id) {
                            $scope.createStaff();
                        } else {
                            $scope.staff = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.removeStaff = function (staff) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        StaffService.removeStaff(staff.id).then(() => {
                            alertify.success($translate.instant('label.StaffRemoved'));
                            requestStaff();
                            $scope.createStaff();
                        });
                    }
                });
            };

            $scope.filterByCompany = (companyId) => {
                if (companyId) {
                    StaffService.getByCompanyId(companyId).then(staffs => {
                        $scope.staffs = staffs;
                    });
                } else {
                    requestStaff();
                }
            }
        })
})();
