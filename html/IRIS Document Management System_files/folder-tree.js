(function() {
    angular.module('iris_docs')
        .directive('folderTree', function($timeout, FoldersService) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    activeFolder: '=?',
                    api: '=?',
                    onSelect: '&select',
                    foldersSelection:'=?'
                },

                templateUrl: iris.config.baseUrl + '/common/components/docs/templates/docs.folder-tree.html',

                controller: function($scope) {
                    $scope.toggleFolderCollapsed = function (folder) {
                        FoldersService.toggleCollapsed(folder);
                    };
                },

                link: function(scope, element, attrs) {
                    var autoSelect = attrs["autoSelect"] == 'true';
                    var hideSystemFolders = attrs["hideSystemFolders"] == 'true';

                    scope.folders = [];
                    scope.config = iris.config;
                    FoldersService.requestFolders().$promise.then(res => {
                        if(scope.foldersSelection){
                            for (var f of scope.foldersSelection) {
                                scope.folders.push(FoldersService.getByIdInList(f.id))
                            }
                        } else {
                            hideSystemFolders && (res = res.filter(t => !t.isSystem));
                            var rootFolderId = attrs["rootFolderId"];
                            scope.folders = rootFolderId ? res.filter(t => t.id == rootFolderId) : res;
                        }
                        autoSelect && scope.folders.length && scope.selectFolder(scope.folders[0]);
                    });

                    scope.selectFolder = function(folder, expandToSelection) {
                        scope.activeFolder = folder;
                        scope.activeFolder.expanded = true;

                        if (expandToSelection) {
                            var currFolder = folder;
                            while (currFolder && currFolder.parentId) {
                                var parentFolder = scope.folders.filter(f => f.id == currFolder.parentId);
                                if (parentFolder && parentFolder.length) {
                                    parentFolder[0].expanded = true;
                                    currFolder = parentFolder[0];
                                } else {
                                    currFolder = null;
                                }
                            }
                        }
                        scope.onSelect && scope.onSelect({folder});
                    };

                    scope.api = {
                        selectFolder: scope.selectFolder
                    }
                }
            };
        });
})();