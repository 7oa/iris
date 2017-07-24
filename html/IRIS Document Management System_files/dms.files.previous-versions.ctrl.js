(function(){
    angular.module('irisApp').controller('DmsPreviousVersionsCtrl',
        function ($scope, file, $translate, FilesService, $filter, FoldersSecurityService, folder, $controller) {

            angular.extend($scope, $controller('DmsFilesCommonCtrl', { $scope: $scope }));

            $scope.file = file;
            $scope.folder = folder;
            $scope.versions = $filter('orderBy')($scope.file.versions, '-updatedOn');
            $scope.versionsLength = $scope.file.versions.length;

            $scope.openPreviewVersion = function (file, version) {
                FilesService.openPreviewVersion(file.id, version.id, file);
            };

            $scope.getFolderPermissions($scope.folder);

            $scope.getVersionDownloadUrl = function (file, version) {
                return FilesService.getVersionDownloadUrl(file.id, version.id);
            };

            $scope.removeVersion = function(folder_id, file, version) {
                alertify.confirm($translate.instant('text.dms.FileVersionRemoveConfirm'), function (e) {
                    if (e) {
                        FilesService.removeVersion(file.id, version.id).then(function () {
                            alertify.success($translate.instant('label.dms.FileVersionRemoved'));
                            $scope.versions.splice($scope.versions.findIndex((v) => v.id == version.id), 1);
                            $scope.versionsLength--;
                            $scope.updateFolderFiles(folder_id);
                        });
                    }
                });
            };

            $scope.gridOptions = {
                data: 'versions',
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                },
                columnDefs: [
                    {
                        field: 'id',
                        width: '*',
                        displayName: $translate.instant('label.Version'),
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            v{{grid.appScope.versionsLength - rowRenderIndex}}
                        </div>`
                    },
                    {
                        field: 'filename',
                        width: '**',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a href="javascript:void(0)" uib-tooltip="{{row.entity.name}}">
                                <i class="fa fa-fw {{::grid.appScope.getFileIcon(row.entity.mimeType)}}"></i> {{row.entity.filename}}
                            </a>
                        </div>`
                    },
                    {
                        field: 'updatedOn',
                        width: 120,
                        displayName: $translate.instant('label.UpdatedOn'),
                        enableSorting: false,
                        cellFilter: `irisTime:grid.appScope`
                    },
                    {
                        field: 'updatedBy',
                        width: 200,
                        displayName: $translate.instant('label.UpdatedBy'),
                        enableSorting: false
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        enableSorting: false,
                        width: 100,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a href="{{grid.appScope.getVersionDownloadUrl(grid.appScope.file, row.entity)}}" class="btn btn-link btn-sm"
                                uib-tooltip="{{'label.dms.ClickToDownload' | translate}}">
                                <i class="fa fa-download"></i>
                            </a>
                            <button ng-click="grid.appScope.openPreviewVersion(grid.appScope.file, row.entity)"
                                    class="btn btn-link btn-sm" 
                                    ng-show="grid.appScope.previewAllowed(grid.appScope.file)"
                                    uib-tooltip="{{'label.Preview' | translate}}">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button ng-click="grid.appScope.removeVersion(grid.appScope.folder.id, grid.appScope.file, row.entity); $event.preventDefault(); $event.stopPropagation();"
                                ng-if="grid.appScope.hasPermission(grid.appScope.folder.id, 'delete') || grid.appScope.hasPermission('DMS', 'config', 'Module')"
                                ng-disabled="grid.appScope.folder.isLocked || row.entity.isLocked || rowRenderIndex == 0"
                                class="btn btn-link btn-sm" uib-tooltip="{{'label.Remove' | translate}}">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ],
            };
        });
})();