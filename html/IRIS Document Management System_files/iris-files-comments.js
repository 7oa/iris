(function() {
    angular.module('irisFilesComments', []);

    angular.module('irisFilesComments').directive('irisFilesComments', function ($window, $translate, $filter, IrisFilesCommentsService, CommentsService, FilesService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=',
                widget: '='
            },

            templateUrl: iris.config.widgetsUrl + '/iris-files-comments/templates/iris-files-comments.view.html',

            controller: function ($scope) {
                $scope.getFileIcon = function (mime_type) {
                    return FilesService.getIcon(mime_type);
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
                scope.params = angular.extend({}, scope.params, IrisFilesCommentsService.getDefaultSettings(), scope.widget.settings);

                scope.comments = [];
                scope.files = [];

                CommentsService.query({
                    moduleName: "dms",
                    entityName: "files",
                    limit: scope.params.limit,
                    'order-by': angular.toJson([
                        { name: 'updatedOn', value: 'desc' }
                    ])
                }).then(cRes => {
                    var fileIds = cRes.map(c => c.entityId),
                        uniqueFileIds = [];
                    for (let i = 0; i < fileIds.length; i++) {
                        if (uniqueFileIds.indexOf(fileIds[i]) < 0) {
                            uniqueFileIds.push(fileIds[i]);
                        }
                    }

                    FilesService.getFilesByIds(uniqueFileIds).then(fRes => {
                        scope.files = fRes;


                        cRes.forEach(c => {
                            c.fileId = c.entityId;
                            c.fileName = $filter("IrisFilterField")(c.fileId, [fRes, "name"]);
                            c.folderId = $filter("IrisFilterField")(c.fileId, [fRes, "parentId"]);
                            c.mimeType = $filter("IrisFilterField")(c.fileId, [fRes, "mimeType"]);
                        });
                        scope.comments = cRes;
                    });
                });
            }
        }
    });

    angular.module('irisFilesComments').controller('IrisFilesCommentsConfigCtrl', function ($scope) {});

    angular.module('irisFilesComments').factory('IrisFilesCommentsService', function() {
        var defaultSettings = {
            limit: 15
        };

        return {
            getDefaultSettings: function () {
                return defaultSettings;
            }
        };
    });
})();