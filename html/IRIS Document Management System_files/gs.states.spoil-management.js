(function() {

    angular.module('iris_gs_spoil_mgt').config(
        function ($stateProvider) {
            $stateProvider
                .state('spoil-general', {
                    url: '/spoil-general',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/spoil-mgmt/module.settings.spoil-management.general.html',
                    controller: 'ModuleSensorManagementGeneralCtrl'
                });
        }
    );

    angular.module('iris_gs_spoil_mgt').controller('ModuleSensorManagementGeneralCtrl',
        function ($scope, $translate, GlobalSettingsService) {
            $scope.global_settings = {};
            GlobalSettingsService.getGlobalSettingsById('spoil')
                .then(settings => $scope.global_settings = settings);

            $scope.save = function () {
                GlobalSettingsService.saveGlobalSettings('spoil', $scope.global_settings)
                    .then(global_settings => {
                        $scope.global_settings = global_settings;
                        alertify.success($translate.instant('label.SavedSuccessfully'));
                    });

            }
        })

})();