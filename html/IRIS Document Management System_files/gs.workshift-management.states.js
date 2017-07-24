(function() {

    'use strict';

    angular.module('iris_gs_workshift_management_states', []);

    angular.module('iris_gs_workshift_management_states').config(
        function($stateProvider) {
            $stateProvider
                .state('module.workshift-management', {
                    url: '/workshift-management',
                    template: '<div class="flex-col-auto b-window" ui-view></div>'
                })
                .state('module.workshift-management.shift-model',{
                    url: '/shift-model',
                    controller: 'ModuleShiftModelViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/module.settings.workshift-management.shift-model.view.html`
                })
                .state('module.workshift-management.shift-protocol-template', {
                    url: '/shift-mgmt/shift-protocol-template',
                    controller: 'ModuleShiftProtocolTemplateViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/module.settings.workshift-management.shift-protocol-template.view.html`
                })
                .state('module.workshift-management.manual-operating-state', {
                    url: '/shift-mgmt/manual-operating-state',
                    controller: 'ModuleManualOperatingStateViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/module.settings.workshift-management.manual-operating-state.view.html`
                })
                .state('module.workshift-management.auto-operating-state', {
                    url: '/shift-mgmt/auto-operating-state',
                    controller: 'ModuleAutoOperatingStateViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/module.settings.workshift-management.auto-operating-state.view.html`
                })
                .state('module.workshift-management.internal-comment-security', {
                    url: '/shift-mgmt/internal-comment-security',
                    controller: 'InternalCommentSecurityEditCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/module.settings.workshift-management.internal-comment-security.edit.html`
                })
        }
    )
})();
