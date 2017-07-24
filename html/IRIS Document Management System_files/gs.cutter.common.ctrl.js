(function () {
    angular.module('iris_gs_cuttertool_mgt').controller('ModuleCutterCommonViewCtrl',
        function ($scope, $state, $translate, DeviceSettingsService, ModuleFolderService, IrisUnitsService) {
            var deviceId = $state.params.deviceId;
            $scope.device_settings = {};

            var defaultUnits = {
                wear: 'MILLIMETER',
                toolTypeWidth: 'MILLIMETER',
                trackRadius: 'MILLIMETER',
                tunnelMeter: 'METER',
                chainage: 'METER'
            };

            $scope.units = IrisUnitsService.getPossibleConvertsForUnit('MILLIMETER');

            DeviceSettingsService.getDeviceSettingsById('cuttertool', deviceId)
                .then(settings => {
                    settings.settings = settings.settings || {};
                    settings.settings.units = settings.settings.units || defaultUnits;

                    $scope.device_settings = settings;
                });

            $scope.saveCutterCommonSettings = function () {
                DeviceSettingsService.saveDeviceSettings('cuttertool', $scope.device_settings, deviceId).then(function (settings) {
                    $scope.device_settings = settings;
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                });
            };

            $scope.openFilesModal = function () {
                $scope.device_settings.settings = $scope.device_settings.settings || {};
                ModuleFolderService.openModuleFilesModal('CUTTERTOOL', 'Device', deviceId)
                    .then(file => $scope.device_settings.settings.deviceImgId = file.id);
            };


        })
})();
