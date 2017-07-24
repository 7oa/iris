(function () {
    angular.module('iris_gs_efv').controller('ModuleEfvGeneralViewCtrl',
        function ($scope, $state, $translate, ServerFolderSelectorService, ProjectSettingsService) {
            var projectId = $state.params.projectId;

            ProjectSettingsService.getProjectSettingsById("external-files-viewer", projectId).then(res => {
                res.settings = res.settings || {targetFolder:null};
                $scope.efv_settings = res;
            });

            $scope.saveEfvGeneral = function () {
                ProjectSettingsService.saveProjectSettings("external-files-viewer", $scope.efv_settings, projectId).then(res => {
                    $scope.efv_settings = res;
                    alertify.success($translate.instant("label.SavedSuccessfully"));
                });
            };

            $scope.openSelectFolderModal = function() {
                ServerFolderSelectorService.openSelectFolderModal()
                    .then(folder => $scope.efv_settings.settings.targetFolder = folder.path);
            };
        });
})();
