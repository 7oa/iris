(function () {
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterToolDiscDiametersViewCtrl',
        function ($scope, $state, $translate, CutterToolDiskDiameterService) {

            var requestToolDiskDiameters = function () {
                $scope.toolDiskDiameters = [];
                CutterToolDiskDiameterService.getToolDiskDiameters($state.params.deviceId)
                    .then(toolDiskDiameters => $scope.toolDiskDiameters = toolDiskDiameters);
            };
            requestToolDiskDiameters();

            $scope.createToolDiskDiameter = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.toolDiskDiameter = {
                    deviceId: $state.params.deviceId
                }
            };
            $scope.createToolDiskDiameter();

            $scope.saveToolDiskDiameter = function () {
                CutterToolDiskDiameterService.saveToolDiskDiameter($scope.toolDiskDiameter).then(toolDiskDiameter => {
                    alertify.success($translate.instant('label.cutter.ToolDiskDiameterSaved'));
                    requestToolDiskDiameters();
                    $scope.createToolDiskDiameter();
                });
            };

            $scope.gridOptions = {
                data: 'toolDiskDiameters',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'inches',
                        width: '*',
                        displayName: $translate.instant('label.Diameter') + " (" + $translate.instant('unit.Inch') + ")",
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            {{row.entity.inches}} {{'unit.Inch' | translate}} ({{(row.entity.inches * 25.4 | number:2) + ' ' + ('unit.Millimeter.short' | translate)}})
                        </div>`
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
                                    ng-click="grid.appScope.removeToolDiskDiameter(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.toolDiskDiameter.id == row.entity.id) {
                            $scope.createToolDiskDiameter();
                        } else {
                            $scope.toolDiskDiameter = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.removeToolDiskDiameter = function (toolDiskDiameter) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        CutterToolDiskDiameterService.removeToolDiskDiameter(toolDiskDiameter).then(toolDiskDiameter => {
                            alertify.success($translate.instant('label.cutter.ToolDiskDiameterRemoved'));
                            requestToolDiskDiameters();
                            $scope.createToolDiskDiameter();
                        });
                    }
                });
            }

        })
})();
