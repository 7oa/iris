(function () {
    angular.module('iris_gs_dpm').controller('ModuleDpmProtocolTemplatesStructureCtrl',
        function ($scope, $state, $translate, DpmProtocolTemplateService) {
            var projectId = $state.params.projectId;

            $scope.protocolTemplateId = $state.params.protocolTemplateId;
            $scope.protocolTemplateStructure = {
                projectId: projectId,
                structure: {
                    properties: []
                },
                headerStructure: {
                    properties: []
                }
            };

            DpmProtocolTemplateService.getStructure(projectId, $scope.protocolTemplateId).then(res => {
                res.projectId || (res.projectId = projectId);
                res.structure || (res.structure = {
                    properties: []
                });
                res.headerStructure || (res.headerStructure = {
                    properties: []
                });
                $scope.protocolTemplateStructure = res;
            });

            $scope.changeProtocolTemplate = function (protocolTemplateId) {
                if (protocolTemplateId == $state.params.protocolTemplateId) return;
                $state.go($state.current.name, {protocolTemplateId}, {reload: true});
            };

            $scope.saveStructure = function() {
                if ($scope.structureEditor.isValid(true)) {
                    DpmProtocolTemplateService.saveStructure(projectId, $scope.protocolTemplateId, $scope.protocolTemplateStructure).then(() => {
                        alertify.success($translate.instant('label.SavedSuccessfully'));
                    });
                }
            };

            $scope.preview = function() {
                $scope.structureEditor.showPreview();
            };
        });
})();
