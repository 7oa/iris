(function () {
    angular.module('iris_gs_dpm').controller('ModuleDpmProtocolTemplatesCopyModalCtrl',
        function ($scope, $translate, $uibModalInstance,
                  sourceProtocolTemplate, protocolTemplates, protocolTemplatesFilter, projects,
                  DpmProtocolTemplateService) {
            $scope.sourceProtocolTemplate = sourceProtocolTemplate;
            $scope.sourceStructure = {};
            $scope.protocolTemplates = protocolTemplates;
            $scope.protocolTemplate = {};

            $scope.filter = protocolTemplatesFilter;

            $scope.projects = projects;

            $scope.tabs = {
                activeTab: 'New'
            };

            DpmProtocolTemplateService.getStructure($scope.filter.projectId, $scope.sourceProtocolTemplate.id).then(res => {
                res.structure || (res.structure = {
                    properties: []
                });
                res.headerStructure || (res.headerStructure = {
                    properties: []
                });
                $scope.sourceStructure = res;
            });

            var refreshProtocolTemplates = function() {
                $scope.protocolTemplate = {};
                $scope.filter.protocolTemplateId = null;
            };

            $scope.$watch("filter.projectId", function(nv, ov) {
                if (nv == ov) return;
                refreshProtocolTemplates(nv);
            });

            function saveTargetProtocolStructure(protocolTemplateId) {
                $scope.sourceStructure.projectId = $scope.filter.projectId;
                return DpmProtocolTemplateService.saveStructure($scope.filter.projectId, protocolTemplateId, $scope.sourceStructure);
            }

            $scope.accept = function() {
                if ($scope.tabs.New) {
                    alertify.confirm($translate.instant('message.dpm.CopyStructureToNew'), function (e) {
                        if (e) {
                            $scope.protocolTemplate.projectId = $scope.filter.projectId;
                            DpmProtocolTemplateService.save($scope.protocolTemplate).then(res => {
                                saveTargetProtocolStructure(res.id).then(() => {
                                    $uibModalInstance.close(res.id);
                                });
                            });
                        }
                    });
                } else if ($scope.tabs.Existing && $scope.filter.protocolTemplateId) {
                    alertify.confirm($translate.instant('message.dpm.CopyStructureToExisting'), function (e) {
                        if (e) {
                            saveTargetProtocolStructure($scope.filter.protocolTemplateId).then(() => {
                                $uibModalInstance.close($scope.filter.protocolTemplateId);
                            });
                        }
                    });
                }
            };
        });
})();