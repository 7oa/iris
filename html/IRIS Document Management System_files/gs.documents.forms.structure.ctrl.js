(function () {
    angular.module('iris_gs_documents').controller('ModuleDocumentsFormsStructureCtrl',
        function ($scope, $translate, form, DocumentFormService) {
            form.structure || (form.structure = {});
            form.structure.properties || (form.structure.properties = []);

            $scope.form = form;

            $scope.saveStructure = function() {
                if ($scope.formStructureEditor.isValid(true)) {
                    DocumentFormService.saveStructure($scope.form.id, $scope.form.structure).then(() => {
                        alertify.success($translate.instant('label.SavedSuccessfully'));
                    });
                }
            };
        });
})();
