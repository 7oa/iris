(function() {
    angular.module('irisFavoriteFiles').directive('irisFavoriteFiles', function (IrisFavoriteFilesService, FilesService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=?',
                widget: '=?'
            },

            templateUrl: iris.config.widgetsUrl + '/iris-favorite-files/templates/iris-favorite-files.view.html',

            controller: function ($scope) {
                $scope.config = iris.config;
                $scope.listTemplateUrl = $scope.config.directivesUrl + '/search-menu/search-menu.html';

                $scope.canPreviewFile = function (file) {
                    return FilesService.previewAllowed(file);
                };

                $scope.openPreviewFile = function (file) {
                    FilesService.openPreviewFile(file.id, file);
                };
            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisFavoriteFilesService.getDefaultSettings(), scope.widget.settings);

                scope.filteredFiles = [];

                //FilesService.searchFiles([{f:'name', v:[`%p%`], s:false}]).then(files => {
                FilesService.searchFiles(null, {'favorite': true}).then(files => {
                    files.forEach(f => {
                        f.icon = FilesService.getColorIcon(f.mimeType);
                        f.downloadUrl = FilesService.getFileDownloadUrl(f.id);
                        f.updatedOn = new Date(f.updatedOn);
                    });

                    scope.filteredFilesOrder = ['updatedOn'];
                    scope.filteredFilesReverse = true;
                    scope.filteredFilesLimit = files.length;
                    scope.filteredFiles = files;
                });
            }
        }
    });
})();