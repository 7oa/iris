(function () {
    angular.module('irisApp').controller('DmsFileUploadCtrl',
        function ($scope, $uibModal, $uibModalInstance, $translate, $window, file, FileUploader, FilesService) {
            $scope.file = file;

            $scope.uploadParams = {
                changeName: false,
                comment: ""
            };

            $scope.$watch("uploadParams", setParams, true);

            function setParams() {
                if (!$scope.uploader || !$scope.uploader.queue || !$scope.uploader.queue.length) return;

                var upFile = $scope.uploader.queue[0];
                upFile.url = FilesService.getFileContentUrl(file.id);
                if ($scope.uploadParams.changeName) upFile.url += `?change-name=true`;
                if ($scope.uploadParams.comment) upFile.url += ($scope.uploadParams.changeName ? "&" : "?") + `comment=${$window.encodeURIComponent($scope.uploadParams.comment)}`;
            }

            $scope.uploader = new FileUploader({
                url: FilesService.getFileContentUrl(file.id),
                queueLimit: 1,
                onErrorItem: function() {
                    alertify.error($translate.instant('text.dms.FileUploadedError'));
                    $scope.hasErrors = true;
                },
                onCompleteAll: function () {
                    if (!$scope.hasErrors) alertify.success($translate.instant('text.dms.FileUploadedSuccess'));
                    $uibModalInstance.close();
                }
            });
        });
})();