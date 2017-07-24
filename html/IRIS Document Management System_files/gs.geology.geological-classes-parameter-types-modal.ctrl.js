(function () {
    'use strict';

    angular
        .module('iris_gs_geology')
        .controller('ModuleGeologicalClassesParameterTypesModalViewCtrl',
            function ($uibModalInstance, $scope, $stateParams, types, units, GeologyClassesParametersService) {

                //variables
                $scope.types = types;
                $scope.units = units;

                $scope.parameterType = GeologyClassesParametersService.createGeologyClassesParameter({type: 'ALL', projectId: $stateParams.projectId});

                $scope.save = function() {
                    GeologyClassesParametersService.saveGeologyClassesParameter($scope.parameterType)
                        .then(() => {
                            $uibModalInstance.close();
                        })
                }
            });
})();

