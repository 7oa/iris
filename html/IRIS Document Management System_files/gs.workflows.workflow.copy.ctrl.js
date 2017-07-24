(function () {
    angular.module('iris_gs_workflows').controller('ModuleWorkflowCopyCtrl',
        function ($scope, $uibModalInstance, workflow, WorkflowService) {
            $scope.newWorkflow = {
                name: workflow.name
            };

            $scope.copyWorkflow = function(){
                WorkflowService.copyWorkflow(workflow, $scope.newWorkflow).then(newWorkflow => {
                    $uibModalInstance.close(newWorkflow)
                });
            };
        })
})();