(function () {
    angular.module('irisApp').controller('DmsZipUploadCtrl',
        function ($scope, $window, $uibModal, $uibModalInstance, $translate, projects,
                  targetFolderId, FileUploader, FoldersService, WorkflowService, format) {
            $scope.projects = projects;
            $scope.targetFolderId = targetFolderId;
            $scope.zip = {};

            $scope.$watch("zip", setParams, true);

            $scope.workflows = [];
            $scope.uploadWorkflows = function(projectId){
                $scope.workflows = [];
                if(!projectId) return;
                WorkflowService.getWorkflows(projectId).then(workflows => $scope.workflows = workflows);
            };

            if(targetFolderId != 'root') {
                FoldersService.getById(targetFolderId).$promise.then(folder => $scope.uploadWorkflows(folder.projectId))
            }

            function setParams() {
                if (!$scope.uploader || !$scope.uploader.queue || !$scope.uploader.queue.length) return;

                var file = $scope.uploader.queue[0];
                file.url = FoldersService.getZipImportUrl($scope.targetFolderId, format);

                if ($scope.zip.projectId) file.url += `&projectId=${$scope.zip.projectId}`;
                if ($scope.zip.comment) file.url += `&comment=${$window.encodeURIComponent($scope.zip.comment)}`;

                var workflowId = $scope.zip.workflowId;
                if(!workflowId) return;

                var workflow = $scope.workflows.filter(w => w.id == workflowId)[0];
                if(!workflow) return;

                var startState = workflow.workflowStates.filter(s => s.type == 'START')[0];
                var startStateId = startState ? startState.id : null;


                file.url += `&workflowId=${workflowId}` + (startStateId ? `&workflowStateId=${startStateId}` : '');
            }

            $scope.uploader = new FileUploader({
                url: FoldersService.getZipImportUrl($scope.targetFolderId, format),
                queueLimit: 1,
                onErrorItem: function(fileItem, response, status, headers) {
                    alertify.error($translate.instant(format == 'ZIP' ? 'text.dms.ZipFolderUploadError' : 'text.dms.XlsFolderUploadError'));
                    $scope.hasErrors = true;
                },
                onCompleteAll: function () {
                    if (!$scope.hasErrors) alertify.success($translate.instant(format == 'ZIP' ? 'text.dms.ZipFolderUploadSuccess' : 'text.dms.XlsFolderUploadSuccess'));
                    $uibModalInstance.close();
                }
            });
        });
})();