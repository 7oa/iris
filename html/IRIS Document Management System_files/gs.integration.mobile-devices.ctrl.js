(function () {
    angular.module('iris_gs_integration').controller('ModuleIntegrationMobileDevicesViewCtrl',
        function ($scope, $translate, MobileDeviceService) {
            var requestMobileDevices = function () {
                $scope.mobileDevices = [];
                MobileDeviceService.query().then(res =>  {
                    $scope.mobileDevices = res;
                });
            };
            requestMobileDevices();

            $scope.create = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.mobileDevice = MobileDeviceService.create();
            };
            $scope.create();

            $scope.save = function () {
                MobileDeviceService.save($scope.mobileDevice).then(() => {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    requestMobileDevices();
                    $scope.create();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        MobileDeviceService.remove(item).then(() => {
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            requestMobileDevices();
                            $scope.create();
                        });
                    }
                });
            };

            $scope.gridOptions = {
                data: 'mobileDevices',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'serialNo',
                        width: '*',
                        displayName: $translate.instant('label.integration.SerialNo')
                    },
                    {
                        field: 'osVersion',
                        width: '*',
                        displayName: $translate.instant('label.integration.OsVersion')
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 180,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.remove(row.entity); $event.stopPropagation();">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection && gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.mobileDevice.id == row.entity.id) {
                            $scope.create();
                        } else {
                            $scope.mobileDevice = angular.copy(row.entity);
                        }
                    });
                }
            };
        });
})();
