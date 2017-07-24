(function () {
    angular.module('irisApp').controller('DmsFolderEditCtrl',
        function ($scope, $uibModalInstance, $translate, $filter, $q, folder, folders, projects, dmsConfig, TagsService,
                  FoldersService, flags) {
            $scope.folder = folder;
            $scope.folder.tags = $scope.folder.tags || [];
            $scope.folders = folders;
            $scope.dmsConfig = dmsConfig;
            $scope.projects = projects;
            $scope.flags = flags;
            $scope.all_folders = FoldersService.getAllFoldersList();

            $scope.folder.tags.forEach(t => {
                var prop = $scope.dmsConfig.properties.find(p => p.name == t.type);
                if(prop) prop.value = t.value;
            });

            $scope.save = function () {
                var promises = [];
                $scope.dmsConfig.properties.forEach(p => {
                    if(p.value) {
                        promises.push(TagsService.saveTag({
                            type: p.name,
                            value: p.value,
                            name: $filter('IrisFilterField')(p.value, [p.directory])
                        }));
                    }
                });
                $q.all(promises).then(res => {
                    $scope.folder.tags = res;
                    FoldersService.save($scope.folder).then(function (folder) {
                        alertify.success($translate.instant('label.dms.FolderSaved'));
                        $uibModalInstance.close(folder);
                    });
                });
            };
        });
})();