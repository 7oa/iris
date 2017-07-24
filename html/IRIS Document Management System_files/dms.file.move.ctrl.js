(function () {
    angular.module('irisApp').controller('DmsFileMoveCtrl',
        function ($scope, $uibModal, $uibModalInstance, folder, enable_root, is_folder_moved, action_label, FoldersService) {
            $scope.config = iris.config;
            $scope.enable_root = enable_root || false;
            $scope.is_folder_moved = is_folder_moved;
            $scope.action_label = action_label;
            $scope.current_folder = folder;
            $scope.selected = {folder: null};
            $scope.folders = angular.copy(FoldersService.getFolders());

            $scope.setSelectedFolder = function (folder) {
                $scope.selected.folder = folder;
            }
        });
})();