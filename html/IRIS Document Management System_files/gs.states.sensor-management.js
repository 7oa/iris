
(function() {

    //region module-sensor-management states
    angular.module('iris_gs_sensor_management_states', []);

    /**
     * sensor management base controller
     *
     * Used as the parent controller for all the view and edit controllers in module sensor-management.
     * It's purpose is to provide a central point for device selection, an api for controllers within
     * its scope and finally a "goto concrete state" switch if the user navigates into the module by
     * addressing the parent state.
     */
    angular.module('iris_gs_sensor_management_states').controller('ModuleSensorManagementBaseCtrl',

        function($scope, $state, devices) {
            $scope.devices = devices;

            var haveDevices         = devices ? !!devices.length : false;
            var deviceNotSetOrFound =
                !$state.params.deviceId ||
                $state.params.deviceId == '-' ||
                (haveDevices && !devices.filter(function(o){return o.id == $state.params.deviceId;}).length);

            // Redirect to self with a valid device, if it was not set !
            if(deviceNotSetOrFound && haveDevices) {
                $state.params.deviceId = devices[0].id;
                $state.go($state.current.name,$state.params,{reload:true});
            }

            $scope.getSelectedDeviceId = function() {
                return $scope.devices ? +$scope.devices.selectedId : 0;
            };

            $scope.getSelectedDevice = function() {
                if(!$scope.devices || !$scope.devices.length || !$scope.devices.selectedId)
                    return null;
                var filterResult = $scope.devices.filter(function(o){return o.id == $scope.devices.selectedId;});
                return filterResult.length ? filterResult[0] : null;
            };

            $scope.refresh = function(force) {
                if($scope.devices.selectedId != $state.params.deviceId || force) {
                    $scope.devices.selected = $scope.getSelectedDevice();
                    $state.params.deviceId  = $scope.devices.selectedId;
                    $state.go($state.current.name,$state.params,{reload:true});
                }
            };

            $scope.$watch("devices.selectedId",function(){$scope.refresh();});

            if($state.params.deviceId && devices.filter(function(o){return o.id == $state.params.deviceId;}).length) {
                $scope.devices.selectedId = $state.params.deviceId;
            } else {
                $scope.devices.selectedId = $scope.devices.length ? $scope.devices[0].id : 0;
            }

            $scope.devices.selected =  $scope.getSelectedDevice();
            $state.params.deviceId  = +$scope.devices.selectedId;

            // If the state directly addresses this controller, try to forward it to a child controller.
            if($state.is("module.sensor-management")) {
                if($state.params.deviceId) {
                    $state.go("module.sensor-management.interval-scanners", $state.params);
                }
            }
        }
    );

    angular.module('iris_gs_sensor_management_states').config(
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('module.sensor-management', {
                    url: '/device/:deviceId',
                    template: '<div class="b-content flex-grid" ui-view></div>',
                    resolve: {
                        devices: ["DevicesService", function (DevicesService) {
                            return DevicesService.requestDevices();
                        }]
                    },
                    controller: 'ModuleSensorManagementBaseCtrl'
                });
        }
    );
    //endregion

    //region interval-scanner states
    angular.module('iris_gs_sensor_management_states').config(
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('module.sensor-management.interval-scanners',{
                    url:        '/interval-scanners',
                    template:   '<div class="flex-col-auto b-window" ui-view></div>',
                    controller: ["$state",function($state){
                        if($state.is("module.sensor-management.interval-scanners")) {
                            $state.go("module.sensor-management.interval-scanners.view",$state.params);
                        }
                    }]
                })
                .state('module.sensor-management.interval-scanners.view',{
                    url:        '/list',
                    controller: 'ModuleIntervalScannersViewCtrl',
                    templateUrl:iris.config.componentsUrl + '/global-settings/templates/module.settings.sensor-management.interval-scanners.view.html'
                })
                .state('module.sensor-management.interval-scanners.edit',{
                    url:        '/edit/:scannerId',
                    controller: 'ModuleIntervalScannersEditCtrl',
                    templateUrl:iris.config.componentsUrl + '/global-settings/templates/module.settings.sensor-management.interval-scanners.edit.html'
                })
                .state('module.sensor-management.interval-scanners.intervals',{
                    url:        '/intervals/:scannerId',
                    controller: 'ModuleIntervalScannersIntervalsCtrl',
                    abstract:   true,
                    templateUrl:iris.config.componentsUrl + '/global-settings/templates/module.settings.sensor-management.interval-scanners.intervals.html',
                    resolve: {
                        'scanner': ['$state', '$stateParams', 'IntervalScannerService',
                            function ($state, $stateParams, IntervalScannerService) {
                                return IntervalScannerService.getScanner(0, $stateParams.scannerId).then(function (result){return result;});
                            }
                        ]
                    }
                })
                .state('module.sensor-management.interval-scanners.intervals.date-range',{
                    url:        '/date-range',
                    controller: 'ModuleIntervalScannersIntervalsRangeCtrl',
                    template:   '<div ui-grid="gridOptions" ui-grid-pagination></div>'
                })
                .state('module.sensor-management.interval-scanners.intervals.number-range',{
                    url:        '/number-range',
                    controller: 'ModuleIntervalScannersIntervalsRangeCtrl',
                    template:   '<div ui-grid="gridOptions" ui-grid-pagination></div>'
                })
                .state('module.sensor-management.interval-scanners.intervals.chart',{
                    url:        '/chart',
                    controller: 'ModuleIntervalScannersIntervalsChartCtrl',
                    template:   '<iris-interval-chart ng-if="params.dates.length" show-controls="true" params="params" widget="{}"></iris-interval-chart>'
                });
        }
    );
    //endregion

    //region virtual-data-series states
    angular.module('iris_gs_sensor_management_states').config(
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('module.sensor-management.virtual-data-series',{
                    url:        '/virtual-data-series',
                    template:   '<div class="flex-col-auto b-window" ui-view></div>',
                    controller: ["$state",function($state){
                        if($state.is("module.sensor-management.virtual-data-series")) {
                            $state.go("module.sensor-management.virtual-data-series.view",$state.params);
                        }
                    }]
                })
                .state('module.sensor-management.virtual-data-series.view',{
                    url:        '/list',
                    controller: 'ModuleVirtualDataSeriesViewCtrl',
                    templateUrl:iris.config.componentsUrl + '/global-settings/templates/module.settings.sensor-management.virtual-data-series.view.html'
                })
                .state('module.sensor-management.virtual-data-series.edit',{
                    url:        '/edit/:vdseriesId',
                    controller: 'ModuleVirtualDataSeriesEditCtrl',
                    templateUrl:iris.config.componentsUrl + '/global-settings/templates/module.settings.sensor-management.virtual-data-series.edit.html',
                    resolve: {
                        'irisUnitsMap': ['UnitsList',function(UnitsList){return UnitsList.get({},function(result){return result;}).$promise;}]
                    }
                });
        }
    );
    //endregion

    //region sensor groups
    angular.module('iris_gs_sensor_management_states').config(
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('module.sensor-management.sensor-groups',{
                    url:        '/sensor-groups',
                    templateUrl:   iris.config.componentsUrl + '/global-settings/templates/sensor-groups/sensor-groups.view.html',
                    controller: 'ModuleSensorGroupsViewCtrl'
                })
                .state('module.sensor-management.manage-sensors',{
                    url:        '/sensor-groups/:sensorGroupId/manage-sensors',
                    templateUrl:   iris.config.componentsUrl + '/global-settings/templates/sensor-groups/sensor-groups.sensors.html',
                    controller: 'ModuleSensorGroupsEditSensor'
                })
            ;
        }
    );
    //endregion

})();