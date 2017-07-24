(function () {

    angular.module('iris_gs_navi_view_view', []);

    angular.module('iris_gs_navi_view_view').controller('ModuleStepsViewCtrl',
        function ($scope, $controller, $translate) {
            angular.extend($scope, $controller('ModuleSettingsBaseViewCtrl', {$scope: $scope}));

            var table_fields = [
                {enableSorting: false, field: 'settings.timeStepInMinutes', displayName: $translate.instant('label.TimeStep')},
                {enableSorting: false, field: 'settings.chainageStepInUnit', displayName: $translate.instant('label.ChainageStep')},
                {enableSorting: false, field: 'settings.advanceStepInUnit', displayName: $translate.instant('label.AdvanceStep')},
                {enableSorting: false, field: 'settings.tunnelmeterStepInUnit', displayName: $translate.instant('label.TunnelmeterStep')}
            ];

            $scope.addFieldsToGrid(table_fields);

        });

    angular.module('iris_gs_navi_view_view').controller('ModuleArrowViewCtrl',
        function ($scope, $controller, $translate) {
            angular.extend($scope, $controller('ModuleSettingsBaseViewCtrl', {$scope: $scope}));

            var table_fields = [
                {field: 'settings.diameterForTolerance', displayName: $translate.instant('label.DiameterForTolerance')},
                {
                    field: 'settings.colorFill',
                    displayName: $translate.instant('label.ColorFill'),
                    cellTemplate: '\
                    <div class="ui-grid-cell-contents">\
                        <i class="fa" ng-class="{\'fa-paper-plane\': row.entity.settings.type == \'paper-plane\', \'fa-crosshairs\': row.entity.settings.type != \'paper-plane\' }" ng-style="{color: row.entity.settings.colorFill}"></i>\
                    </div>'
                }, {
                    field: 'settings.colorStroke',
                    displayName: $translate.instant('label.ColorStroke'),
                    cellTemplate: '\
                    <div class="ui-grid-cell-contents">\
                        <i class="fa fa-circle-o" ng-style="{color: row.entity.settings.colorStroke}"></i>\
                    </div>'
                },
                {field: 'settings.maxDeviation', displayName: $translate.instant('label.MaxDeviation')},
                {field: 'settings.rearArrowSize', displayName: $translate.instant('label.RearArrowSize')}
            ];

            $scope.addFieldsToGrid(table_fields);
        });

    angular.module('iris_gs_navi_view_view').controller('ModuleUnitsViewCtrl',
        function ($scope, $controller, $translate, ProjectSettingsService) {
            $scope.units = [];
            ProjectSettingsService.getProjectSettingsList('units').then(function (units) {
                $scope.units = units;
            });

            angular.extend($scope, $controller('ModuleSettingsBaseViewCtrl', {$scope: $scope}));

            var table_fields = [
                {field: 'settings.unitForDeviations', displayName: $translate.instant('label.Deviation'), cellFilter: `irisUnits:'short':true`},
                {field: 'settings.unitForChainage', displayName: $translate.instant('label.Chainage'), cellFilter: `irisUnits:'short':true`},
                {field: 'settings.unitForAngle', displayName: $translate.instant('label.Angle'), cellFilter: `irisUnits:'short':true`},
                {field: 'settings.unitForTendency', displayName: $translate.instant('label.Tendency'), cellFilter: `irisUnits:'short':true`}
            ];

            $scope.addFieldsToGrid(table_fields);
        });

    angular.module('iris_gs_navi_view_view').controller('ModuleUpdateFrequencyNavigationViewViewCtrl',
        function ($scope, $controller, $translate) {
            angular.extend($scope, $controller('ModuleSettingsBaseViewCtrl', {$scope: $scope}));

            var table_fields = [
                {field: 'settings.updateFrequencyInSeconds', displayName: $translate.instant('label.UpdateFrequency')}
            ];

            $scope.addFieldsToGrid(table_fields);
        });

    angular.module('iris_gs_navi_view_view').controller('ModuleNavigationSensorsViewCtrl',
        function ($scope, $controller, $translate, $stateParams, NaviConfigService) {
            $scope.items = NaviConfigService.getAll();
            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            var table_fields = [
                {field: 'device.name', displayName: $translate.instant('label.Devices')},
                {field: 'machineType', displayName: $translate.instant('label.MachineType')}
            ];


            $scope.addFieldsToGrid(table_fields);

            $scope.remove = function (navi_config) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        NaviConfigService.remove(navi_config).then(function (result) {
                            iris.loader.stop();
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                        });
                    }
                });
            };
        });

})();