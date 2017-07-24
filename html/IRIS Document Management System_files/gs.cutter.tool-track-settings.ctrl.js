(function () {
    'use strict';

    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterTrackSettingsViewCtrl',
        function ($scope, $state, $timeout, $translate, IrisUnitsService, CutterTrackSettingsService, DeviceSettingsService) {

            $scope.aliases = CutterTrackSettingsService.getTrackSettings();

            $scope.units = IrisUnitsService.getUnits();
            var deviceId = $state.params.deviceId;

            var requestTrackSettings = function () {
                $scope.deviceSetting = {};
                $scope.trackSettings = [];
                DeviceSettingsService.getDeviceSettingsById('cuttertool', deviceId)
                    .then(setting => {
                        $scope.deviceSetting = setting;
                        setting.settings = setting.settings || {};
                        setting.settings.trackSettings = setting.settings.trackSettings || [];
                        $scope.trackSettings = $scope.aliases.map(alias => {
                            var exist = setting.settings.trackSettings.filter(s => s.alias == alias.id)[0];
                            alias.alias = alias.id;
                            alias.label = alias.name;
                            return exist || alias;
                        });

                        $scope.trackSettings.sort((a,b) => a.order - b.order);

                        var order = 0;
                        $scope.trackSettings.forEach(s => s.order = order++);

                        $scope.trackSettings.sort((a,b) => a.order - b.order);

                        // It's help to correct imagine ui-grid
                        $timeout(function() {
                            $scope.gridOptions.gridAPI.core.handleWindowResize();
                            $scope.gridOptions.gridAPI.core.queueGridRefresh();
                        });
                    });
            };
            requestTrackSettings();

            $scope.saveCutterTrackSettings = function () {
                $scope.deviceSetting.settings.trackSettings = $scope.trackSettings;
                DeviceSettingsService.saveDeviceSettings('cuttertool', $scope.deviceSetting, deviceId).then(function (settings) {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    requestTrackSettings();
                });
            };

            var clearTrackSetting = function () {
                $scope.trackSetting = {};
                $scope.selectedUnits = [];
            };
            clearTrackSetting();

            $scope.toggleIsShown = function(setting) {
                setting.isShown = !setting.isShown;
                $scope.saveCutterTrackSettings();
            };

            $scope.saveTrackSetting = function () {
                var trackSetting = $scope.trackSettings.find(ts => $scope.trackSetting.alias == ts.alias);
                if(!trackSetting) return;

                angular.extend(trackSetting, $scope.trackSetting);
                $scope.gridOptions.gridAPI.selection.clearSelectedRows();

                $scope.saveCutterTrackSettings();

                clearTrackSetting();
            };

            $scope.gridOptions = {
                data: 'trackSettings',
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
                        if ($scope.trackSetting.alias == row.entity.alias) {
                            clearTrackSetting();
                        } else {
                            $scope.trackSetting = angular.copy(row.entity);
                            $scope.selectedUnits = $scope.trackSetting.unit ? $scope.units[$scope.trackSetting.unit].possibleConvert : [];
                        }
                    });


                    if(gridApi.draggableRows) {
                        gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {
                            //console.log("Dropped", info, dropTarget);
                            //info.draggedRowEntity.order = info.toIndex;
                            //info.targetRowEntity.order = info.fromIndex;

                            if (info.toIndex == info.fromIndex) return;
                            var shift = info.toIndex < info.fromIndex ? 1 : -1,
                                shiftBegin = Math.min(info.toIndex, info.fromIndex),
                                shiftEnd = Math.max(info.toIndex, info.fromIndex);
                            $scope.trackSettings.forEach(s => {
                                if (s.order >= shiftBegin && s.order <= shiftEnd) s.order = s.order + shift;
                            });
                            info.draggedRowEntity.order = info.toIndex;
                        });
                    }
                },
                rowTemplate: `<div iris-ui-grid-row-draggable></div>`
            };
        })
})();
