(function () {

    angular.module('iris_gs_maps_view', []);

    angular.module('iris_gs_maps_view').controller('ModuleUpdateFrequencyMapsViewCtrl',
        function ($scope, $controller, $translate) {
            angular.extend($scope, $controller('ModuleSettingsBaseViewCtrl', {$scope: $scope}));

            var table_fields = [{
                field: 'settings.updateFrequencyInSeconds',
                displayName: $translate.instant('label.UpdateFrequency')
            }];

            $scope.addFieldsToGrid(table_fields);
        });

})();