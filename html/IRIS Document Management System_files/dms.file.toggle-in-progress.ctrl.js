(function () {
    angular.module('irisApp').controller('DmsFileToggleInProgressModalCtrl',
        function ($scope, dmsAppState, $uibModal, $uibModalInstance, $translate, DmsAppService, FilesService) {
            $scope.appBundles = [];
            $scope.appState = dmsAppState || {};
            $scope.appState.available = $scope.appState.ip && $scope.appState.active;
            $scope.appState.downloadable = $scope.appState.ip && !$scope.appState.active;

            $scope.editLocallyDescription = $translate.instant('text.dms.EditLocallyDescription');

            if (!$scope.appState.active) {
                DmsAppService.getAllBundles().then(bRes => {
                    $scope.appBundles = bRes;
                });
            }

            $scope.getBundleDownloadUrl = function(bundle) {
                return DmsAppService.getBundleUrl(bundle.bundleName);
            };

            $scope.editLocal = function() {
                iris.loader.start('.modal-body');
                FilesService.localEdit($scope.selected_file.id, $scope.appState.ip).then(file => {
                    iris.loader.stop('.modal-body');
                    $uibModalInstance.close(false);
                });
            };

            $scope.toggleInProgress = function (isOpenUpload) {
                iris.loader.start('.modal-body');
                FilesService.toggleInProgress($scope.selected_file).then(file => {
                    iris.loader.stop('.modal-body');
                    $scope.selected_file = file;
                    $scope.updateSelectedFile();
                    $uibModalInstance.close(isOpenUpload);
                });
            };
        });
})();