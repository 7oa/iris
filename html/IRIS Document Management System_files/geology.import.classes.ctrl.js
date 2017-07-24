(function () {
    angular.module('iris_gs_geology').controller('GeologyClassesImportCtrl',
        function ($scope, $uibModalInstance, projectId, $translate, FileUploader, GeologyClassesService) {
            $scope.uploader = new FileUploader({
                url: GeologyClassesService.getImportClassesUrl(projectId),
                onBeforeUploadItem: function (item) {
                    iris.loader.start('.modal-body')
                },
                onCompleteItem: function (item, response, status, headers) {
                    iris.loader.stop();
                    alertify.success($translate.instant('text.geology.GeologyImportSuccess'));
                    $uibModalInstance.close();
                }
            });


        });
})();