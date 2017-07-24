(function () {
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterToolOptionsViewCtrl',
        function ($scope, $state, $translate, $q, CutterToolOptionsService) {

            var requestToolOptions = function () {
                $scope.toolOptions = [];
                CutterToolOptionsService.getToolOptions($state.params.deviceId)
                    .then(toolOptions => {
                        toolOptions.sort((a,b) => a.orderIndex - b.orderIndex);

                        var order = 0;
                        toolOptions.forEach(s => s.orderIndex = order++);

                        $scope.toolOptions = toolOptions;
                    });
            };
            requestToolOptions();

            $scope.createToolOption = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.toolOption = {
                    deviceId: $state.params.deviceId
                }
            };
            $scope.createToolOption();

            $scope.saveToolOption = function () {
                CutterToolOptionsService.saveToolOption($scope.toolOption).then(toolOption => {
                    alertify.success($translate.instant('label.cutter.ToolOptionSaved'));
                    requestToolOptions();
                    $scope.createToolOption();
                });
            };

            $scope.saveOrder = function () {
                var savePromises = [];
                $scope.toolOptions.forEach(s => {
                    savePromises.push(CutterToolOptionsService.saveToolOption(s));
                });
                $q.all(savePromises).then((res) => {
                    alertify.success($translate.instant('label.cutter.ToolOptionsOrderSaved'));
                    requestToolOptions();
                    $scope.createToolOption();
                });
            };

            $scope.gridOptions = {
                data: 'toolOptions',
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
                        field: 'isDiskCutter',
                        width: '*',
                        displayName: $translate.instant('label.cutter.IsDiskCutter'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i ng-if="row.entity.isDiskCutter" class="fa fa-check"></i>
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
                                    ng-click="grid.appScope.removeToolOption(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.toolOption.id == row.entity.id) {
                            $scope.createToolOption();
                        } else {
                            $scope.toolOption = angular.copy(row.entity);
                        }
                    });

                    gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {
                        if (info.toIndex == info.fromIndex) return;
                        var shift = info.toIndex < info.fromIndex ? 1 : -1,
                            shiftBegin = Math.min(info.toIndex, info.fromIndex),
                            shiftEnd = Math.max(info.toIndex, info.fromIndex);
                        $scope.toolOptions.forEach(s => {
                            if (s.orderIndex >= shiftBegin && s.orderIndex <= shiftEnd) s.orderIndex = s.orderIndex + shift;
                        });
                        info.draggedRowEntity.orderIndex = info.toIndex;
                    });
                },
                rowTemplate: `<div iris-ui-grid-row-draggable></div>`
            };

            $scope.removeToolOption = function (toolOption) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        CutterToolOptionsService.removeToolOption(toolOption).then(toolOption => {
                            alertify.success($translate.instant('label.cutter.ToolOptionRemoved'));
                            requestToolOptions();
                            $scope.createToolOption();
                        });
                    }
                });
            }

        })
})();
