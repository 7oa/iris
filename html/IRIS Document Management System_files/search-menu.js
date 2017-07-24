(function (globals) {
    globals.angular.module('irisApp').directive('irisSearchMenu',
        function (FilesService) {

            return {
                restrict: 'A',
                scope:{
                    fileName:'=',
                    isOpen:'='
                },
                templateUrl: iris.config.directivesUrl + '/search-menu/search-menu.html',
                link: function (scope, element, attrs) {
                    scope.me = iris.config.me;
                    scope.config = iris.config;
                    scope.filteredFiles = [];
                    scope.filteredFilesOrder = ['name'];
                    scope.filteredFilesLimit = 5;
                    scope.dmsFilter = "";
                    scope.searchDMS = {name: null};

                    scope.canPreviewFile = function (file) {
                        return FilesService.previewAllowed(file);
                    };

                    scope.openPreviewFile = function (file) {
                        FilesService.openPreviewFile(file.id, file);
                    };

                    function getDMSFiles(fileName) {
                        scope.filteredFiles = [];
                        updateDMSFilter(fileName);

                        if(!fileName) return;

                        FilesService.searchFiles([{f:'name',v:[`%${fileName}%`],s:false}])
                            .then(files => {
                                files.forEach(f => {
                                    f.icon = FilesService.getColorIcon(f.mimeType);
                                    f.downloadUrl = FilesService.getFileDownloadUrl(f.id);
                                });
                                scope.filteredFiles = files;
                            });
                    }

                    function updateDMSFilter(fileName) {
                        if(!fileName) {
                            scope.dmsFilter = "";
                            return;
                        }

                        scope.dmsFilter = angular.toJson({
                            is_text_name:1,
                            text: fileName
                        });
                    }

                    scope.$watch('fileName', getDMSFiles);
                }
            };
        });
})({
    angular,
    config: iris.config
});
