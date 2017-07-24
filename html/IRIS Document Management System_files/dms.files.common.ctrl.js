(function(){
    angular.module('irisApp').controller('DmsFilesCommonCtrl',
        function ($scope, FoldersSecurityService, $filter, FilesService, WorkflowService, $translate, SecurityService, FoldersService) {

            $scope.folder_permissions = [];

            $scope.hasPermission = function (folder_id, action, subject_name) {
                subject_name = subject_name || 'iris:repoContentFolder';
                return SecurityService.hasPermissions(folder_id, subject_name, action);
            };

            $scope.previewAllowed = function (file) {
                return FilesService.previewAllowed(file);
            };

            $scope.getFileIcon = function (mime_type) {
                return FilesService.getIcon(mime_type);
            };

            $scope.getFolderPermissions = function (folder) {
                FoldersSecurityService.getFolderPermissions(folder.id).then(function (permissions) {
                    $scope.folder_permissions = permissions;
                });
            };

            $scope.openPreviewFile = function (file) {
                FilesService.openPreviewFile(file.id, file);
            };

            $scope.updateFolder = function (folder_id) {
                console.log(folder_id)
                return FoldersService.getById(folder_id || $scope.folder.id).$promise.then(function (folder) {
                    $scope.folder = folder;
                    $scope.workflows = [];
                    if (folder.projectId) {
                        WorkflowService.getWorkflowsByType(folder.projectId, 'DOCUMENT').then(function (workflows) {
                            $scope.workflows = workflows.filter((w) => !!w.workflowStates.length);
                        });
                    }
                    $scope.$emit('dms.folder.content-changed');
                });
            };

            $scope.applyFilesFilter = function () {
                $scope.filtered_files = $scope.filter && $scope.filter.text != null ? $filter('filter')($scope.files, {name: $scope.filter.text}) : $scope.files;
            };

            $scope.updateWithFiles = function(files) {
                var is_file_selected = false;
                for (var i = 0, c = files.length; i < c; i++) {
                    if ($scope.selected_file && files[i].id == $scope.selected_file.id) {
                        $scope.selected_file = files[i];
                        $scope.updateSelectedFile();
                        is_file_selected = true;
                        break;
                    }
                }
                if ($scope.selected_file && !is_file_selected) $scope.setSelectedFile($scope.selected_file);
                $scope.files = files;
                $scope.applyFilesFilter();
            };

            $scope.updateFolderFiles = function (folder_id) {
                console.log("updateFolderFiles");

                FilesService.getFolderFiles(folder_id || $scope.folder.id).then(function (files) {
                    $scope.updateWithFiles(files);
                });
                $scope.updateFolder(folder_id);
            };
        });

})();