(function(){
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterToolChangeReasonsViewCtrl',
        function ($scope, $state, $translate, $q, CutterToolChangeReasonService) {

            var requestToolChangeReasons = function () {
                $scope.toolChangeReasons = [];
                CutterToolChangeReasonService.getToolChangeReasons($state.params.deviceId)
                    .then(toolChangeReasons => $scope.toolChangeReasons = toolChangeReasons);
            };
            requestToolChangeReasons();

            $scope.createToolChangeReason = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.toolChangeReason = {
                    deviceId: $state.params.deviceId
                }
            };
            $scope.createToolChangeReason();

            $scope.saveToolChangeReason = function () {
                CutterToolChangeReasonService.saveToolChangeReason($scope.toolChangeReason).then(toolChangeReason => {
                    alertify.success($translate.instant('label.cutter.ToolChangeReasonSaved'));
                    requestToolChangeReasons();
                    $scope.createToolChangeReason();
                });
            };

            $scope.setAllIsSelected = function(val) {
                val = !!val;

                $scope.toolChangeReasons.filter(t => t.isSelected != val).reduce(function(q, t) {
                    return q.then(function(res) {
                        t.isSelected = val;
                        return CutterToolChangeReasonService.saveToolChangeReason(t)
                    });
                }, $q.when()).then(function() {
                    alertify.success($translate.instant('message.cutter.ToolChangeReasonIsSelectedSaved'));
                    requestToolChangeReasons();
                    $scope.createToolChangeReason();
                });
            }

            $scope.toggleToolChangeReasonSelected = function (toolChangeReason) {
                toolChangeReason.isSelected = !toolChangeReason.isSelected;
                $scope.toolChangeReason = toolChangeReason;
                $scope.saveToolChangeReason();
            };

            $scope.gridOptions = {
                data: 'toolChangeReasons',
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
                        field: 'shortcut',
                        width: '*',
                        displayName: $translate.instant('label.Shortcut')
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
                        field: 'isSelected',
                        width: '*',
                        displayName: $translate.instant('label.IsUsed'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link"
                                        uib-tooltip="{{'label.ToggleIsUsed' | translate}}"
                                        ng-click="grid.appScope.toggleToolChangeReasonSelected(row.entity); $event.stopPropagation();">
                                    <i class="fa"
                                       ng-class="{'fa-check text-success': row.entity.isSelected,
                                                  'fa-times text-danger': !row.entity.isSelected}"></i>
                                </button>
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
                                    ng-click="grid.appScope.removeToolChangeReason(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function(gridApi){
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if($scope.toolChangeReason.id == row.entity.id) {
                            $scope.createToolChangeReason();
                        } else {
                            $scope.toolChangeReason = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.removeToolChangeReason = function (toolChangeReason) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        CutterToolChangeReasonService.removeToolChangeReason(toolChangeReason).then(toolChangeReason => {
                            alertify.success($translate.instant('label.cutter.ToolChangeReasonRemoved'));
                            requestToolChangeReasons();
                            $scope.createToolChangeReason();
                        });
                    }
                });
            }

        })
})();
