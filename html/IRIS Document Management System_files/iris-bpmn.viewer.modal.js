(function () {
    angular.module('irisBpmn').controller('IrisBpmnViewerModalCtrl', function ($scope, processTemplate, selectedElementId, TasksService) {
        $scope.processTemplate = processTemplate;

        $scope.$on('irisBpmn:rendered', () => {
            TasksService.getTasks({filter: angular.toJson([{f:'active', v:[true, false]}, {f:'processId', v:[processTemplate.id]}])}).then(tRes => {
                tRes.forEach(t => t.current = t.active && !t.isResolved);
                $scope.irisBpmn.appendTasksData(tRes);

                var element = $scope.irisBpmn.getElementById(selectedElementId);
                element && $scope.irisBpmn.setSelection(element);
            });
        });
    });

    angular.module('irisBpmn').service('IrisBpmnViewer', function ($uibModal) {
        return {
            showProcessModal: (processTemplateId, selectedElementId) => {
                return $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/irisBpmn/templates/iris-bpmn.viewer.modal.html',
                    controller: 'IrisBpmnViewerModalCtrl',
                    size: 'lg',
                    resolve: {
                        'processTemplate': (ProcessTemplateService) => ProcessTemplateService.get(processTemplateId),
                        'selectedElementId': () => selectedElementId
                    }
                }).result;
            }
        }
    })
})();
