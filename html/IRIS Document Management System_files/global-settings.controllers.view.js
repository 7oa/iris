(function () {

    angular.module('iris_global_settings_controllers', [
        'iris_gs_base',
        'iris_gs_system',
        'iris_gs_devices',
        'iris_gs_projects',
        'iris_gs_navi_view',
        'iris_gs_security',
        'iris_gs_maps',
        'iris_gs_images',
        'iris_gs_spoil_mgt',
        'iris_gs_personnel_mgmt',
        'iris_gs_notification_mgmt',
        'iris_gs_workflows',
        'iris_gs_alarming',
        'iris_gs_buildings',
        'iris_gs_sensor_management',
        'iris_gs_ims',
        'iris_gs_documents',
        'iris_gs_dpm',
        'iris_gs_dsm',
        'iris_gs_integration',
        'iris_gs_efv',
        'iris_gs_cuttertool_mgt',
        'iris_gs_workshift_management',
        'iris_gs_sensor_data_import',
        'iris_gs_reporting_mgmt',
        'iris_gs_geology',
        'iris_gs_ringbuild_mgt',
        'iris_gs_segment_management',
        'iris_gs_geomonitoring',
        'iris_gs_dms',
        'iris_gs_task_mgmt'
    ]);

    angular.module('iris_global_settings_controllers').controller('GeneralCtrl',
        function ($scope, $q, $stateParams, $translate, UserSettingsService, ExportService, PagesService, GlobalSettingsService, IrisTimeService) {
            $scope.menu_items = PagesService.getUserPages();

            $scope.global_settings = {};
            GlobalSettingsService.getGlobalSettingsById('general').then(function (settings) {
                $scope.global_settings = settings;
            });

            var globalExportDefaults = ExportService.getExportDefaults();
            var setExportSettings = function (settings) {
                settings.value = settings.value || globalExportDefaults;
                $scope.globalExportSettings = settings;
                $scope.settings = $scope.globalExportSettings.value;
                $scope.setDateTimeFormat();
            };

            GlobalSettingsService.getGlobalSettingsById('export-csv').then(setExportSettings);

            $scope.dateFormats = IrisTimeService.getDateTimeFormats();
            $scope.setDateTimeFormat = function () {
                $scope.settings.dateFormat = $scope.settings.dateFormatId && IrisTimeService.getDateTimeFormatById($scope.settings.dateFormatId).momentjsFormatString;
            };

            $scope.save = function () {
                var promises = [];
                promises.push(GlobalSettingsService.saveGlobalSettings('general', $scope.global_settings));
                promises.push(GlobalSettingsService.saveGlobalSettings('export-csv', $scope.globalExportSettings));

                $q.all(promises).then(function (results) {
                    $scope.global_settings = results[0];
                    setExportSettings(results[1]);
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                })
            }
        });

})();