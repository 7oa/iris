//(function () {
//    angular.module('iris_gs_dpm').controller('ModuleDpmProtocolHeaderCtrl',
//        function ($scope, $state, $translate, DpmProtocolHeaderStructureService) {
//            var projectId = $state.params.projectId;
//
//            $scope.structureEditor = {};
//            $scope.protocolHeaderStructure = {
//                projectId: projectId,
//                structure: {
//                    properties: []
//                }
//            };
//
//            DpmProtocolHeaderStructureService.current(projectId).then(res => {
//                res.projectId || (res.projectId = projectId);
//                res.structure || (res.structure = {
//                    properties: []
//                });
//                $scope.protocolHeaderStructure = res;
//            });
//
//            $scope.saveProtocolHeader = function () {
//                console.log($scope.protocolHeaderStructure);
//
//                if ($scope.structureEditor.isValid(true)) {
//                    DpmProtocolHeaderStructureService.save($scope.protocolHeaderStructure).then(() => {
//                        alertify.success($translate.instant('label.SavedSuccessfully'));
//                    });
//                }
//            };
//
//            $scope.preview = function() {
//                $scope.structureEditor.showPreview();
//            };
//        });
//})();
