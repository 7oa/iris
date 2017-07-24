(function() {

    'use strict';

    angular.module('iris_gs_ringbuild_mgt_states', []);

    angular.module('iris_gs_ringbuild_mgt_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.ringbuild-management', {
                    url: '/ringbuild-management/device/:deviceId',
                    resolve: {
                        'devices': function (DevicesService) {
                            return DevicesService.requestDevices();
                        }
                    },
                    controller: 'ModuleSensorManagementBaseCtrl',
                    template: '<div class="flex-col-auto b-window" ui-view></div>'
                })
                .state('module.ringbuild-management.jack-configuration', {
                    url: '/jack-configuration',
                    controller: 'ModuleJackConfigurationViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/ringbuild-mgmt/ms.ringbuild.jack-configuration.html`
                });
        }
    )
})();
