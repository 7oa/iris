(function () {
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterAdvanceOptionsViewCtrl',
        function ($scope, $state, $translate, IrisUnitsService, CutterTrackSettingsService, DeviceSettingsService) {

            $scope.aliases = CutterTrackSettingsService.getAdvanceOptionss();

            var deviceId = $state.params.deviceId;

            var requestAdvanceOptions= function () {
                $scope.deviceSetting = {};
                $scope.advanceOptions = [];
                DeviceSettingsService.getDeviceSettingsById('cuttertool', deviceId)
                    .then(setting => {
                        $scope.deviceSetting = setting;
                        setting.settings = setting.settings || {};
                        $scope.advanceOptions = setting.settings.advanceOptions || [];
                    });
            };
            requestAdvanceOptions();

            $scope.saveCutterAdvanceOptions = function () {
                $scope.deviceSetting.settings.advanceOptions = $scope.advanceOptions;
                DeviceSettingsService.saveDeviceSettings('cuttertool', $scope.deviceSetting, deviceId).then(function (settings) {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                });
            };

            $scope.removeAdvanceOption = function (advanceOption) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                      //  var i = $scope.trackSettings.indexOf(trackSetting);
                        for( var i in $scope.advanceOptions){
                            if($scope.advanceOptions[i].alias=advanceOption.alias){
                                $scope.advanceOptions.splice(i, 1);
                                $scope.saveCutterAdvanceOptions();
                            }
                        }
                        clearAdvanceOption();
                    }
                });
            };

            var clearAdvanceOption = function () {
                $scope.advanceOption = {};
            };
            clearAdvanceOption();

            $scope.saveCutterAdvanceOption = function () {
                var index;
                if($scope.advanceOption.isSelected){
                    $scope.advanceOptions.forEach((ts, i) => {
                        if($scope.advanceOption.alias == ts.alias) {
                            ts.isSelected=false;
                        }
                    });

                }

                if(index >=0) {
                    $scope.advanceOptions[index] = $scope.advanceOption;
                } else {
                    $scope.advanceOptions.push($scope.advanceOption);
                }
                clearAdvanceOption();
            };

            $scope.gridOptions = {
                data: 'advanceOptions',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'alias',
                        width: '*',
                        displayName: $translate.instant('label.DisplayName'),
                        cellFilter: 'IrisFilterField:[grid.appScope.aliases]'
                    },
                    {
                        field: 'label',
                        width: '*',
                        displayName: $translate.instant('label.Label')
                    },
                    {
                        field: 'isSelected',
                        width: '*',
                        displayName: $translate.instant('label.Selected'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i ng-if="row.entity.isSelected" class="fa fa-check"></i>
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
                                    ng-click="grid.appScope.removeTrackSettings(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) { //todo need help
                        if ($scope.advanceOption.alias == row.entity.alias) {
                            clearTrackSetting();
                        } else {
                            $scope.advanceOption = angular.copy(row.entity);
                        }
                    });
                }
            };

        })
})();
