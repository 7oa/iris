(function() {
    angular.module('iris_docs')
        .directive('filesList', function($translate, FilesService) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    files: '=',
                },

                templateUrl: iris.config.baseUrl + '/common/components/docs/templates/docs.files-list.html',

                link: function(scope, element, attrs) {
                    scope.allowRemove = attrs["allowRemove"] == "true";

                    scope.getFileIcon = function (mime_type) {
                        return FilesService.getIcon(mime_type);
                    };

                    scope.getFileDownloadUrl = function (fileId) {
                        return FilesService.getFileDownloadUrl(fileId);
                    };

                    scope.preview = function (file) {
                        FilesService.openPreviewFile(file.id, file);
                    };

                    scope.removeFile = function(file) {
                        var item = scope.files.find(f => f.id == file.id);
                        if (item && scope.allowRemove) {
                            scope.files.splice(scope.files.indexOf(item), 1);
                        }
                    };

                    scope.filesGridOptions = {
                        data: 'files',

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
                                width: 100,
                                enableSorting: false,
                                cellTemplate: `
                                    <div class="ui-grid-cell-contents actions">
                                        <a ng-href="{{grid.appScope.getFileDownloadUrl(row.entity.id)}}"
                                           class="btn btn-link"
                                           uib-tooltip="{{'label.Download' | translate}}">
                                            <i class="fa fa-download"></i></a>
                                        <button ng-click="grid.appScope.preview(row.entity)"
                                                class="btn btn-link"
                                                uib-tooltip="{{'label.Preview' | translate}}">
                                            <i class="fa fa-eye"></i>
                                        </button>
                                    </div>`
                            },
                            {
                                field: 'size',
                                width: '150',
                                displayName: $translate.instant('label.Size'),
                                enableSorting: true,
                                cellFilter: 'filesize'
                            }
                        ],

                        onRegisterApi: function (gridApi) {
                            scope.filesGridOptions.gridApi = gridApi;
                        }
                    };

                    scope.allowRemove && scope.filesGridOptions.columnDefs.push({
                        name: 'extraActions',
                        displayName: '',
                        width: 50,
                        enableSorting: false,
                        cellTemplate: `
                                    <div class="ui-grid-cell-contents">
                                        <button ng-click="grid.appScope.removeFile(row.entity)"
                                                class="btn btn-link"
                                                uib-tooltip="{{'label.Remove' | translate}}">
                                            <i class="fa fa-trash-o"></i>
                                        </button>
                                    </div>`
                    });
                }
            };
        });
})();