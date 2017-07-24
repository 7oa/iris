(function () {
    angular.module('iris_gs_documents').controller('ModuleDocumentsFormsCtrl',
        function ($scope, $translate, $uibModal, DocumentFormService, $filter) {
            $scope.documentForms = [];
            $scope.componentsUrl = iris.config.componentsUrl;

            function refreshDocumentForms() {
                DocumentFormService.query().then(res => {
                    $scope.documentForms = res;
                    $scope.create();
                });
            }
            refreshDocumentForms();
            
            $scope.create = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.documentForm = DocumentFormService.create();
            };
            $scope.create();

            $scope.copy = function (item) {
                var copyItem = angular.copy(item);
                delete copyItem.id;
                delete copyItem.alias;
                delete copyItem.name;
                delete copyItem.translations;
                delete copyItem.isSubform;

                $uibModal.open({
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/documents/ms.documents.forms.copy.modal.html`,
                    size: 'md',
                    resolve: {
                        'documentForm': () => copyItem
                    },
                    controller: 'ModuleDocumentsFormsCopyModalCtrl'
                }).result.then((res) => {
                    $scope.save(res);
                });
            };

            $scope.save = function (item) {
                DocumentFormService.save(item).then(() => {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    refreshDocumentForms();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        DocumentFormService.remove(item).then(() => {
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            refreshDocumentForms();
                        });
                    }
                });
            };

            $scope.gridOptions = {
                data: 'documentForms',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                enableFiltering: true,

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
                        field: 'isSubform',
                        width: '*',
                        enableFiltering: false,
                        displayName: $translate.instant('label.Subform'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i ng-if="row.entity.isSubform" class="fa fa-check"></i>
                        </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 180,
                        enableSorting: false,
                        enableFiltering: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a ui-sref="module.documents.forms.structure({formId: row.entity.id})"
                               uib-tooltip="{{::'label.dsm.GoToStructure' | translate}}"
                               ng-click="$event.stopPropagation();"
                               class="btn btn-link">
                                <i class="fa fa-sitemap"></i>
                            </a>
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.Copy' | translate}}"
                                    ng-click="grid.appScope.copy(row.entity); $event.stopPropagation();">
                                <i class="fa fa-copy"></i>
                            </button>
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
                        if ($scope.documentForm.id == row.entity.id) {
                            $scope.create();
                        } else {
                            $scope.documentForm = angular.copy(row.entity);
                        }
                    });
                }
            };

            $scope.calcAlias = function() {
                if (!$scope.documentForm || !$scope.documentForm.name) return;
                $scope.documentForm.alias = $filter("irisToAlias")($scope.documentForm.name);
            };
        });
})();
