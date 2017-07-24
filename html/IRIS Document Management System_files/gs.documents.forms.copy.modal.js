angular.module('iris_gs_documents')
    .controller('ModuleDocumentsFormsCopyModalCtrl', function ($scope, $uibModalInstance, documentForm) {
        $scope.documentForm = documentForm;
        $scope.componentsUrl = iris.config.componentsUrl;

        $scope.copy = function() {
            $uibModalInstance.close($scope.documentForm);
        };
    }
);