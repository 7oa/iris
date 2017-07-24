(function () {
    angular.module('irisApp').controller('DmsSearchCtrl',
        function ($scope, $state, $translate, $controller, files, FoldersService, FilesService) {
            angular.extend($scope, $controller('DmsFilesBaseCtrl', {$scope: $scope, workflowsFull:[]}));
            iris.loader.stop();

            $scope.files = files;
            $scope.folders = FoldersService.getFolders();

            console.log($scope.files);

            $scope.getPathToFile = function (folder_id) {
                var folder = FoldersService.getByIdInList(folder_id);
                if (!folder) return null;

                return folder.path;
            };

            $scope.gridOptions = {
                data: 'files',
                expandableRowTemplate: iris.config.moduleUrl + '/templates/dms.search.expandable-template.html',
                expandableRowHeight: 70,
                //subGridVariable will be available in subGrid scope
                enableFullRowSelection: false,
                enableSelectAll: true,
                selectionRowHeaderWidth: 35,
                multiSelect: true,
                columnDefs: [
                    {
                        field: 'name',
                        width: '**',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: true,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a href="javascript:void(0)" uib-tooltip="{{row.entity.name}}"
                               ng-click="grid.appScope.setSelectedFile(row.entity)">
                                <i class="fa {{::grid.appScope.getFileIcon(row.entity.mimeType)}}"></i>
                                {{row.entity.name}}
                            </a>
                        </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 230,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a ng-href="{{grid.appScope.getFileDownloadUrl(row.entity.id)}}"
                               class="btn btn-link"
                               uib-tooltip="{{'label.Download' | translate}}">
                                <i class="fa fa-download"></i>
                            </a>
                            <button ng-click="grid.appScope.goTo('dms.folders.files',{folder_id:row.entity.parentId, file: row.entity.id})"
                                    class="btn btn-link"
                                    uib-tooltip="{{'label.dms.GoToFolder' | translate}}">
                                <i class="fa fa-sign-in"></i>
                            </button>
                        </div>`
                    },
                    {
                        field: 'parentId',
                        width: '**',
                        displayName: $translate.instant('label.Path'),
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a href="javascript:void(0)" ng-click="grid.appScope.goTo('dms.folders.files',{folder_id:row.entity.parentId, file: row.entity.id})" class="btn btn-link" uib-tooltip="{{'label.dms.GoToFolder' | translate}}">
                                {{::grid.appScope.getPathToFile(row.entity.parentId)}}
                            </a> 
                        </div>`
                    },
                    {
                        field: 'updatedOn',
                        width: 150,
                        displayName: $translate.instant('label.UpdatedOn'),
                        enableSorting: true,
                        cellFilter: `date:'dd.MM.yyyy HH:mm:ss'`
                    },
                    {
                        field: 'createdBy',
                        width: '*',
                        displayName: $translate.instant('label.CreatedBy'),
                        enableSorting: true
                    },
                    {
                        field: 'size',
                        width: '*',
                        displayName: $translate.instant('label.Size'),
                        enableSorting: true,
                        cellFilter: 'filesize'
                    }
                ],
                // rowTemplate: "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" \
                // ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader, 'row-selected':row.entity.id == grid.appScope.selected_file.id}\" ui-grid-cell ></div>",
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        $scope.selectFile(row.entity);
                    });

                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                        for (var i in rows) {
                            $scope.selectFile(rows[i].entity);
                        }
                    });

                    gridApi.core.on.rowsRendered($scope, () => {
                        if (!gridApi.grid.expandable.expandedAll) {
                            gridApi.expandable.expandAllRows();
                        }
                    });
                }
            };


            $scope.removeFile = function (file) {
                alertify.confirm($translate.instant('text.dms.FileRemoveConfirm'), function (e) {
                    if (e) {
                        FilesService.remove(file.id).then(function () {
                            alertify.success($translate.instant('text.FileRemoved'));
                            for (var i = 0, c = $scope.files.length; i < c; i++) {
                                if ($scope.files[i].id == file.id) {
                                    $scope.files.splice(i, 1);
                                    break;
                                }
                            }
                        });
                    }
                });
            };

            $scope.goTo = function (state, state_params) {
                state_params = state_params || {};
                $scope.clearFilter();
                $state.go(state, state_params);
            }

        });
})();