(function(undefined) {
    angular.module('iris_docs')
        .directive('fileSelector', function($translate, $interval, $timeout, FileUploader, FilesService, FoldersService) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    selectedFiles: '=',
                    options: '='
                },

                templateUrl: iris.config.baseUrl + '/common/components/docs/templates/docs.file-selector.html',

                link: function(scope, element, attrs) {
                    scope.files = [];
                    scope.config = iris.config;

                    scope.options || (scope.options = {});
                    scope.options.multiple = scope.options.multiple === undefined ? true : scope.options.multiple;
                    scope.options.hideSystemFolders = scope.options.hideSystemFolders === undefined ? true : scope.options.hideSystemFolders;

                    scope.onSelectFolder = function (folder) {
                        scope.options.clearSelectionOnFolderChange && (scope.selectedFiles = []);
                        !scope.options.hideDropDown && refreshUploaderUrl(folder);
                        refreshFiles(folder);
                    };

                    function syncSelection() {
                        scope.syncInProgress = true;

                        var selectedRows = scope.gridApi.selection.getSelectedGridRows();
                        selectedRows.forEach(r => {
                            var file = scope.selectedFiles.find(f => f.id == r.entity.id);
                            if (!file) r.setSelected(false);
                        });

                        var rows = scope.gridApi.core.getVisibleRows(scope.gridApi.grid);
                        scope.selectedFiles.forEach(f => {
                            var row = rows.find(r => r.entity.id == f.id);
                            if (row && !row.isSelected) row.setSelected(true);
                        });

                        scope.syncInProgress = false;
                    }

                    scope.$watch("selectedFiles.length", syncSelection);

                    function refreshFiles(folder) {
                        if (folder && folder.id) {
                            FilesService.getFolderFiles(folder.id).then(fRes => {
                                scope.files = fRes;
                                $timeout(() => syncSelection());
                            });
                        } else {
                            scope.files = [];
                        }
                    }

                    function refreshUploaderUrl(folder) {
                        scope.uploader.url = (folder && folder.id) ? FoldersService.getUploadUrl(folder) : "";
                    }

                    scope.getFileIcon = function (mime_type) {
                        return FilesService.getIcon(mime_type);
                    };

                    scope.getFileDownloadUrl = function (fileId) {
                        return FilesService.getFileDownloadUrl(fileId);
                    };

                    scope.preview = function (file) {
                        FilesService.openPreviewFile(file.id, file);
                    };

                    scope.selectAll = function() {
                        scope.refreshSelection(scope.files.map(f => {
                            return {
                                isSelected: true,
                                entity: f
                            };
                        }));
                    };

                    scope.clearSelection = function() {
                        scope.selectedFiles = [];
                    };

                    scope.refreshSelection = function(row, event) {
                        console.log('selected row = ', row);
                        if (scope.syncInProgress) return;
                        var rows = (row instanceof Array) ? row : [row];

                        rows.forEach(r => {
                            if (r.isSelected) {
                                scope.selectedFiles.push(r.entity);
                            } else {
                                var file = scope.selectedFiles.find(f => f.id == r.entity.id);
                                if (file) scope.selectedFiles.splice(scope.selectedFiles.indexOf(file), 1);
                            }
                        });
                    };

                    scope.$watch("uploader.queue.length", function(nv, ov) {
                        if (nv == ov) return;
                        nv && scope.uploader.uploadAll()
                    });

                    scope.uploader = new FileUploader({
                        url: "",
                        removeAfterUpload: true,
                        isHTML5: true,

                        onBeforeUploadItem: function () {
                            iris.loader.start('.modal-body');
                            scope.hasErrors = false;
                        },
                        onErrorItem: function (item, response, status, headers) {
                            alertify.error('Error uploading file ' + item.file.name);
                            scope.hasErrors = true;
                        },
                        onCompleteItem: function (item, response, status, headers) {
                            iris.loader.stop();
                            if (!scope.hasErrors) {
                                alertify.success($translate.instant('text.UploadSuccess'));
                            }
                            refreshFiles(scope.activeFolder);
                        }
                    });

                    scope.gridOptions = {
                        data: 'files',

                        enableFullRowSelection: true,
                        enableSelectAll: true,
                        selectionRowHeaderWidth: 35,
                        multiSelect: !!scope.options.multiple,
                        enableFiltering: !!scope.options.enableFiltering,

                        onRegisterApi: function (gridApi) {
                            scope.gridApi = gridApi;

                            gridApi.selection.on.rowSelectionChanged(scope, scope.refreshSelection);
                            gridApi.selection.on.rowSelectionChangedBatch(scope, scope.refreshSelection);

                            gridApi.pagination.on.paginationChanged(scope, () => $timeout(() => syncSelection(), 200));

                            $interval(function () {
                                scope.gridApi.core.handleWindowResize();
                            }, 500, 10);
                        },

                        columnDefs: [
                            {
                                field: 'name',
                                width: '**',
                                displayName: $translate.instant('label.Name'),
                                enableSorting: true,
                                cellTemplate: `
                                    <div class="ui-grid-cell-contents actions">
                                        <i class="fa fa-fw {{::grid.appScope.getFileIcon(row.entity.mimeType)}}"></i> {{row.entity.name}}
                                    </div>`
                            },
                            {
                                name: 'actions',
                                displayName: $translate.instant('label.Actions'),
                                width: 80,
                                enableSorting: false,
                                enableFiltering: false,
                                cellTemplate: `
                                    <div class="ui-grid-cell-contents actions">
                                        <a ng-href="{{grid.appScope.getFileDownloadUrl(row.entity.id)}}"
                                           ng-click="$event.stopPropagation();" 
                                           class="btn btn-link btn-xs"
                                           uib-tooltip="{{'label.Download' | translate}}">
                                            <i class="fa fa-download"></i></a>
                                        <button ng-click="grid.appScope.preview(row.entity); $event.stopPropagation();"
                                                class="btn btn-link btn-xs"
                                                uib-tooltip="{{'label.Preview' | translate}}">
                                            <i class="fa fa-eye"></i>
                                        </button>
                                    </div>`
                            }
                        ]
                    };
                }
            };
        });
})();