(function () {
    angular.module('iris_gs_dpm').controller('ModuleDpmProtocolTemplatesBuildingModalCtrl',
        function ($scope, $translate, $uibModalInstance,
                  protocolTemplate, protocolTemplatesFilter, projects, buildings,
                  DpmProtocolTemplateService, uiGridConstants) {
            $scope.protocolTemplate = protocolTemplate;
            $scope.protocolTemplate.protocolTemplateBuildings = $scope.protocolTemplate.protocolTemplateBuildings || [];

            $scope.filter = protocolTemplatesFilter;
            $scope.projects = projects;
            $scope.buildings = buildings;

            $scope.mainBuildings = buildings.filter(b => !b.parentId);
            $scope.subBuildings = [];

            $scope.setBuilding = function (buildingId) {
                if(!buildingId) {
                    $scope.subBuildings = [];
                } else {
                    $scope.subBuildings = buildings.filter(b => b.parentId == buildingId);
                }
            };
            if($scope.filter.buildingId) $scope.setBuilding($scope.filter.buildingId);

            $scope.assignToBuilding = function (subBuildingId) {
                if(!$scope.filter || !subBuildingId || !$scope.filter.projectId) return;
                DpmProtocolTemplateService.assignProtocolTempalteToBuilding($scope.filter.projectId, $scope.protocolTemplate.id, subBuildingId)
                    .then(protocolTemplateBuilding => {
                        $scope.protocolTemplate.protocolTemplateBuildings.push(protocolTemplateBuilding);
                    });
            };

            $scope.removeAssignment = function (subBuildingId) {
                if(!$scope.filter || !subBuildingId || !$scope.filter.projectId) return;
                DpmProtocolTemplateService.unassignProtocolTempalteToBuilding($scope.filter.projectId, $scope.protocolTemplate.id, subBuildingId)
                    .then(protocolTemplateBuilding => {
                        for(var i = 0; i < $scope.protocolTemplate.protocolTemplateBuildings.length; i++){
                            if($scope.protocolTemplate.protocolTemplateBuildings[i].id == protocolTemplateBuilding.id){
                                $scope.protocolTemplate.protocolTemplateBuildings.splice(i,1);
                                break;
                            }
                        }
                    });
            };

            $scope.isAssigned = function (buildingId) {
                if(!buildingId) return false;
                return $scope.protocolTemplate.protocolTemplateBuildings.find(b => b.buildingId == buildingId);
            };

            $scope.gridOptions = {
                data: 'subBuildings',
                columnDefs: [{
                    field: 'name',
                    width: '*',
                    displayName: $translate.instant('label.SubBuilding'),
                    sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0
                    }
                }, {
                    field: 'buildingId',
                    displayName: '',
                    width: '50',
                    cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link"
                                    ng-if="grid.appScope.isAssigned(row.entity.id)"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.removeAssignment(row.entity.id); $event.stopPropagation();">
                                <i class="fa text-success fa-check"></i>
                            </button>
                            <button class="btn btn-link"
                                    ng-if="!grid.appScope.isAssigned(row.entity.id)"
                                    uib-tooltip="{{'label.Assign' | translate}}"
                                    ng-click="grid.appScope.assignToBuilding(row.entity.id); $event.stopPropagation();">
                                <i class="fa text-danger fa-times"></i>
                            </button>
                        </div>`
                }]
            }

        });
})();