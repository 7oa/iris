(function () {
    angular.module('iris_gs_alarming').controller('ModuleAlarmingViewCtrl',
        function ($scope, $state, $uibModal, $translate, $timeout, DevicesService, uiGridConstants, AlarmingService) {
            var getDevices = function () {
                DevicesService.getDevices().$promise.then(function (response) {
                    $scope.devices = response;
                });
            };

            $scope.availableAlarmTypes = AlarmingService.getAlarmingTypes();

            $scope.getItems = function(method, loaderPath) {
                $scope.items.splice(0, $scope.items.length);

                if(!loaderPath) {
                    loaderPath = '.ui-grid-contents-wrapper';

                    iris.loader.start(loaderPath);
                }

                if($scope.params.deviceId) {
                    method($scope.params.deviceId).then(function(response) {
                        angular.extend($scope.items, response);

                        $scope.gridOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);

                        iris.loader.stop(loaderPath);
                    }, function() {
                        iris.loader.stop(loaderPath);
                    });
                } else {
                    iris.loader.stop(loaderPath);
                }
            };

            $scope.setNewItem = function () {

                if($scope.gridOptions.gridApi) {
                    $scope.gridOptions.gridApi.selection.clearSelectedRows();
                }

                var item = { device: { id: $scope.params.deviceId }, type: $scope.availableAlarmTypes[0].alias || 1 };

                $scope.setItem(item);
            }

            $scope.editItem = function(item, $event) {
                if($scope.item.id == item.id) {
                    $event.stopPropagation();
                } else {
                    $scope.setItem(angular.copy(item));
                }

                $scope.item.alarmSchemaType = $scope.item.alarmSchemaType || 1;
            };

            $scope.itemTypeChanged = function(type) {
                $scope.item.alarmSchemaType = type;
            };

            $scope.onChangeDevice = function() {
                $state.params.deviceId = $scope.params.deviceId;

                $state.go($state.current.name, $state.params, { reload: true });
            };

            $scope.devices = [];
            $scope.items = [];
            $scope.filter = {};
            $scope.itemsSelectedCount = 0;
            $scope.params = {
                deviceId: isNaN(+$state.params.deviceId) ? undefined : $state.params.deviceId
            };
            $scope.gridOptions = {
                data: 'items',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                onRegisterApi: function(gridApi) {
                    $scope.gridOptions.gridApi = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.itemsSelectedCount = gridApi.grid.selection.selectedCount;

                        if($scope.itemsSelectedCount) {
                            $scope.setItem(angular.copy(row.entity));
                        } else {
                            $scope.setNewItem();
                        }
                    });

                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                        $scope.itemsSelectedCount = gridApi.grid.selection.selectedCount;

                        if($scope.itemsSelectedCount == 1) {
                            $scope.setItem(angular.copy(rows[0].entity));
                        } else {
                            $scope.setNewItem();
                        }
                    });
                }
            };

            getDevices();
        })
})();
