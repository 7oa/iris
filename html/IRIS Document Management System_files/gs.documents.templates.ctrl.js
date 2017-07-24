(function () {
    angular.module('iris_gs_documents').controller('ModuleDocumentsTemplatesCtrl',
        function ($scope, $state, $translate, $controller, GUID, projects, forms, collectionNames,
                  DocumentTemplateService, workflows, agents, $filter) {
            angular.extend($scope, $controller('ModuleProjectsBaseCtrl', { $scope }));

            var projectId = $state.params.projectId;

            $scope.forms = forms;
            $scope.collectionNames = collectionNames;
            $scope.documentTemplates = [];
            $scope.workflows = workflows;
            $scope.agents = agents;

            function refreshDocumentTemplates() {
                if (projectId) {
                    DocumentTemplateService.query(projectId).then(res => {
                        $scope.documentTemplates = res;
                        $scope.create();
                    });
                } else {
                    $scope.documentTemplates = [];
                }
            }
            refreshDocumentTemplates();

            $scope.create = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.documentTemplate = DocumentTemplateService.create({
                    projectId: projectId,
                    alias: GUID.create()
                });
            };
            $scope.create();

            $scope.save = function () {
                DocumentTemplateService.save($scope.documentTemplate).then(() => {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    refreshDocumentTemplates();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        DocumentTemplateService.remove(item).then(() => {
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            refreshDocumentTemplates();
                        });
                    }
                });
            };

            $scope.gridOptions = {
                data: 'documentTemplates',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,

                columnDefs: [
                    {
                        field: 'alias',
                        width: '*',
                        displayName: $translate.instant('label.Alias')
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name'),
                        cellFilter: `irisTranslate : row.entity.translations.name`
                    },
                    {
                        field: 'collectionNameId',
                        width: '*',
                        displayName: $translate.instant('label.documents.Collection'),
                        cellFilter: `IrisFilterField : [grid.appScope.collectionNames]`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 180,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link"
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
                        if ($scope.documentTemplate.id == row.entity.id) {
                            $scope.create();
                        } else {
                            $scope.documentTemplate = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.calcAlias = function() {
                if (!$scope.documentTemplate || !$scope.documentTemplate.name) return;
                $scope.documentTemplate.alias = $filter("irisToAlias")($scope.documentTemplate.name);
            };
        });
})();
