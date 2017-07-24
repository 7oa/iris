(function () {
    angular.module('iris_gs_reporting_mgmt').controller('ModuleReportTypesViewCtrl',
        function ($scope, $q, $state, $translate, ReportTypeService) {
            $scope.newReportType = function() {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.reportType = ReportTypeService.newReportType({
                    projectId: $state.params.projectId,
                    labelTranslations: {},
                    isSelected: true
                });
            };
            $scope.newReportType();


            $scope.requestReportTypes = function(projectId) {
                $scope.reportTypes = [];
                ReportTypeService.getReportTypes(projectId)
                    .then(reportTypes => $scope.reportTypes = reportTypes);
            };
            $scope.requestReportTypes($state.params.projectId);


            $scope.saveReportType = function() {
                ReportTypeService.saveReportType($scope.reportType).then(reportType => {
                    alertify.success($translate.instant('label.ReportTypeSaved'));
                    $scope.requestReportTypes($state.params.projectId);
                });
            };


            $scope.deleteReportType = function(reportType) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        ReportTypeService.deleteReportType(reportType).then(reportType => {
                            alertify.success($translate.instant('label.ReportTypeRemoved'));
                            $scope.requestReportTypes($state.params.projectId);
                        });
                    }
                });
            };


            $scope.createDefaultReportTypes = function() {
                $scope.reportTypes = ReportTypeService.getDefaultReportTypes($state.params.projectId);

                var promises = $scope.reportTypes.map(rt => {
                    return ReportTypeService.saveReportType(rt);
                });

                $q.all(promises).then(result => $scope.requestReportTypes($state.params.projectId))
            };


            $scope.toggleIsSelected = function (reportType) {
               reportType.isSelected = !reportType.isSelected;
               $scope.reportType = reportType;
               $scope.saveReportType();
            };


            $scope.setAllReportTypesSelected = function (bool) {
                $scope.reportTypes.filter(type => type.isSelected == !bool).reduce(function(promise,type) {
                    return promise.then(function(res) {
                        type.isSelected = bool;
                        return ReportTypeService.saveReportType(type);
                    });
                }, $q.when())
                .then(function() {
                        alertify.success($translate.instant('label.ReportTypeSaved'));
                        $scope.requestReportTypes($state.params.projectId);
                        $scope.newReportType();
                    }
                );
            };

            $scope.gridOptions = {
                data: 'reportTypes',
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'isSelected',
                        width: '150',
                        displayName: $translate.instant('label.Selected'),
                        cellTemplate: `<div class="ui-grid-cell-contents">
                                            <button class="btn btn-link"
                                                    uib-tooltip="{{'label.ToggleIsUsed' | translate}}"
                                                    ng-click="grid.appScope.toggleIsSelected(row.entity); $event.stopPropagation();">
                                                <i class="fa"
                                                   ng-class="{'fa-check text-success': row.entity.isSelected,
                                                              'fa-times text-danger': !row.entity.isSelected}"></i>
                                            </button>
                                       </div>`


                    },
                    {
                        field: 'label',
                        width: '*',
                        displayName: $translate.instant('label.DisplayName'),
                        enableSorting: false,
                        cellFilter: 'IrisFilterField:[grid.appScope.labelTranslations]'
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
                                    ng-click="grid.appScope.deleteReportType(row.entity); $event.stopPropagation();"><i class="fa fa-trash-o"></i></button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.reportType.id == row.entity.id) {
                            newReportType();
                        }
                        else {
                            $scope.reportType = angular.copy(row.entity);
                        }
                    });
                }
            }
        });
})();