(function() {

    'use strict';

    angular.module('iris_gs_dms_states', []);
    
    angular.module('iris_gs_dms_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.dms', {
                    url: '/dms',
                    controller: function() {},
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.dms.properties', {
                    url: '/properties',
                    controller: 'ModuleDmsPropertiesViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dms/ms.dms.properties.html`
                })
        }
    )
})();
