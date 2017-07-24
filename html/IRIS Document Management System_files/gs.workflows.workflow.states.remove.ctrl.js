(function () {
    angular.module('iris_gs_workflows').controller('ModuleWorkflowStatesRemoveCtrl',
        function ($scope, $state, $uibModalInstance, $translate, states) {
            $scope.states = states;
            $scope.newStateId = null;

            $scope.removeWorkflowState = function(){
                $uibModalInstance.close($scope.newStateId)
            };
        })
})();
