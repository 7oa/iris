(function () {
    angular.module('iris_gs_buildings').controller('ModuleBuildingViewCtrl',
        function ($scope, $translate, $state, $uibModal, parent, BuildingService, SecurityService) {
            $scope.parentId = $state.params["parentId"] || null;

            $scope.parent = parent;
            $scope.parentArray = [parent];
            $scope.parents = [];

            $scope.canCreate = !$scope.parentId || !$scope.parent.parentId;
            $scope.canCreateTunnel = !$scope.parentId || $scope.parent.type == "TUNNEL";

            $scope.buildingTypes = BuildingService.getBuildingTypes();
            $scope.buildingTypesForCreate = $scope.buildingTypes.filter(t => ($scope.canCreateTunnel && t.id == "TUNNEL") || t.id == "STORAGE");

            var requestBuildings = function () {
                $scope.buildings = [];
                BuildingService.queryByParent($scope.parentId).then(buildings =>  {
                    $scope.buildings = buildings
                });
            };
            requestBuildings();

            $scope.parentId && $scope.parent.parents && $scope.parent.parents.length && BuildingService.query([{ f: 'id', v: $scope.parent.parents }]).then(res => {
                $scope.parents = res;
            });

            $scope.goToParent = function(parentId) {
                $state.go($state.current, {parentId});
            };

            $scope.create = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.building = $scope.canCreate ? {
                    type: $scope.canCreateTunnel ? "TUNNEL" : "STORAGE",
                    parentId: $scope.parentId
                } : null;
            };
            $scope.create();

            $scope.save = function () {
                BuildingService.save($scope.building).then(building => {
                    alertify.success($translate.instant('label.buildings.BuildingSaved'));
                    requestBuildings();
                    $scope.create();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        BuildingService.remove(item).then(building => {
                            alertify.success($translate.instant('label.buildings.BuildingRemoved'));
                            requestBuildings();
                            $scope.create();
                        });
                    }
                });
            };

            $scope.showInfo = function(building) {
                $uibModal.open({
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/buildings/ms.buildings.building.info.modal.html`,
                    size: 'md',
                    resolve: {
                        'building': () => building,
                        'parentBuilding': () => $scope.parent
                    },
                    controller: 'ModuleBuildingInfoModalCtrl'
                });
            };

            $scope.openSetRightModal = function (building) {
                SecurityService.openSubjectPermissionsModal('BuildingDocument', building.id, ['update'], [true]);
            };

            $scope.gridOptions = {
                data: 'buildings',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'type',
                        width: '120',
                        displayName: $translate.instant('label.Type'),
                        cellFilter: 'IrisFilterField:[grid.appScope.buildingTypes]'
                    },
                    {
                        field: 'code',
                        width: '*',
                        displayName: $translate.instant('label.Code')
                    },
                    {
                        field: 'color',
                        width: '60',
                        displayName: $translate.instant('label.Color'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div><i class="fa fa-circle" ng-style="{color: row.entity.color}"></i></div>
                            </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 350,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-default" ng-if="row.entity.type != 'SEGMENT'" ng-click="grid.appScope.goToParent(row.entity.id)">
                                <i class="fa fa-arrow-right"></i>
                                {{::'label.SubBuildings' | translate}}
                            </button>
                            <button class="btn btn-default" ng-click="grid.appScope.openSetRightModal(row.entity)">
                                <i class="fa fa-shield"></i>
                                {{::'label.Permissions' | translate}}
                            </button>
                            <button class="btn btn-default" uib-tooltip="{{::'label.BuildingInfo' | translate}}" ng-if="row.entity.type != 'STORAGE'" ng-click="grid.appScope.showInfo(row.entity)">
                                <i class="fa fa-info-circle"></i>
                            </button>
                            <button class="btn btn-danger"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.remove(row.entity); $event.stopPropagation();">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection && gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.building && $scope.building.id == row.entity.id) {
                            $scope.create();
                        } else {
                            $scope.building = angular.copy(row.entity);
                        }
                    });
                }
            };
        })
})();
