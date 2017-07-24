(function () {
    angular.module('iris_gs_ims').controller('ModuleImsGeneralViewCtrl',
        function ($scope, $state, $translate, $controller, $uibModal, GlobalSettingsService, FoldersService, workflows) {
            angular.extend($scope, $controller('ModuleProjectsBaseCtrl', {$scope}));

            $scope.folder = null;
            $scope.workflow = null;
            $scope.workflows = workflows;
            $scope.folders = [];
            FoldersService.requestFolders().$promise.then(res => {
                $scope.folders = res;
            });

            $scope.setWorkflow = function () {
                if($scope.ims_settings.value.workflowId){
                    $scope.workflow = $scope.workflows.find(w => w.id == $scope.ims_settings.value.workflowId);
                } else {
                    $scope.workflow = null;
                }
            };

            GlobalSettingsService.getGlobalSettingsById("ims").then(res => {
                res.value = res.value || {};
                res.value.pages = res.value.pages || new Array();
                for (var i in res.value.pages) {
                    res.value.pages[i].folders = res.value.pages[i].folders || new Array();
                }
                $scope.ims_settings = res;
                $scope.setWorkflow();
            });

            $scope.openSelectFolderModal = function (pages) {
                return $uibModal.open({
                    templateUrl: iris.config.baseUrl + '/common/components/global-settings/templates/ims/ms.ims.folder.selector.html',
                    controller: 'ImsFolderSelectorCtrl'
                }).result.then(function (result) {
                    pages.folders.push({id:result.id, path:result.path, name: result.name});
                });
            };

            $scope.openSelectProjectsFolderModal = function () {
                return $uibModal.open({
                    templateUrl: iris.config.baseUrl + '/common/components/global-settings/templates/ims/ms.ims.folder.selector.html',
                    controller: 'ImsFolderSelectorCtrl'
                }).result.then(function (result) {
                    $scope.ims_settings.value.projectsFolder = {id:result.id, path:result.path, name: result.name};
                });
            };

            $scope.saveImsGeneral = function () {
                GlobalSettingsService.saveGlobalSettings("ims", $scope.ims_settings).then(res => {
                    $scope.ims_settings = res;
                    alertify.success($translate.instant("label.SavedSuccessfully"));
                });
            };

            $scope.addPage = function() {
                $scope.ims_settings.value.pages.push({});
                $scope.ims_settings.value.pages[$scope.ims_settings.value.pages.length - 1].folders = new Array();
            };

            $scope.removePage = function(pageIndex) {
                if ($scope.ims_settings.value.pages.length <= 0) return;
                $scope.ims_settings.value.pages.splice(pageIndex, 1);
            };

            $scope.addFolder = function(pageIndex) {
                $scope.ims_settings.value.pages[pageIndex].folders.push({});
            };

            $scope.removeFolder = function(pageIndex, folderIndex) {
                if ($scope.ims_settings.value.pages.length <= 0 || $scope.ims_settings.value.pages[pageIndex].folders.length < 0) return;
                $scope.ims_settings.value.pages[pageIndex].folders.splice(folderIndex, 1);
            };

            $scope.sortableOptions = {
                handle: '.drag-target'
            };
        });
})();
