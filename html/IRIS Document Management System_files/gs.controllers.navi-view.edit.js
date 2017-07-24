(function () {
    
    angular.module('iris_gs_navi_view_edit', []);

    angular.module('iris_gs_navi_view_edit').controller('ModuleStepsEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance) {
            angular.extend($scope, $controller('ModuleSettingsBaseEditCtrl', {
                $scope: $scope,
                $uibModalInstance: $uibModalInstance,
                params: params
            }));

        });

    angular.module('iris_gs_navi_view_edit').controller('ModuleArrowEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, NaviConfigService) {
            angular.extend($scope, $controller('ModuleSettingsBaseEditCtrl', {
                $scope: $scope,
                $uibModalInstance: $uibModalInstance,
                params: params
            }));

            $scope.arrow_types = NaviConfigService.arrow_types;
        });

    angular.module('iris_gs_navi_view_edit').controller('ModuleUnitsEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, ProjectSettingsService) {
            $scope.units = [];
            ProjectSettingsService.getProjectSettingsList('units').then(function (units) {
                $scope.units = units;
            });

            angular.extend($scope, $controller('ModuleSettingsBaseEditCtrl', {
                $scope: $scope,
                $uibModalInstance: $uibModalInstance,
                params: params
            }));
        });

    angular.module('iris_gs_navi_view_edit').controller('ModuleUpdateFrequencyNavigationViewEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance) {
            angular.extend($scope, $controller('ModuleSettingsBaseEditCtrl', {
                $scope: $scope,
                $uibModalInstance: $uibModalInstance,
                params: params
            }));
        });

    angular.module('iris_gs_navi_view_edit').controller('ModuleNavigationSensorsEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, DevicesService, NaviConfigService) {

            $scope.is_add = params.object_id === null ? true : false;

            $scope.getSensorsForDevice = function (id) {
                iris.loader.start();
                DevicesService.getSensors(+id).$promise.then(
                    function (sensors) {
                        $scope.available_sensors = sensors;
                        iris.loader.stop();
                    }
                );
            };

            $scope.navi_config = NaviConfigService.create();
            if (params.object_id) {
                NaviConfigService.getById(params.object_id).then(function (config) {
                    $scope.navi_config = config;
                    $scope.getSensorsForDevice(config.device.id);
                });
            }

            $scope.available_devices = [];
            DevicesService.getDevices().$promise.then(function (devices) {
                $scope.available_devices = devices;
            });

            $scope.available_sensors = [];

            $scope.machine_types = NaviConfigService.machine_types;
            $scope.navi_sensor_groups = NaviConfigService.navi_sensor_groups;


            // TODO doesn't work in original page either
            $scope.setSensor = function (sensor_id, alias) {
                if ($scope.navi_config[alias] && $scope.navi_config[alias].id == +sensor_id) {
                    return;
                }
                else {
                    var new_sensor = $filter('filter')($scope.sensors, {id: +sensor_id}, true)[0];
                    NaviConfigService.setSensor($scope.navi_config, alias, new_sensor).then(function (value) {
                        $scope.navi_config = value;
                        alertify.success($translate.instant('text.tunneling.SensorConfigurationSaved'));
                    });
                }
            };

            $scope.save = function () {
                NaviConfigService.save($scope.navi_config).then(function () {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    $uibModalInstance.close($scope.navi_config);
                });
            };

        });
    
})();