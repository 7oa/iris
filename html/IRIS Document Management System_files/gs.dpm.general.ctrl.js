(function () {
    angular.module('iris_gs_dpm').controller('ModuleDpmGeneralViewCtrl',
        function ($scope, $state, $translate, $filter, importAgents, printTemplates, WorkflowService, ProjectSettingsService, DpmStatesManager) {
            var projectId = $state.params.projectId;

            $scope.importAgents = importAgents;
            $scope.printTemplates = printTemplates;
            $scope.workflows = [];
            $scope.workflowStates = [];
            WorkflowService.getWorkflowsByType(projectId, "DPM").then(res => {
                $scope.workflows = res;
            });

            $scope.refreshData = function(workflowId, forceRefresh) {
                if (workflowId) {
                    WorkflowService.getWorkflowStates(workflowId).then(res => {
                        res.sort((a, b) => a.id - b.id);
                        $scope.workflowStates = res.map(t => {
                            t.translatedName = $filter("irisTranslate")(t.name, t.nameTranslations);
                            return t;
                        });
                        $scope.workflowStatesForProtocolRequest = $scope.workflowStates.filter(s => DpmStatesManager.aliasGroups.forProtocolRequest.indexOf(s.alias) >= 0);
                        $scope.workflowStatesForProtocol = $scope.workflowStates.filter(s => DpmStatesManager.aliasGroups.forProtocol.indexOf(s.alias) >= 0);

                        if (forceRefresh) {
                            $scope.dpm_settings.settings.protocolFilters = [];
                            $scope.dpm_settings.settings.protocolRequestFilters = [];
                        }

                        if (forceRefresh || !$scope.dpm_settings.settings.versionHistoryComments || !$scope.dpm_settings.settings.versionHistoryComments.length) {
                            $scope.dpm_settings.settings.versionHistoryComments = $scope.workflowStates.map(ws => {
                                return {
                                    workflowStateId: ws.id,
                                    comment: "",
                                    cancelProcessing: false
                                }
                            });
                        }
                    });
                } else {
                    $scope.dpm_settings.settings.protocolFilters = [];
                    $scope.dpm_settings.settings.protocolRequestFilters = [];
                    $scope.dpm_settings.settings.versionHistoryComments = [];
                    $scope.dpm_settings.settings.updateOnDaysColors = [];
                    $scope.workflowStates = [];
                    $scope.workflowStatesForProtocolRequest = [];
                    $scope.workflowStatesForProtocol = [];
                }
            };

            //$scope.$watch("dpm_settings.settings.workflowId", (nv, ov) => {
            //    if (nv == ov) return;
            //    refreshHistoryComments(nv, true);
            //});

            ProjectSettingsService.getProjectSettingsById("dpm", projectId).then(res => {
                res.settings = res.settings || {};
                res.settings.protocolFilters = res.settings.protocolFilters || [];
                res.settings.protocolRequestFilters = res.settings.protocolRequestFilters || [];
                res.settings.versionHistoryComments = res.settings.versionHistoryComments || [];
                res.settings.updateOnDaysColors = res.settings.updateOnDaysColors || [];

                $scope.dpm_settings = res;
                $scope.refreshData($scope.dpm_settings.settings.workflowId);
            });

            $scope.saveDpmGeneral = function () {
                ProjectSettingsService.saveProjectSettings("dpm", $scope.dpm_settings, projectId).then(res => {
                    $scope.dpm_settings = res;
                    alertify.success($translate.instant("label.SavedSuccessfully"));
                });
            };

            $scope.addFilter = function(target) {
                target.push({});
            };

            $scope.removeFilter = function(source, filter) {
                var filterIndex = source.indexOf(filter);
                if (filterIndex >= 0) {
                    source.splice(filterIndex, 1);
                }
            };

            function getFiltersGridOptions(source, workflowStatesSource) {
                return {
                    data: `dpm_settings.settings.${source}`,
                    enableFullRowSelection: true,
                    enableSelectAll: false,
                    selectionRowHeaderWidth: 35,
                    multiSelect: false,
                    columnDefs: [
                        {
                            field: 'name',
                            width: '*',
                            displayName: $translate.instant('label.Name'),
                            cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div iris-field
                                     iris-field-offset="0"
                                     inline
                                     required
                                     type="text"
                                     style="width: 100%;"
                                     ng-model="row.entity.name"></div>
                            </div>`
                        },
                        {
                            field: 'workflowStateIds',
                            width: '**',
                            displayName: $translate.instant('label.Status'),
                            cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div iris-field
                                     iris-field-offset="0"
                                     inline
                                     required
                                     type="selectize"
                                     multiple="true"
                                     iris-select-directory="grid.appScope.${workflowStatesSource}"
                                     iris-select-text="translatedName"
                                     style="margin-top: 0"
                                     ng-model="row.entity.workflowStateIds"></div>
                            </div>`
                        },
                        {
                            name: 'actions',
                            width: 50,
                            displayName: '',
                            cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link" ng-click="grid.appScope.removeFilter(grid.appScope.dpm_settings.settings.${source}, row.entity)">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                        }
                    ]
                };
            }

            $scope.protocolRequestFiltersGridOptions = getFiltersGridOptions("protocolRequestFilters", "workflowStatesForProtocolRequest");
            $scope.protocolFiltersGridOptions = getFiltersGridOptions("protocolFilters", "workflowStatesForProtocol");

            $scope.versionHistoryCommentsGridOptions = {
                data: 'dpm_settings.settings.versionHistoryComments',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'cancelProcessing',
                        width: '150',
                        displayName: $translate.instant('label.dpm.CancelProcessing'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link"
                                        uib-tooltip="{{'label.Toggle' | translate}}"
                                        ng-click="row.entity.cancelProcessing = !row.entity.cancelProcessing; $event.stopPropagation();">
                                    <i class="fa"
                                       ng-class="{'fa-check-square-o': row.entity.cancelProcessing,
                                                  'fa-square-o': !row.entity.cancelProcessing}"></i>
                                </button>
                            </div>`
                    },
                    {
                        field: 'workflowStateId',
                        width: '*',
                        displayName: $translate.instant('label.Status'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{row.entity.workflowStateId | IrisFilterField:[grid.appScope.workflowStates,'translatedName']}}
                            </div>`
                    },
                    {
                        field: 'comment',
                        width: '**',
                        displayName: $translate.instant('label.Comment'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div iris-field
                                     iris-field-offset="0"
                                     inline
                                     type="text"
                                     style="width: 100%;"
                                     ng-model="row.entity.comment"></div>
                            </div>`
                    }
                ]
            };

            $scope.daysColorGridOptions = {
                data: 'dpm_settings.settings.updateOnDaysColors',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'day',
                        width: '*',
                        displayName: $translate.instant('label.Day'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <div iris-field
                                required
                                inline
                                type="number"
                                ng-model="row.entity.day"
                                iris-field-offset="0"
                                style="width: 100%"> 
                            </div>
                        </div>`
                    },
                    {
                        field: 'color',
                        width: '*',
                        displayName: $translate.instant('label.Color'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <div iris-field
                                required
                                inline
                                type="color"
                                ng-model="row.entity.color"
                                iris-field-offset="0"
                                style="width: 100%">
                            </div>
                        </div>`
                    },
                    {
                        name: 'actions',
                        width: 50,
                        displayName: '',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link" ng-click="grid.appScope.removeFilter(grid.appScope.dpm_settings.settings.updateOnDaysColors, row.entity)">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ]
            };
        });
})();
