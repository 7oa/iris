(function () {
    angular.module('iris_gs_ims').controller('ImsFolderSelectorCtrl',
        function ($scope, $uibModal, $uibModalInstance, FoldersService) {
            $scope.config = iris.config;
            $scope.selected = {folder: null};
            $scope.folders = angular.copy(FoldersService.getFolders());
        });
})();