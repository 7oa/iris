(function () {
    angular.module('iris_gs_ringbuild_mgt').controller('ModuleJackConfigurationViewCtrl',
        function ($scope, $state, $translate, $q, JackConfigurationService, 
                  DataSeriesService, IrisUnitsService) {

            var requestJackConfigurations = function () {
                $scope.jackConfigurations = [];
                JackConfigurationService.getJackConfigurations($state.params.deviceId)
                    .then(jackConfigurations => {
                        jackConfigurations.sort((a,b) => a.orderIndex - b.orderIndex);

                        var order = 0;
                        jackConfigurations.forEach(s => s.orderIndex = order++);

                        $scope.jackConfigurations = jackConfigurations;
                    });
            };
            requestJackConfigurations();

            $scope.createJackConfiguration = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.jackConfiguration = {
                    deviceId: $state.params.deviceId
                }
            };
            $scope.createJackConfiguration();

            $scope.saveJackConfiguration = function () {
                JackConfigurationService.saveJackConfiguration($scope.jackConfiguration).then(jackConfiguration => {
                    alertify.success($translate.instant('label.ringBuild.JackConfigurationSaved'));
                    requestJackConfigurations();
                    $scope.createJackConfiguration();
                });
            };
            
            $scope.openSelectDSModal = function () {
                var ds = $scope.jackConfiguration.dataSeries ? [$scope.jackConfiguration.dataSeries] : [];
                if($scope.jackConfiguration.dataSeries){
                    $scope.jackConfiguration.dataSeries = null;
                    return;
                }

                return DataSeriesService.openSelectDSListModal({
                    'params': () => {
                        return {
                            is_multiple: false,
                            result: ds
                        }
                    }
                }).then(function (ds) {
                    console.log('selected ds: ', ds);
                    $scope.jackConfiguration.dataSeries = ds;
                });
            };
            
            $scope.gridOptions = {
                data: 'jackConfigurations',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'angle',
                        width: '*',
                        displayName: $translate.instant('label.ringBuild.angle')
                    },
                    {
                        field: 'orientationId',
                        width: '*',
                        displayName: $translate.instant('label.ringBuild.orientationId'),
                    },
                    {
                        field: 'dataSeries.name',
                        width: '*',
                        displayName: $translate.instant('label.ringBuild.dataseriesName'),
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
                                    ng-click="grid.appScope.removeJackConfiguration(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.jackConfiguration.id == row.entity.id) {
                            $scope.createJackConfiguration();
                        } else {
                            $scope.jackConfiguration = angular.copy(row.entity);
                        }
                    });
                },
                gridFooterTemplate: `<div iris-ui-grid-footer></div>`
            };

            $scope.removeJackConfiguration = function (jackConfiguration) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        JackConfigurationService.removeJackConfiguration(jackConfiguration).then(jackConfiguration => {
                            alertify.success($translate.instant('label.ringBuild.JackConfigurationRemoved'));
                            requestJackConfigurations();
                            $scope.createJackConfiguration();
                        });
                    }
                });
            }

        })
})();
