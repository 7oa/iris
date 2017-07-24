(function() {
    angular.module('irisInProgressFiles', []);

    angular.module('irisInProgressFiles').directive('irisInProgressFiles', function ($window, $translate, IrisInProgressFilesService, FilesService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=',
                widget: '='
            },

            templateUrl: iris.config.widgetsUrl + '/iris-in-progress-files/templates/iris-in-progress-files.view.html',

            controller: function ($scope) {
                $scope.getFileIcon = function (mime_type) {
                    return FilesService.getIcon(mime_type);
                };

                $scope.getFileDownloadUrl = function (file_id) {
                    return FilesService.getFileDownloadUrl(file_id);
                };

                $scope.goToFolder = function (folderId, fileId) {
                    if (!folderId) {
                        alertify.error($translate.instant('text.dms.FileLinkUnknownFolder'));
                        return;
                    }
                    $window.location.href = `dms/folders/${folderId}/files?file=${fileId}`;
                };
            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisInProgressFilesService.getDefaultSettings(), scope.widget.settings);

                scope.files = [];
                var userId = iris.config.me.id;

                FilesService.searchFiles([{
                    f: 'inProgressBy', v: [userId]
                }]).then(res => {
                    res.sort((a, b) => new Date(a.updatedOn) < new Date(b.updatedOn));
                    scope.files = res;
                });

                scope.gridOptions = {
                    data: "files",

                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    enableSorting: true,
                    showGridFooter: false,

                    columnDefs: [
                        {
                            field: 'name',
                            width: '*',
                            displayName: $translate.instant('label.Name'),
                            cellTemplate: `
                                            <div class="ui-grid-cell-contents actions">
                                                <a href="javascript:void(0)" ng-click="grid.appScope.goToFolder(row.entity.parentId, row.entity.id)">
                                                    <i class="fa fa-fw {{::grid.appScope.getFileIcon(row.entity.mimeType)}}"></i>
                                                    {{row.entity.name}}
                                                </a>
                                            </div>`
                        },
                        {
                            field: 'updatedOn',
                            width: 150,
                            displayName: $translate.instant('label.UpdatedOn'),
                            cellFilter: `date:'dd.MM.yyyy HH:mm:ss'`
                        },
                        {
                            name: 'actions',
                            displayName: '',
                            width: 50,
                            enableSorting: false,
                            cellTemplate: `
                                            <div class="ui-grid-cell-contents actions">
                                                <a ng-href="{{grid.appScope.getFileDownloadUrl(row.entity.id)}}"
                                                   class="btn btn-link"
                                                   uib-tooltip="{{'label.Download' | translate}}">
                                                    <i class="fa fa-download"></i></a>
                                            </div>`
                        }
                    ]
                };
            }
        }
    });

    angular.module('irisInProgressFiles').controller('IrisInProgressFilesConfigCtrl', function ($scope) {});

    angular.module('irisInProgressFiles').factory('IrisInProgressFilesService', function() {
        var defaultSettings = {};

        return {
            getDefaultSettings: function () {
                return defaultSettings;
            }
        };
    });
})();