(function () {
    angular.module('irisApp').controller('DmsFileEditCtrl',
        function ($scope, $uibModalInstance, $q, $filter, $translate, TagsService, file, FilesService, workflows, WorkflowService, SecurityService,
                  languages, users, dmsConfig) {
            $scope.file = FilesService.createFile(file);
            $scope.file.currentWorkflowStateId = $scope.file.workflowStateId;

            var isDMSAdmin = SecurityService.hasPermissions('DMS', 'config', 'Module');

            $scope.workflows = workflows;
            $scope.languages = languages;
            $scope.users = users;
            $scope.dmsConfig = dmsConfig;
            $scope.workflowStates = [];
            $scope.file.tags = $scope.file.tags || [];

            $scope.file.tags.forEach(t => {
                var prop = $scope.dmsConfig.properties.find(p => p.name == t.type);
                if(prop) prop.value = t.value;
            });

            $scope.requestWorkflowStates = function (workflowId) {
                if(workflowId != $scope.file.workflowId) {
                    $scope.file.workflowStateId = null;
                    $scope.workflowStates = [];
                }
                if(!workflowId) return;

                if(file.workflowStateId && !isDMSAdmin) {
                    WorkflowService.getWorkflowNextStates(workflowId, file.workflowStateId).then(workflowStates => $scope.workflowStates = workflowStates)
                } else {
                    WorkflowService.getWorkflowStates(workflowId).then(workflowStates => {
                        $scope.workflowStates = workflowStates.filter(state => state.type == 'START');
                        if($scope.workflowStates.length) $scope.file.workflowStateId = $scope.workflowStates[0].id;

                        if(isDMSAdmin){
                            $scope.workflowStates = workflowStates;
                        }
                    });
                }
            };

            $scope.save = function () {
                $scope.file.workflowStateId = $scope.file.workflowStateId || $scope.file.currentWorkflowStateId;
                var promises = [];
                $scope.dmsConfig.properties.forEach(p => {
                    if(p.value) {
                        promises.push(TagsService.saveTag({
                            type: p.name,
                            value: p.value,
                            name: $filter('IrisFilterField')(p.value, [p.directory])
                        }));
                    }
                });
                $q.all(promises).then(res => {
                    $scope.file.tags = res;
                    FilesService.save($scope.file).then(function () {
                        alertify.success($translate.instant('text.dms.FileSaved'));
                        $uibModalInstance.close();
                    });
                });
            };

            $scope.isStartState = function () {
                if(isDMSAdmin) return false;
                var stateId = $scope.file.currentWorkflowStateId;
                var workflowId = $scope.file.workflowId;

                if(!stateId || !workflowId) return false;

                var workflow = $scope.workflows.filter(wf => wf.id == workflowId)[0];
                if(!workflow) return false;

                var state = workflow.workflowStates.filter(s => s.id == stateId)[0];
                return state && state.type == 'START';
            }

        });
})();