(function () {
    angular.module('iris_gs_dpm').controller('ModuleDpmProtocolTemplatesBuildingsModalCtrl',
        function ($scope, buildings, protocolTemplates, $filter, $stateParams, DpmProtocolTemplateService) {

            $scope.protocolTemplates = protocolTemplates;
            $scope.buildings = buildings;
            $scope.parentBuildings = $filter('orderBy')(buildings.filter(b => b.parentId == null), '-order');
            $scope.subBuildings = buildings.filter(b => b.parentId != null);

            for (var i = 0, l = $scope.subBuildings.length; i < l; i++) {
                var p = $scope.buildings.find(b => b.id == $scope.subBuildings[i].parentId);

                if (p) {
                    $scope.subBuildings[i].parentBuildingName = p.name;
                    $scope.subBuildings[i].parentBuildingCode = p.code;
                    $scope.subBuildings[i].parentBuildingColor = p.color;
                }
            }

            $scope.subBuildings = $filter('orderBy')($scope.subBuildings, ['parentBuildingName', '-order', 'name']);


            $scope.setAssign = function (ptId, sbId) {
                if (!$scope.isAssigned(sbId, ptId)) {
                    DpmProtocolTemplateService.assignProtocolTempalteToBuilding($stateParams.projectId, ptId, sbId)
                        .then((res) => {
                            var i = $scope.protocolTemplates.findIndex(pt => pt.id == ptId);
                            $scope.protocolTemplates[i].protocolTemplateBuildings.push(res);
                        });
                } else {
                    DpmProtocolTemplateService.unassignProtocolTempalteToBuilding($stateParams.projectId, ptId, sbId)
                        .then(() => {
                            var i = $scope.protocolTemplates.findIndex(pt => pt.id == ptId),
                                j = $scope.protocolTemplates[i].protocolTemplateBuildings.findIndex(ptb => ptb.id == sbId);
                            $scope.protocolTemplates[i].protocolTemplateBuildings.splice(j, 1);
                        });
                }
            }

            $scope.isAssigned = function (bId, ptId) {
                var pt = $scope.protocolTemplates.find(p => p.id == ptId);
                return pt.protocolTemplateBuildings.find(b => b.buildingId == bId);
            };
        });
})();