(function(){
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterMaintenanceStatusViewCtrl',
        function ($scope, $state, $translate, CutterToolStatusService) {

            var requestToolStatuses = function () {
                $scope.toolStatuses = [];
                CutterToolStatusService.getToolStatuses($state.params.deviceId)
                    .then(toolStatuses => $scope.toolStatuses = toolStatuses);
            };
            requestToolStatuses();

            $scope.createToolStatus = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.toolStatus = {
                    deviceId: $state.params.deviceId,
                    color: '#000000'
                }
            };
            $scope.createToolStatus();

            $scope.saveToolStatus = function () {
                CutterToolStatusService.saveToolStatus($scope.toolStatus).then(toolStatus => {
                    alertify.success($translate.instant('label.cutter.ToolStatusSaved'));
                    requestToolStatuses();
                    $scope.createToolStatus();
                });
            };

            $scope.toggleToolStatusSelected = function (toolStatus) {
                toolStatus.isSelected = !toolStatus.isSelected;
                $scope.toolStatus = toolStatus;
                $scope.saveToolStatus();
            };

            $scope.gridOptions = {
                data: 'toolStatuses',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'valueFrom',
                        width: '*',
                        displayName: $translate.instant('label.From')
                    },
                    {
                        field: 'valueTo',
                        width: '*',
                        displayName: $translate.instant('label.range.To')
                    },
                    {
                        field: 'color',
                        width: '*',
                        displayName: $translate.instant('label.Color'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <i class="fa fa-circle" ng-style="{color: row.entity.color}"></i>
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
                                    ng-click="grid.appScope.removeToolStatus(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function(gridApi){
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if($scope.toolStatus.id == row.entity.id) {
                            $scope.createToolStatus();
                        } else {
                            $scope.toolStatus = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.removeToolStatus = function (toolStatus) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        CutterToolStatusService.removeToolStatus(toolStatus).then(toolStatus => {
                            alertify.success($translate.instant('label.cutter.ToolStatusRemoved'));
                            requestToolStatuses();
                            $scope.createToolStatus();
                        });
                    }
                });
            }

        })
})();
