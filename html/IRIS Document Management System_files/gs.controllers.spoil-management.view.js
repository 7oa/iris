(function () {

    angular.module('iris_gs_spoil_mgt_view', []);

    angular.module('iris_gs_spoil_mgt_view').controller('ModuleSpoilManagementViewCtrl',
        function ($scope, $controller) {
            $scope.size = 'md';
            angular.extend($scope, $controller('ModuleSettingsBaseViewCtrl', {$scope: $scope}));

            $scope.$watch('settings_list', $scope.removeDefaultItem);
        });


})();