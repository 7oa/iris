(function () {
    
    angular.module('iris_gs_maps_edit', []);

    angular.module('iris_gs_maps_edit').controller('ModuleUpdateFrequencyMapsEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance) {
            angular.extend($scope, $controller('ModuleSettingsBaseEditCtrl', {
                $scope: $scope,
                $uibModalInstance: $uibModalInstance,
                params: params
            }));
        });

})();