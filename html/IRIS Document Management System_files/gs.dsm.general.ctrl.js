(function () {
    angular.module('iris_gs_dsm').controller('ModuleDsmGeneralViewCtrl',
        function ($scope, $state, $translate, $filter, $timeout, documentCollections, WorkflowService, ProjectSettingsService, DocumentTemplateService) {
            var projectId = $state.params.projectId;

            $scope.documentCollections = documentCollections;
            $scope.documentTemplates = [];
            $scope.workflowStates = {};
            $scope.documentsListPlaceholdersDirectory = [];
            var documentsListPlaceholdersDirectoryCache = {};

            $scope.mapToDocumentsListPlaceholdersDirectory = function(settings) {
                settings.mobileDocumentsListPlaceholders || (settings.mobileDocumentsListPlaceholders = []);
                $scope.documentsListPlaceholdersDirectory = settings.mobileDocumentsListPlaceholders.map(o => { return { value: o }; });
            };

            $scope.getWorkflowStatesDirectory = function(documentTemplateId) {
                $scope.workflowStates[documentTemplateId] || ($scope.workflowStates[documentTemplateId] = []);
                return $scope.workflowStates[documentTemplateId];
            };

            $scope.getDocumentsListPlaceholdersDirectory = function(item, currentPlaceholder) {
                var usedValues = item.mobileDocumentsListConfig.filter(m => m.placeholder && m.placeholder != currentPlaceholder).map(m => m.placeholder);
                if (!usedValues || !usedValues.length) return $scope.documentsListPlaceholdersDirectory;

                var usedValuesHash = usedValues.join("$");
                if (!documentsListPlaceholdersDirectoryCache[usedValuesHash]) {
                    documentsListPlaceholdersDirectoryCache[usedValuesHash] = $scope.documentsListPlaceholdersDirectory.filter(t => {
                        return usedValues.indexOf(t.value) < 0;
                    });
                }
                return documentsListPlaceholdersDirectoryCache[usedValuesHash];
            };

            $scope.refreshDocumentTemplates = function() {
                $timeout(() => {
                    if ($scope.dsm_settings && $scope.dsm_settings.settings.documentCollectionAlias) {
                        var documentCollection = $scope.documentCollections.filter(t => t.alias == $scope.dsm_settings.settings.documentCollectionAlias);
                        DocumentTemplateService.queryByCollection(projectId, documentCollection[0].id).then(res => {
                            $scope.documentTemplates = res;
                            $scope.refreshWorkflowStates();
                        });
                    } else {
                        $scope.documentTemplates = [];
                    }
                });
            };

            $scope.refreshWorkflowStates = function(setting) {
                $timeout(() => {
                    $scope.dsm_settings.settings.documentSettings.forEach(s => {
                        if (setting && (s != setting)) return;

                        s.workflowStates = [];
                        if (!s.documentTemplateId) return;

                        var workflowId = $filter("IrisFilterField")(s.documentTemplateId, [$scope.documentTemplates, "workflowId"]);
                        if (workflowId) {
                            WorkflowService.getWorkflowStates(workflowId).then(res => {
                                res.sort((a, b) => a.id - b.id);
                                $scope.workflowStates[s.documentTemplateId] = res.map(t => {
                                    t.translatedName = $filter("irisTranslate")(t.name, t.nameTranslations);
                                    return t;
                                });
                            });
                        }
                    })
                });
            };

            function refreshData() {
                $scope.refreshDocumentTemplates();
                $scope.mapToDocumentsListPlaceholdersDirectory($scope.dsm_settings.settings);
            };

            ProjectSettingsService.getProjectSettingsById("dsm", projectId).then(res => {
                res.settings = res.settings || {};
                res.settings.documentSettings = res.settings.documentSettings || [];
                res.settings.updateOnDaysColors = res.settings.updateOnDaysColors || [];
                $scope.dsm_settings = res;
                refreshData();
            });

            $scope.addToList = function(list) {
                list.push({});
            };

            $scope.removeFromList = function(list, index) {
                if (list.length <= 0) return;
                list.splice(index, 1);
            };

            $scope.saveDsmGeneral = function () {
                var saveSettings = angular.copy($scope.dsm_settings);

                ProjectSettingsService.saveProjectSettings("dsm", saveSettings, projectId).then(res => {
                    $scope.dsm_settings = res;
                    alertify.success($translate.instant("label.SavedSuccessfully"));
                });
            };

            $scope.addMobileDocument = function(templateSettings) {
                templateSettings.mobileDocumentsListConfig || (templateSettings.mobileDocumentsListConfig = []);
                templateSettings.mobileDocumentsListConfig.push({});
            };

            $scope.removeMobileDocument = function(templateSettings, index) {
                if (templateSettings.mobileDocumentsListConfig.length <= 0) return;
                templateSettings.mobileDocumentsListConfig.splice(index, 1);
            };

            $scope.$watch("documentsListPlaceholdersDirectory.length", function() {
                documentsListPlaceholdersDirectoryCache = {};
            });

            $scope.addFilter = function(target) {
                target.push({});
            };

            $scope.removeFilter = function(source, filter) {
                var filterIndex = source.indexOf(filter);
                if (filterIndex >= 0) {
                    source.splice(filterIndex, 1);
                }
            };

            $scope.daysColorGridOptions = {
                data: 'dsm_settings.settings.updateOnDaysColors',
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
                                <button class="btn btn-link" ng-click="grid.appScope.removeFilter(grid.appScope.dsm_settings.settings.updateOnDaysColors, row.entity)">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ]
            };
        });
})();
