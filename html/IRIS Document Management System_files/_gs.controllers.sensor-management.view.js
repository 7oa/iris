(function () {

    angular.module('iris_gs_sensor_management_view', []);

    //region interval-scanner view controller ModuleIntervalScannersViewCtrl
    angular.module('iris_gs_sensor_management_view').controller('ModuleIntervalScannersViewCtrl',

        function ($scope,
                  $controller,
                  $translate,
                  $state,
                  $uibModal,
                  $filter,
                  $timeout,
                  uiGridConstants,
                  IntervalScannerService,
                  ProjectDeviceService) {

            $scope.refresh = function () {
                if ($state.params.deviceId) {
                    IntervalScannerService.getScanners($state.params.deviceId)
                        .then(result => $scope.scanners = result);
                }
            };

            $scope.activateFrom = function (id, boundaries) {
                console.log(id, boundaries);
                var date;
                if (boundaries && boundaries.date_end) {
                    date = boundaries.date_end;
                }
                IntervalScannerService.activateScanner($state.params.deviceId, id, true, date).then(function () {
                    $scope.refresh();
                });
            };

            $scope.activate = function (id, active) {
                if (active) {
                    $scope.boundaries = {};
                    $scope.projectDeviceId = {};
                    $uibModal.open({
                        template: `
                            <div class="modal-header">
                                <h4 class="modal-title"> {{'label.DateFrom' | translate}}</h4>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-xs-12">
                                        <div iris-boundaries
                                             layout="'vertical'"
                                             timezone="timezone"
                                             mode="specific"
                                             show-refresh-button="true"
                                             project-device="projectDeviceId"
                                             on-update="getBoundaries(boundaries)"
                                             value="boundaries"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-success" ng-click="$close(boundaries)">
                                    <i class="fa fa-check"></i> {{'label.Activate' | translate}}
                                </button>
                            </div>`,
                        resolve: {
                            'projectDeviceId':  function (ProjectDeviceService) {
                                return ProjectDeviceService.getAllProjectDevices().then(result=> {
                                    console.log(result, $state.params.deviceId)
                                    $scope.projectDevice = result.find(pd => pd.deviceId == $state.params.deviceId);
                                    console.log($scope.projectDevice);
                                    return $scope.projectDevice && $scope.projectDevice.id || null
                                });
                            }
                        },
                        controller: function($scope, projectDeviceId, $uibModalInstance) {
                            $scope.projectDeviceId = projectDeviceId;
                            $scope.boundaries = {};
                            $scope.getBoundaries = function(boundaries){
                                console.log(boundaries)
                                $scope.boundaries=boundaries;
                                $uibModalInstance.close(boundaries) //fixme !!!
                            }
                        }
                    }).result.then(function (boundaries) {
                        $scope.activateFrom(id, boundaries);
                    });

                } else {
                    IntervalScannerService.activateScanner($state.params.deviceId, id, false).then(function () {
                        $scope.refresh();
                    });
                }
            };


            $scope.$watch(function () {
                return $state.params.deviceId;
            }, function () {
                $scope.refresh();
            });

            $scope.deleteScanner = function (id) {
                alertify.confirm($translate.instant('text.RemoveItemConfirm'),
                    function (e) {
                        if (e) {
                            iris.loader.start();
                            IntervalScannerService.deleteScanner($state.params.deviceId, id).then(function () {
                                $scope.refresh();
                                iris.loader.stop();
                            });
                        }
                    }
                );
            };

            $scope.gridOptions = {
                data: "scanners",
                fastWatch: true,
                showGridFooter: true,
                enablePaginationControls: false,
                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'ID',
                        enableSorting: true,
                        width: 40
                    },
                    {
                        field: 'name',
                        width: '**',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: true
                    },
                    {
                        name: 'stop.start',
                        width: 55,
                        displayName: $translate.instant('label.Actions'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <a ng-if="!row.entity.active"
                               class="btn btn-default"
                               ng-click="grid.appScope.activate(row.entity.id,true)"
                               uib-tooltip="{{'label.Activate' | translate}}">
                                <i class="fa fa-play text-success"></i>
                            </a>
                            <a ng-if="row.entity.active"
                               class="btn btn-default"
                               ng-click="grid.appScope.activate(row.entity.id,false)"
                               uib-tooltip="{{'label.Deactivate' | translate}}">
                                <i class="fa fa-stop text-danger"></i>
                            </a>
                        </div>`
                    },
                    {
                        field: 'status',
                        width: '*',
                        displayName: $translate.instant('label.Status'),
                        enableSorting: true,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents ">
                            <i ng-if="row.entity.isStarted" class="fa fa-check-circle fa-2x text-success" uib-tooltip="{{'label.Running' | translate}} "></i>
                            <i ng-if="row.entity.corrupted" class="fa fa-bug fa-pulse fa-2x text-warning" uib-tooltip="{{'label.Corrupted' | translate}}"</i>
                            <i ng-if="row.entity.isCorrectionStarted" class="fa fa-cog fa-spin fa-2x text-warning" uib-tooltip="{{'label.CorrectionStarted' | translate}}"></i>
                        </div>`
                    },
                    {
                        field: 'notUpdated',
                        width: '*',
                        displayName: $translate.instant('label.NotUpdated'),
                        enableSorting: true,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i ng-if="row.entity.notUpdated && row.entity.isStarted"
                               class="fa fa-exclamation fa-2x text-warning"
                               uib-tooltip="{{'label.NotUpdated' | translate}}"</i>
                        </div>`
                    },
                    {
                        name: 'updatedOn',
                        displayName: $translate.instant('label.UpdatedOn'),
                        width: 150,
                        enableSorting: false,
                        cellFilter: `irisTime:grid.appScope`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 100,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <a class="btn btn-default"
                               ui-sref="module.sensor-management.interval-scanners.intervals.number-range({deviceId:row.entity.deviceId,scannerId:row.entity.id})"
                               uib-tooltip="{{'label.Correction' | translate}}">
                                <i class="fa fa-line-chart text-default"></i>
                            </a>
                        </div>`
                    },
                    {
                        name: 'actions2',
                        displayName: $translate.instant('label.Actions'),
                        width: 200,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <a ui-sref="module.sensor-management.interval-scanners.edit({deviceId:row.entity.deviceId,scannerId:row.entity.id})"
                               uib-tooltip="{{'label.Edit' | translate}}"
                               class="btn btn-default">
                                <i class="fa fa-pencil"></i>
                            </a> 
                            <a class="btn btn-danger"
                               ng-click="grid.appScope.deleteScanner(row.entity.id)"
                               uib-tooltip="{{'label.Delete' | translate}}">
                                <i class="fa fa-trash-o"></i>
                            </a>
                        </div>`
                    }
                ]
            };
        }
    );

    angular.module('iris_gs_sensor_management_view').controller('ProcessIntervalEditModalCtrl',
        function ($scope, $uibModalInstance, $controller, deviceId, scannerId, interval, IntervalScannerService) {
            //angular.extend($scope, $controller('FormValidationMixin', {$scope}));

            $scope.interval = interval;

            $scope.saveInterval = function () {
                iris.loader.start('.modal-body');
                IntervalScannerService.saveInterval(deviceId, scannerId, $scope.interval)
                    .then(() => {
                        $uibModalInstance.close();
                        iris.loader.stop('.modal-body');
                    }, $scope.validateForm);
            }
        });

    angular.module('iris_gs_sensor_management_view').controller('ModuleIntervalScannersIntervalsCtrl',

        function ($scope,
                  $state,
                  $stateParams,
                  $filter,
                  $translate,
                  $uibModal,
                  IntervalScannerService,
                  scanner) {

            $scope.scannerId = $stateParams.scannerId;
            $scope.params = {};
            $scope.params.period = $scope.params.period || {};
            $scope.params.scanner = scanner;
            $scope.filters = {};

            $scope.intervals = [];

            $scope.timezone = "UTC";

            $scope.editInterval = function (id) {
                $scope.interval = id ? angular.copy($filter('filter')($scope.intervals, {id: id}, true)[0]) : {};

                $uibModal.open({
                    //templateUrl: iris.config.baseUrl + "/devicedata/templates/processinterval.edit.html",
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/other/process-interval.edit.html',
                    controller: 'ProcessIntervalEditModalCtrl',
                    resolve: {
                        'deviceId': function () {
                            return $stateParams.deviceId
                        },
                        'scannerId': function () {
                            return $scope.scannerId
                        },
                        'interval': function () {
                            return $scope.interval
                        }
                    }
                }).result.then($scope.refresh);

            };

            $scope.recalculate = function (id) {

                $scope.recalculateParams = {
                    intervalId: id,
                    deleteIntervals: false,
                    virtualSensors: false,
                    phases: false
                };
                $uibModal.open({
                    //templateUrl: iris.config.baseUrl + "/templates/recalculate.dialog.html",
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/recalculation-dialog/process-interval.recalculation.html',
                    scope: $scope
                }).result.then(function () {
                    iris.loader.start('.module-content');
                    if (!id) {
                        IntervalScannerService.recalcIntervals(
                            $stateParams.deviceId,
                            $scope.scannerId,
                            $scope.filters.recalculateDateFrom,
                            $scope.filters.recalculateDateTo,
                            $scope.recalculateParams.deleteIntervals,
                            $scope.recalculateParams.virtualSensors,
                            $scope.recalculateParams.phases
                        ).then(function () {
                            iris.loader.stop('.module-content');
                            $scope.refresh();
                        });
                    } else {
                        IntervalScannerService.recalcInterval(
                            $stateParams.deviceId,
                            $scope.scannerId,
                            id,
                            $scope.recalculateParams.deleteIntervals,
                            $scope.recalculateParams.virtualSensors,
                            $scope.recalculateParams.phases
                        ).then(function () {
                            iris.loader.stop('.module-content');
                            $scope.refresh();
                        });
                    }
                });
            };

            $scope.deleteInterval = function (id) {
                alertify.confirm($translate.instant('text.RemoveItemConfirm'),
                    function (e) {
                        if (e) {
                            iris.loader.start();
                            IntervalScannerService.deleteInterval($stateParams.deviceId, $scope.scannerId, id).then(function () {
                                $scope.refresh();
                            });
                            iris.loader.stop();
                        }
                    }
                );
            };

            $scope.dates = [];

            var getDates = function () {
                var dates = [];
                var intervals = $scope.intervals;
                for (var ind in intervals) {
                    var int = intervals[ind];
                    if (int.startTime) {
                        dates.push(int.startTime);
                    }
                    if (int.endTime) {
                        dates.push(int.endTime);
                    }
                }
                return iris.tools.getUnique(dates);
            };

            $scope.canRecalculate = function () {
                if ($scope.filters.recalculateIdFrom && $scope.filters.recalculateIdTo) {
                    var from = $scope.intervals.find((i) => i.id == $scope.filters.recalculateIdFrom);
                    $scope.filters.recalculateDateFrom = from.startTime;
                    var to = $scope.intervals.find((i) => i.id == $scope.filters.recalculateIdTo);
                    $scope.filters.recalculateDateTo = to.endTime;
                }

                return $scope.filters.recalculateDateFrom &&
                    $scope.filters.recalculateDateTo &&
                    new Date($scope.filters.recalculateDateFrom).getTime() < new Date($scope.filters.recalculateDateTo).getTime()
            };

            $scope.refresh = function () {
                iris.loader.start('.module-content');
                IntervalScannerService.getIntervals($stateParams.deviceId, $scope.scannerId).then(function (result) {
                    $scope.intervals = result;
                    $scope.dates = getDates();
                    if ($scope.dates && $scope.dates.length > 1) {
                        $scope.period = $scope.period || {};
                        var last = $scope.dates.length - 1;
                        $scope.period.date_start = $scope.period.date_start || ($scope.dates[last - 1] ? new Date($scope.dates[last - 1]) : new Date(new Date().getTime() - 3600000));
                        $scope.period.date_end = $scope.period.date_end || ($scope.dates[last] ? new Date($scope.dates[last]) : new Date());
                        $scope.refreshDates();
                    }
                    $scope.params.dates = $scope.dates;
                    $scope.params.intervals = result;
                    iris.loader.stop();
                });
            };

            $scope.refresh();

            $scope.refreshDates = function () {
                $scope.params.period = angular.copy($scope.period);
            };

            if ($state.is('intervalscanner.processinterval-list')) $state.go('intervalscanner.processinterval-list.table', $stateParams);

        }
    );

    angular.module('iris_gs_sensor_management_view').controller('ModuleIntervalScannersIntervalsRangeCtrl',

        function ($scope,
                  $state,
                  $stateParams,
                  $filter,
                  $translate,
                  uiGridConstants) {

            $scope.gridOptions = {
                data: 'intervals',
                showGridFooter: true,
                enablePaginationControls: false,
                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'ID',
                        enableSorting: true,
                        width: 60
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Number'),
                        enableSorting: true,
                        type: 'number',
                        sort: {
                            direction: uiGridConstants.DESC,
                            priority: 0
                        }
                    },
                    {
                        field: 'startTime',
                        width: 130,
                        displayName: $translate.instant('label.StartDate'),
                        enableSorting: true,
                        cellFilter: 'irisTime:this'
                    },
                    {
                        field: 'endTime',
                        width: 130,
                        displayName: $translate.instant('label.EndDate'),
                        enableSorting: true,
                        cellFilter: 'irisTime:this'
                    },
                    {
                        field: 'processed',
                        width: 70,
                        displayName: $translate.instant('label.Processed'),
                        enableSorting: true,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents ">
                            <i ng-if="row.entity.processed"
                               class="fa fa-check-circle fa-2x text-success"
                               uib-tooltip="{{'label.Processed' | translate}}"></i>
                        </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 120,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <div ng-if="row.entity.endTime!=null || !grid.appScope.scanner.isStarted">
                                <button ng-if="!grid.appScope.scanner.enabledCondensedValue && row.entity.endTime" type="button" class="btn btn-success" 
                                        ng-click="grid.appScope.recalculate(row.entity.id)">
                                    <i class="fa fa-calculator"></i> {{'label.Recalculate' | translate}}
                                </button>
                            </div>
                        </div>`
                    },
                    {
                        name: 'actions2',
                        displayName: $translate.instant('label.Actions'),
                        width: 100,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <div ng-if="row.entity.endTime!=null || !grid.appScope.scanner.isStarted">
                                <button ng-click="grid.appScope.editInterval(row.entity.id)" uib-tooltip="{{'label.Edit' | translate}}" class="btn btn-default">
                                    <i class="fa fa-pencil"></i>
                                </button> 
                                <button class="btn btn-danger" ng-click="grid.appScope.deleteInterval(row.entity.id)" 
                                        uib-tooltip="{{'label.Delete' | translate}}"><i class="fa fa-trash-o"></i>
                                </button>
                            </div>
                        </div>`
                    }
                ]
            };
        }
    );

    angular.module('iris_gs_sensor_management_view').controller('ModuleIntervalScannersIntervalsChartCtrl',
        function ($scope) {
        });


    //endregion

    //region virtual-data-series view controller

    angular.module('iris_gs_sensor_management_view').controller('ModuleVirtualDataSeriesViewCtrl',

        function ($scope,
                  $state,
                  $translate,
                  $uibModal,
                  uiGridConstants,
                  VirtualDataSeriesService,
                  IntervalScannerService,
                  DataSeriesService,
                  AlarmingService) {
            $scope.virtualDataSeriesList = [];

            $scope.refresh = function () {
                VirtualDataSeriesService.getByDeviceId($scope.getSelectedDeviceId())
                    .then(result => {
                        console.log('virtual ds list', result);
                        $scope.virtualDataSeriesList = result;
                    });
            };

            $scope.alarmLevelSelections = [{ value: 'all', label: $translate.instant('label.All')},
                { value: 'nolimits', label: $translate.instant('label.NoAlarmLimits')}];
            AlarmingService.getLevels($scope.getSelectedDeviceId()).then(levels => {
                angular.forEach(levels, level => {
                    $scope.alarmLevelSelections.push({
                        value: level.id,
                        label: level.name
                    });
                });
            });

            $scope.recalc = {};

            $scope.recalculate = function () {

                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/recalculation-dialog/virtual.dataseries.recalculation.html',
                    scope: $scope
                }).result.then(function (recalc) {
                    //console.log('$scope', $scope.recalc);
                    if ($state.params.deviceId) {
                        iris.loader.start();
                        IntervalScannerService.recalcByDevice(
                            $state.params.deviceId,
                            recalc.from,
                            recalc.to,
                            false, //delete intervals
                            true,  //virtual
                            false  //phases
                        ).then(function () {
                            $scope.refresh();
                            iris.loader.stop();
                        });
                    }
                });
            };

            $scope.openDataseriesMapTree = function (id) {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/sensor-mgmt/dataseries.map.html',
                    controller: 'DataSeriesMapModalCtrl',
                    size: 'xl',
                    resolve: {
                        'dataseries': function (DataSeriesService) {
                            return DataSeriesService.getDeviceDataseriesDependancies($state.params.deviceId, id)
                        },
                        'dsId': function () {
                            return id;
                        }
                    }
                });
            };

            $scope.$watch(function () {
                return $state.params.deviceId;
            }, function () {
                $scope.refresh();
            });

            $scope.delete = function (vdseries) {
                alertify.confirm($translate.instant('label.ConfirmDeleteVirtualDataSeries'),
                    function (e) {
                        if (e) {
                            iris.loader.start();
                            VirtualDataSeriesService.deleteSeries(vdseries).$promise.then(function () {
                                $scope.refresh();
                            }).finally(function () {
                                iris.loader.stop();
                            });
                        }
                    }
                );
            };

            $scope.editAlarmLimitsForVirtualDs = function (virtualDs) {
                console.log('edit alarm limit ds', virtualDs);
                DataSeriesService.getById(virtualDs.targetDataSeriesID).then(ds => {
                    ds.observed = virtualDs.observed;
                    AlarmingService.openSetAlarmLimitsModal(ds).then(function (limitContainer) {
                        console.log('finished with limits', limitContainer);

                        virtualDs.observed = ds.observed;
                        VirtualDataSeriesService.saveSeries(virtualDs).then(() => {
                            angular.forEach(limitContainer.remove, limitToRemove => {
                                AlarmingService.removeLimit(limitToRemove, ds.id);
                                $scope.refresh();
                            });
                            angular.forEach(limitContainer.save, limitToSave => {
                                AlarmingService.saveLimit(limitToSave, ds);
                                $scope.refresh();
                            });
                        });
                    });
                });
            };

            $scope.gridOptions = {
                data: 'virtualDataSeriesList',
                showGridFooter: true,
                enablePaginationControls: false,
                enableFiltering: true,
                columnDefs: [
                    {
                        field: 'id',
                        displayName: $translate.instant('label.Id'),
                        enableSorting: true,
                        enableFiltering: false,
                        width: 50
                    },
                    {
                        field: 'targetDataSeriesID',
                        displayName: $translate.instant('label.TargetId'),
                        enableSorting: true,
                        width: 60
                    },
                    {
                        field: 'targetDataSeriesName',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: true
                    },
                    {
                        field: 'targetDataSeriesUnit',
                        displayName: $translate.instant('label.Unit'),
                        enableSorting: true,
                        enableFiltering: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.targetDataSeriesUnit | irisUnits:\'short\'}}</div>'
                    },
                    {
                        field: 'active',
                        displayName: $translate.instant('label.ActiveAndRunning'),
                        enableSorting: true,
                        enableFiltering: false,
                        cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-play" ng-if="row.entity.active" ng-style="{color: \'#93BE3D;\'}"></i>' +
                        '<i class="fa fa-stop" ng-if="!row.entity.active" ng-style="{color: \'#D74C0C\'}"></i></div>'
                    }, {
                        name: 'alarmLimit',
                        displayName: $translate.instant('label.AlarmLimits'),
                        width: '*',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: $scope.alarmLevelSelections,
                            condition: function(searchTerm, cellValue) {
                                if (!searchTerm || searchTerm === 'all') {
                                    return true;
                                }
                                else if (searchTerm === 'nolimits') {
                                    if (!cellValue || !cellValue.length) {
                                        return true;
                                    }
                                    return false;
                                }
                                else if (angular.isNumber(searchTerm) && cellValue.length) {
                                    for (var limit of cellValue) {
                                        if (limit.level.id === searchTerm) {
                                            return true;
                                        }
                                    }
                                    return false;
                                }
                                return false;
                            }
                        },
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{row.entity.alarmLimit.length}} {{'label.configured' |  translate}}
                            </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 300,
                        enableSorting: false,
                        enableFiltering: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <a href="javascript:void(0)"
                                ng-click="grid.appScope.editAlarmLimitsForVirtualDs(row.entity)"
                                class="btn btn-default">
                                    <i class="fa fa-bell" ng-if="row.entity.observed"></i>
                                    <i class="fa fa-bell-slash" ng-if="!row.entity.observed"></i>
                            </a>
                            <a ng-click="grid.appScope.openDataseriesMapTree(row.entity.targetDataSeriesID)" class="btn btn-default" uib-tooltip="{{'label.Diagram' | translate}}">
                                 <i class="fa fa-picture-o"></i>
                            </a>
                            <a ui-sref="^.edit({vdseriesId:row.entity.id})" class="btn btn-default" uib-tooltip="{{'label.Edit' | translate}}">
                                <i class="fa fa-pencil"></i> {{'label.Edit' | translate}}
                            </a>
                            <button class="btn btn-danger" ng-click="grid.appScope.delete(row.entity)" uib-tooltip="{{'label.Delete' | translate}}">
                                <i class="fa fa-trash-o">
                                </i>
                            </button>
                        </div>`
                    }
                ]
            };
        }
    );
    //endregion

    //region SensorGroup ModuleSensorGroupsViewCtrl
    angular.module('iris_gs_sensor_management_view').controller('ModuleSensorGroupsViewCtrl',
        function ($scope,
                  $state,
                  $translate,
                  $uibModal,
                  $stateParams,
                  SecurityService,
                  SensorGroupsService,
                  GlobalSettingsService) {
            const MODULE_SENSOR_GROUPS = 'sensor-groups';

            $scope.sensorsGroups = [];

            $scope.refresh = function () {
                SensorGroupsService.getSensorGroups($scope.getSelectedDeviceId()).then(function (result) {
                    $scope.sensorsGroups = result;
                    /*if (result.length <= $scope.gridOptions.paginationPageSize) {
                     $scope.gridOptions.enablePaginationControls = false;
                     } else {
                     $scope.gridOptions.enablePaginationControls = true;
                     }*/
                });
            };

            $scope.delete = function (sensorGroup) {
                alertify.confirm($translate.instant('text.RemoveItemConfirm'),
                    function (e) {
                        if (e) {
                            iris.loader.start();
                            SensorGroupsService.deleteSensorGroup(sensorGroup).then(()=> {
                                iris.loader.stop();
                                $scope.refresh();
                            });
                        }
                    }
                );
            };

            $scope.openModuleSettingsModal = function (row) {
                GlobalSettingsService.openEditModuleSettings($stateParams.module, MODULE_SENSOR_GROUPS,
                    row && row.entity ? row.entity.id : null, $scope.getSelectedDeviceId())
                    .then(() => $scope.refresh());
            };
            $scope.showSensorsForGroupId = function (groupId) {
                console.log('state', $state.current.name);
                $state.go('^.manage-sensors', {
                    'sensorGroupId': groupId
                });
            };

            $scope.gridOptions = {
                data: 'sensorsGroups',
                enablePaginationControls: false,
                showGridFooter: true,
                columnDefs: [
                    {
                        field: 'name',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: true
                    },
                    {
                        field: 'indexName',
                        displayName: $translate.instant('label.SystemIndexName'),
                        enableSorting: true
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 320,
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <a href="javascript:void(0)" ng-click="grid.appScope.showSensorsForGroupId(row.entity.id)"
                                   class="btn btn-default">
                                    <i class="fa fa-arrow-circle-right"></i>
                                    {{::'label.Sensors' | translate}}
                                </a>
                                <button class="btn btn-default" ng-click="grid.appScope.openSetRightModal(row.entity)">
                                    <i class="fa fa-shield"></i>
                                    {{::'label.SetPermissions' | translate}}
                                </button>
                                <a ng-click="grid.appScope.openModuleSettingsModal(row)"
                                   uib-tooltip="{{::'label.Edit' | translate}}"
                                   class="btn btn-default">
                                    <i class="fa fa-pencil"></i>
                                </a>
                                <button class="btn btn-danger" ng-click="grid.appScope.delete(row.entity)" uib-tooltip="{{\'label.Delete\' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ]
            };
            $scope.refresh();

            $scope.openSetRightModal = function (sensorGroup) {
                SecurityService.openSubjectPermissionsModal('SensorGroup', sensorGroup.id, ['access'], [false]);
            }
        });


    angular.module('iris_gs_sensor_management_view').controller('ModuleSensorGroupsEditSensor',
        function ($scope,
                  $state,
                  $translate,
                  $uibModal,
                  $stateParams,
                  SensorGroupsService,
                  DevicesService,
                  GlobalSettingsService) {

            $scope.sensorGroupSensors = [];

            $scope.sensorGroups = [];

            $scope.sensorGroupId = $stateParams.sensorGroupId;

            $scope.refresh = function () {
                SensorGroupsService.getSensorGroups($scope.getSelectedDeviceId()).then(function (result) {
                    $scope.sensorGroups = result;
                });
                SensorGroupsService.getSensorGroup($scope.getSelectedDeviceId(), $stateParams.sensorGroupId).then(function (result) {
                    $scope.sensorGroup = result;
                    $scope.sensorGroupSensors = $scope.sensorGroup.sensors;
                    console.log(result.sensors.length);
                });
            };

            $scope.addSensors = function () {
                GlobalSettingsService.openEditModuleSettings($stateParams.module, 'edit-sensors',
                    $scope.sensorGroup.id, $scope.getSelectedDeviceId())
                    .then((ids) => $scope.refresh());
            };

            $scope.setSensorGroup = function () {
                $stateParams.sensorGroupId = $scope.sensorGroupId;
                $scope.refresh();
            };

            $scope.gridOptions = {
                data: 'sensorGroupSensors',
                enablePaginationControls: false,
                showGridFooter: true,
                columnDefs: [
                    {
                        name: 'name',
                        displayName: $translate.instant('label.Name'),
                        width: '*'
                    }, {
                        name: 'sensorDataSourceType',
                        displayName: $translate.instant('label.SensorDataSourceType'),
                        width: '*'
                    }, {
                        name: 'systemIndexName',
                        displayName: $translate.instant('label.SystemIndexName'),
                        width: '*'
                    }
                ]
            };

            $scope.gridOptions.enableFiltering = true;

            $scope.refresh();

        });
    //endregion

})();