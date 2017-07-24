(function () {
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterMaintenancePlanViewCtrl',
        function ($scope, $state, $timeout, $translate, IrisUnitsService, CutterTrackSettingsService, DeviceSettingsService) {

            $scope.aliases = CutterTrackSettingsService.getMaintenanceSettings();

            $scope.units = IrisUnitsService.getUnits();
            var deviceId = $state.params.deviceId;

            var requestMaintenanceSettings = function () {
                $scope.deviceSetting = {};
                $scope.maintenanceSettings = [];
                DeviceSettingsService.getDeviceSettingsById('cuttertool', deviceId)
                    .then(setting => {
                        $scope.deviceSetting = setting;
                        setting.settings = setting.settings || {};
                        setting.settings.maintenanceSettings = setting.settings.maintenanceSettings || [];
                        $scope.maintenanceSettings = $scope.aliases.map(alias => {
                            var exist = setting.settings.maintenanceSettings.filter(s => s.alias == alias.id)[0];
                            alias.alias = alias.id;
                            alias.label = alias.name;
                            return exist || alias;
                        });

                        var order = 0;
                        $scope.maintenanceSettings.forEach(s => {
                            if(!s.order && s.order != 0) s.order = order++;
                        });

                        $scope.maintenanceSettings.sort((a,b) => a.order - b.order);

                        // It's help to correct imagine ui-grid
                        $timeout(function() {
                            console.log('refresh ui-grid');
                            $scope.gridOptions.gridAPI.core.handleWindowResize();
                            $scope.gridOptions.gridAPI.core.queueGridRefresh();
                        });
                    });
            };
            requestMaintenanceSettings();

            $scope.saveCutterMaintenanceSettings = function () {
                $scope.deviceSetting.settings.maintenanceSettings = $scope.maintenanceSettings;
                DeviceSettingsService.saveDeviceSettings('cuttertool', $scope.deviceSetting, deviceId).then(function (settings) {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    requestMaintenanceSettings();
                });
            };

            var clearMaintenanceSetting = function () {
                $scope.maintenanceSetting = {};
                $scope.selectedUnits = [];
            };
            clearMaintenanceSetting();

            $scope.toggleIsShown = function(setting) {
                setting.isShown = !setting.isShown;
                $scope.saveCutterMaintenanceSettings();
            };

            $scope.saveMaintenanceSetting = function () {
                var maintenanceSetting = $scope.maintenanceSettings.find(ts => $scope.maintenanceSetting.alias == ts.alias);
                if(!maintenanceSetting) return;

                angular.extend(maintenanceSetting, $scope.maintenanceSetting);
                $scope.gridOptions.gridAPI.selection.clearSelectedRows();

                $scope.saveCutterMaintenanceSettings();

                clearMaintenanceSetting();
            };

            $scope.gridOptions = {
                data: 'maintenanceSettings',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'alias',
                        width: '*',
                        displayName: $translate.instant('label.DisplayName'),
                        enableSorting: false,
                        cellFilter: 'IrisFilterField:[grid.appScope.aliases]'
                    },
                    {
                        field: 'isShown',
                        width: 60,
                        enableSorting: false,
                        displayName: $translate.instant('label.IsShown'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link btn-sm"
                                    ng-click="grid.appScope.toggleIsShown(row.entity); $event.stopPropagation();">
                                <i class="fa"
                                   ng-class="row.entity.isShown ? 'fa-check text-success' : 'fa-times text-danger'"></i>
                            </button>
                        </div>`
                    },
                    {
                        field: 'label',
                        width: '*',
                        enableSorting: false,
                        displayName: $translate.instant('label.Label'),
                        cellFilter: 'irisTranslate : row.entity.translations.label'
                    },
                    {
                        field: 'decimal',
                        width: 60,
                        enableSorting: false,
                        displayName: $translate.instant('label.Digits')
                    }/*,
                    {
                        field: 'unit',
                        width: 60,
                        enableSorting: false,
                        displayName: $translate.instant('label.Unit'),
                        cellFilter: `irisUnits:'short':true`
                    }*/
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) { //todo need help
                        if ($scope.maintenanceSetting.alias == row.entity.alias) {
                            clearMaintenanceSetting();
                        } else {
                            $scope.maintenanceSetting = angular.copy(row.entity);
                            $scope.selectedUnits = $scope.maintenanceSetting.unit ? $scope.units[$scope.maintenanceSetting.unit].possibleConvert : [];
                        }
                    });

                    if(gridApi.draggableRows) {
                        gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {
                            console.log("Dropped", info, dropTarget);
                            info.draggedRowEntity.order = info.toIndex;
                            info.targetRowEntity.order = info.fromIndex;
                        });
                    }
                },
                rowTemplate: `<div iris-ui-grid-row-draggable></div>`
            };
        })
})();
