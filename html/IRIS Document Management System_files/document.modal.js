(function(undefined) {
    angular.module('iris_documents').controller('DocumentModalCtrl', function ($scope, $uibModalInstance, $translate,
                                                                               document, options,
                                                                               DocumentService) {
        $scope.document = document;
        $scope.options = options || {};

        $scope.options.title || ($scope.options.title = $translate.instant('label.AddDocument'));
        $scope.options.headerVisible === undefined && ($scope.options.headerVisible = true);
        $scope.options.headerEditable === undefined && ($scope.options.headerEditable = true);
        $scope.options.bodyVisible === undefined && ($scope.options.bodyVisible = true);
        $scope.options.bodyEditable === undefined && ($scope.options.bodyEditable = true);

        $scope.save = function() {
            iris.loader.start('.modal-body');
            DocumentService.save($scope.document.meta.projectId, $scope.document.meta.collectionAlias, $scope.document).then(res => {
                iris.loader.stop();
                $uibModalInstance.close(res);
            });
        };
    });
})();