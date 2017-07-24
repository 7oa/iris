(function () {
    angular.module('irisApp').controller('DmsSmartFolderCtrl',
        function ($scope, $uibModalInstance, filter, smartFoldersSettings, UserSettingsService, smartFolder) {

            $scope.smartFoldersSettings = smartFoldersSettings;
            $scope.folder = smartFolder ||  {
                filter: angular.toJson(filter),
                id: $scope.smartFoldersSettings.settings.smartFolders.length
            };

            $scope.saveMode = folderId => $scope.smartFoldersSettings.settings.smartFolders.findIndex(f => f.id === folderId);

            $scope.save = function () {

                let index = $scope.saveMode($scope.folderId);

                if (index !== -1) {
                    $scope.smartFoldersSettings.settings.smartFolders[index] = angular.copy($scope.folder);
                } else {
                    $scope.smartFoldersSettings.settings.smartFolders.push($scope.folder);
                }

                UserSettingsService.saveUserSettings('dms-smart-folders', $scope.smartFoldersSettings, iris.config.me.id).then(res => {
                    $uibModalInstance.close(res.settings.smartFolders);
                });
            };
        });
})();