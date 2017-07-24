(function () {

    angular.module('iris_gs_maps').controller('ModuleProjectionsEditCtrl',
        function ($scope, $controller, $translate, $resource, params, $uibModalInstance) {

            $scope.projection = params.data || {};
            $scope.is_add = !params.object_id;

            $scope.save = function () {
                $scope.saveProjection($scope.projection);
                $uibModalInstance.close($scope.projection);
            };
        });

})();