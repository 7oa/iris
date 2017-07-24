(function(){
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterToolManufacturersViewCtrl',
        function ($scope, $state, $translate, CutterToolManufacturerService) {

            var requestToolManufacturers = function () {
                $scope.toolManufacturers = [];
                CutterToolManufacturerService.getToolManufacturers($state.params.deviceId)
                    .then(toolManufacturers => $scope.toolManufacturers = toolManufacturers);
            };
            requestToolManufacturers();

            $scope.createToolManufacturer = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.toolManufacturer = {
                    deviceId: $state.params.deviceId
                }
            };
            $scope.createToolManufacturer();

            $scope.saveToolManufacturer = function () {
                CutterToolManufacturerService.saveToolManufacturer($scope.toolManufacturer).then(toolManufacturer => {
                    alertify.success($translate.instant('label.cutter.ToolManufacturerSaved'));
                    requestToolManufacturers();
                    $scope.createToolManufacturer();
                });
            };

            $scope.gridOptions = {
                data: 'toolManufacturers',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
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
                                    ng-click="grid.appScope.removeToolManufacturer(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function(gridApi){
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if($scope.toolManufacturer.id == row.entity.id) {
                            $scope.createToolManufacturer();
                        } else {
                            $scope.toolManufacturer = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.removeToolManufacturer = function (toolManufacturer) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        CutterToolManufacturerService.removeToolManufacturer(toolManufacturer).then(toolManufacturer => {
                            alertify.success($translate.instant('label.cutter.ToolManufacturerRemoved'));
                            requestToolManufacturers();
                            $scope.createToolManufacturer();
                        });
                    }
                });
            }

        })
})();