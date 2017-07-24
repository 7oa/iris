(function () {
    angular.module('iris_gs_reporting_mgmt').controller('ModuleWorkDaysConfigurationsViewCtrl',
        function ($scope, $state, $translate, $q, WorkDaysConfigurationService, DataSeriesService, ShiftModelService) {

            $scope.conditionOptions = WorkDaysConfigurationService.getConditionOptions();
            $scope.shiftModelBundles = [];
            ShiftModelService.findAllBundlesByProject($state.params.projectId).then(bundles => {
                    console.log(bundles);
                    $scope.shiftModelBundles = bundles;
                });

            function refreshShiftBundleStartTime(shiftBundleId) {
                if (shiftBundleId) {
                    ShiftModelService.findAllByBundleId(shiftBundleId).then(res => {
                        $scope.workDaysConfiguration && ($scope.workDaysConfiguration.shiftBundleStartTime = ShiftModelService.getBundleStartTime(res));
                    })
                } else {
                    $scope.workDaysConfiguration && ($scope.workDaysConfiguration.shiftBundleStartTime = null);
                }
            }

            $scope.$watch("workDaysConfiguration.shiftBundlesIds", function(nv, ov) {
                if (angular.equals(nv, ov)) return;
                refreshShiftBundleStartTime(nv && nv.length && nv[0]);
            }, true);

            var requestWorkDaysConfigurations = function () {
                $scope.workDaysConfigurations = [];
                WorkDaysConfigurationService.getWorkDaysConfigurations($state.params.projectId)
                    .then(workDaysConfigurations => {
                        workDaysConfigurations.sort((a,b) => a.orderIndex - b.orderIndex);

                        var order = 0;
                        workDaysConfigurations.forEach(s => s.orderIndex = order++);

                        $scope.workDaysConfigurations = workDaysConfigurations;
                    });
            };
            requestWorkDaysConfigurations();

            $scope.createWorkDaysConfiguration = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.workDaysConfiguration = {
                    projectId: $state.params.projectId,
                    startTime: '00:00'
                }
            };
            $scope.createWorkDaysConfiguration();

            $scope.saveWorkDaysConfiguration = function () {
                $scope.workDaysConfiguration.shiftBundles = $scope.workDaysConfiguration.shiftBundlesIds
                    && $scope.workDaysConfiguration.shiftBundlesIds.map(b => {return {id: b}});
                WorkDaysConfigurationService.saveWorkDaysConfiguration($scope.workDaysConfiguration).then(workDaysConfiguration => {
                    alertify.success($translate.instant('label.reporting.WorkDaysConfigurationSaved'));
                    requestWorkDaysConfigurations();
                    $scope.createWorkDaysConfiguration();
                });
            };

            $scope.gridOptions = {
                data: 'workDaysConfigurations',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    }, {
                        field: 'isDefault',
                        width: 80,
                        displayName: $translate.instant('label.IsDefault'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <i class="fa fa-check text-success" ng-if="row.entity.isDefault"></i>  
                            </div>`
                    }, {
                        field: 'startTime',
                        width: 80,
                        displayName: $translate.instant('label.StartTime')
                    }, {
                        field: 'shiftBundles',
                        width: '*',
                        displayName: $translate.instant('label.reporting.ShiftBundles'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <span ng-repeat="b in row.entity.shiftBundles" 
                                      class="items-list">
                                      {{b.title}}
                                </span>  
                            </div>`
                    }, {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.reporting.Condition'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                {{row.entity.conditionDataSeries.name}} {{row.entity.conditionOption}} {{row.entity.conditionValue}}
                            </div>`
                    }, {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 100,
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <button class="btn btn-link"
                                        uib-tooltip="{{'label.Remove' | translate}}"
                                        ng-click="grid.appScope.removeWorkDaysConfiguration(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                            </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.workDaysConfiguration.id == row.entity.id) {
                            $scope.createWorkDaysConfiguration();
                        } else {
                            $scope.workDaysConfiguration = angular.copy(row.entity);
                            $scope.workDaysConfiguration.shiftBundlesIds = $scope.workDaysConfiguration.shiftBundles
                                && $scope.workDaysConfiguration.shiftBundles.map(b => b.id);
                            refreshShiftBundleStartTime($scope.workDaysConfiguration.shiftBundlesIds.length && $scope.workDaysConfiguration.shiftBundlesIds[0]);
                        }
                    });

                }
            };

            $scope.removeWorkDaysConfiguration = function (workDaysConfiguration) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        WorkDaysConfigurationService.removeWorkDaysConfiguration(workDaysConfiguration).then(workDaysConfiguration => {
                            alertify.success($translate.instant('label.reporting.WorkDaysConfigurationRemoved'));
                            requestWorkDaysConfigurations();
                            $scope.createWorkDaysConfiguration();
                        });
                    }
                });
            };

            $scope.openSelectDSModal = function () {
                var ds = $scope.workDaysConfiguration.conditionDataSeries ? [$scope.workDaysConfiguration.conditionDataSeries] : [];
                if($scope.workDaysConfiguration.conditionDataSeries){
                    $scope.workDaysConfiguration.conditionDataSeries = null;
                    return;
                }

                return DataSeriesService.openSelectDSListModal({
                    'params': () => {
                        return {
                            is_multiple: false,
                            result: ds,
                            project_id: $state.params.projectId
                        }
                    }
                }).then(function (ds) {
                    console.log('selected ds: ', ds);
                    $scope.workDaysConfiguration.conditionDataSeries = ds;
                });
            };

            $scope.setTimeFromShift = function () {
                
            }

        })
})();