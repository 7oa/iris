(function() {

    'use strict';

    angular.module('iris_gs_integration_states', []);
    
    angular.module('iris_gs_integration_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.integration', {
                    url: '/integration',
                    controller: function() {},
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.integration.mobile-devices', {
                    url: '/mobile-devices',
                    controller: 'ModuleIntegrationMobileDevicesViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/integration/ms.integration.mobile-devices.html`
                });
        }
    )
})();
