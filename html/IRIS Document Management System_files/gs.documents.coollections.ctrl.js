(function () {
    angular.module('iris_gs_documents').controller('ModuleDocumentsCollectionsCtrl',
        function ($scope, $translate, modules, DocumentCollectionService, AdminModulesService, $filter) {
            $scope.documentCollections = [];
            $scope.modules = modules;

            // AdminModulesService.getAdminModules().then(res => {
            //     $scope.modules = res.map(t => {
            //         return {
            //             id: t.module.moduleCode,
            //             name: $translate.instant(t.module.i18nLabel)
            //         };
            //     });
            // });

            function refreshDocumentCollections() {
                DocumentCollectionService.query().then(res => {
                    $scope.documentCollections = res;
                    $scope.create();
                });
            }
            refreshDocumentCollections();
            
            $scope.create = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.documentCollection = DocumentCollectionService.create();
            };
            $scope.create();

            $scope.save = function () {
                DocumentCollectionService.save($scope.documentCollection).then(() => {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    refreshDocumentCollections();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        DocumentCollectionService.remove(item).then(() => {
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            refreshDocumentCollections();
                        });
                    }
                });
            };

            $scope.gridOptions = {
                data: 'documentCollections',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,

                columnDefs: [
                    {
                        field: 'alias',
                        width: '*',
                        displayName: $translate.instant('label.Alias')
                    },{
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'module',
                        width: '*',
                        displayName: $translate.instant('label.Module'),
                        cellFilter: 'IrisFilterField:[grid.appScope.modules]'
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
                        if ($scope.documentCollection.id == row.entity.id) {
                            $scope.create();
                        } else {
                            $scope.documentCollection = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.calcAlias = function() {
                if (!$scope.documentCollection || !$scope.documentCollection.name) return;
                $scope.documentCollection.alias = $filter("irisToAlias")($scope.documentCollection.name);
            };
        });
})();
