((globals) => {

    'use strict';

    const COLOR_SCHEME = {
        PRODUCTIVE: '#00ff00',
        DOWNTIME: '#ff0000'
    };

    globals.angular.module('iris_gs_workshift_management_operating_state')
        .controller('ModuleAutoOperatingStateEditCtrl', function (DevicesService, OperatingStateService,
            IntervalScannerService, $scope, $rootScope, $translate, $uibModalInstance, params) {

            let autoStateId;
            let deviceId;

            $scope.init = () => {
                autoStateId = params.id;
                deviceId = params.deviceId;

                $scope.scanners = [];
                $scope.phaseTypes = [];
                $scope.types = [];

                OperatingStateService.listAutoStateTypes().then((types) =>
                    $scope.types = types);

                if (autoStateId) {
                    OperatingStateService.getAutoStateById(autoStateId).then((model) => {
                        $scope.model = model;
                        IntervalScannerService.getScanners(model.deviceId).then((scanners) =>
                            $scope.scanners = scanners);

                    });
                } else {
                    $scope.model = OperatingStateService.createAutoState(deviceId);
                    IntervalScannerService.getScanners($scope.model.deviceId).then((scanners) =>
                        $scope.scanners = scanners);
                }
            };

            $scope.$watch('model.scannerId', () => {
                if ($scope.model && $scope.model.scannerId) {
                    IntervalScannerService.getScannerIntervalPhases(
                        $scope.model.scannerId, deviceId).then((intervalPhases) =>
                            $scope.phaseTypes = intervalPhases.map((phase) => {
                                return {
                                    id: phase,
                                    name: phase
                                }
                            }
                        )
                    );
                }
            });

            $scope.$watch('model.type', () => {
                if ($scope.model && $scope.model.type) {
                    $scope.model.color = $scope.model.color || COLOR_SCHEME[$scope.model.type];
                    $scope.color = !$scope.color ? $scope.model.color :
                        COLOR_SCHEME[$scope.model.type];
                }
            });

            $scope.save = () => {
                if ($scope.model.ring) {
                    $scope.model.type = 'PRODUCTIVE';
                    $scope.model.code = null;
                    $scope.model.name = null;
                    $scope.model.intervalPhaseType = null;
                }

                $scope.model.color = $scope.color;

                OperatingStateService.saveAutoState($scope.model).then(() => {
                    globals.alertify.success($translate.instant('message.AutoStateSaved'));
                    $uibModalInstance.close();

                    $rootScope.$broadcast('updateAutoStates');
                })
            };
        }
    );
})({
    angular: angular,
    alertify: alertify
});