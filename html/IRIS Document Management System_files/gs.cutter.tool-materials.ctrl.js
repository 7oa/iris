(function () {
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterToolMaterialsViewCtrl',
        function ($scope, $state, $translate, CutterToolMaterialsService) {

            var requestToolMaterials = function () {
                $scope.toolMaterials = [];
                CutterToolMaterialsService.getToolMaterials($state.params.deviceId)
                    .then(toolMaterials => $scope.toolMaterials = toolMaterials);
            };
            requestToolMaterials();

            $scope.createToolMaterial = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.toolMaterial = {
                    deviceId: $state.params.deviceId
                }
            };
            $scope.createToolMaterial();

            $scope.saveToolMaterial = function () {
                CutterToolMaterialsService.saveToolMaterial($scope.toolMaterial).then(toolMaterial => {
                    alertify.success($translate.instant('label.cutter.ToolMaterialSaved'));
                    requestToolMaterials();
                    $scope.createToolMaterial();
                });
            };

            $scope.gridOptions = {
                data: 'toolMaterials',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name'),
                        cellFilter: 'irisTranslate : row.entity.translations.name'
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 100,
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <button class="btn btn-link"
                                        uib-tooltip="{{'label.Remove' | translate}}"
                                        ng-click="grid.appScope.removeToolMaterial(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                            </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.toolMaterial.id == row.entity.id) {
                            $scope.createToolMaterial();
                        } else {
                            $scope.toolMaterial = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.removeToolMaterial = function (toolMaterial) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        CutterToolMaterialsService.removeToolMaterial(toolMaterial).then(toolMaterial => {
                            alertify.success($translate.instant('label.cutter.ToolMaterialRemoved'));
                            requestToolMaterials();
                            $scope.createToolMaterial();
                        });
                    }
                });
            }

        })
})();