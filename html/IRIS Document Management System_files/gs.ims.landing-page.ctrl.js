(function () {
    angular.module('iris_gs_ims').controller('ModuleImsLandingPageViewCtrl', function ($scope, $translate, $sce, $timeout,
                                                                                       documentCollections,
                                                                                       DocumentTemplateService, GlobalSettingsService) {
        $scope.documentCollections = documentCollections;
        $scope.documentTemplates = [];

        $scope.refreshDocumentTemplates = function() {
            $timeout(() => {
                if ($scope.settings && $scope.settings.value.landingPage.documentCollectionAlias) {
                    var documentCollection = $scope.documentCollections.find(t => t.alias == $scope.settings.value.landingPage.documentCollectionAlias);
                    // TODO: replace with queryAllByCollection (not only favProject)
                    if (iris.config.me.profile.favProjectId) {
                        documentCollection && DocumentTemplateService.queryByCollection(iris.config.me.profile.favProjectId, documentCollection.id).then(res => {
                            $scope.documentTemplates = res;
                        });
                    } else {
                        alertify.error($translate.instant("message.FavoriteProjectShouldBeSet"));
                    }
                } else {
                    $scope.documentTemplates = [];
                }
            });
        };

        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };

        GlobalSettingsService.getGlobalSettingsById("ims").then(res => {
            res.value || (res.value = {});
            res.value.landingPage || (res.value.landingPage = {});
            res.value.landingPage.documentSettings || (res.value.landingPage.documentSettings = []);
            $scope.settings = res;

            $scope.refreshDocumentTemplates();
        });

        $scope.saveSettings = function () {
            GlobalSettingsService.saveGlobalSettings("ims", $scope.settings).then(res => {
                $scope.settings = res;
                alertify.success($translate.instant("label.SavedSuccessfully"));
            });
        };

        $scope.addDocument = function () {
            $scope.settings.value.landingPage.documentSettings.push({});
        };

        $scope.removeDocument = function (documentIndex) {
            if ($scope.settings.value.landingPage.documentSettings.length <= 0) return;
            $scope.settings.value.landingPage.documentSettings.splice(documentIndex, 1);
        };

        $scope.sortableOptions = {
            handle: '.drag-target'
        };
    });
})();
