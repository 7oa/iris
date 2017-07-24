(function () {
    'use strict';

    angular
        .module('iris_gs_geology')
        .controller('ModuleGeologicalClassesParametersModalViewCtrl', ModuleGeologicalClassesParametersModalViewCtrl);

    ModuleGeologicalClassesParametersModalViewCtrl.$inject = [
        '$uibModalInstance',
        '$scope', 
        'parameters',
        'geologicalClassValues',
        'GeologyClassesParametersService'
    ];

    function ModuleGeologicalClassesParametersModalViewCtrl(
        $uibModalInstance,
        $scope, 
        parameters,
        geologicalClassValues,
        GeologyClassesParametersService) {

        //variables
        $scope.parameters = parameters;
        $scope.parameterTypes = GeologyClassesParametersService.getGeologicalClassesParameterTypes();

        geologicalClassValues.forEach(val => {
            var param = $scope.parameters.find(p => p.id == val.parameterId);
            param.selected = !!param;
        });

        $scope.save = function(){
            var selectedParms = $scope.parameters.filter(p => p.selected);

            //merge old and new params
            var result = [];
            selectedParms.forEach(p => {
                var value = geologicalClassValues.find(val => p.id == val.parameterId);
                if(!value) {
                    result.push({
                        parameterId: p.id,
                        value: null,
                        geologicalParameter: p
                    });
                } else {
                    result.push(value);
                }
            });

            $uibModalInstance.close(result);
        };

        $scope.selectAllParameters = function (selected, key) {
            $scope.parameters.filter(param => param.type == key)
                .forEach(param => param.selected = selected);
        }
    }
})();

