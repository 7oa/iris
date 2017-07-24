(function() {

    'use strict';

    angular.module('iris_gs_cuttertool_mgt_states', []);

    angular.module('iris_gs_cuttertool_mgt_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.cuttertool-management', {
                    url: '/cuttertool-management/device/:deviceId',
                    resolve: {
                        'devices': function (DevicesService) {
                            return DevicesService.requestDevices();
                        }
                    },
                    controller: 'ModuleSensorManagementBaseCtrl',
                    template: '<div class="flex-col-auto b-window"><div class="b-window" ui-view></div>'
                })
                .state('module.cuttertool-management.cutter-common', {
                    url: '/cutter-common',
                    controller: 'ModuleCutterCommonViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.common.html`
                })
                .state('module.cuttertool-management.cutter-tool-manufacturers', {
                    url: '/cutter-tool-manufacturers',
                    controller: 'ModuleCutterToolManufacturersViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-manufacturers.html`
                })
                .state('module.cuttertool-management.cutter-tool-materials', {
                    url: '/cutter-tool-materials',
                    controller: 'ModuleCutterToolMaterialsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-materials.html`
                })
                .state('module.cuttertool-management.cutter-disc-diameters', {
                    url: '/cutter-too-disc-diameters',
                    controller: 'ModuleCutterToolDiscDiametersViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-disc-diameters.html`
                })
                .state('module.cuttertool-management.cutter-tool-options', {
                    url: '/cutter-tool-options',
                    controller: 'ModuleCutterToolOptionsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-options.html`
                })
                .state('module.cuttertool-management.cutter-tool-change-reasons', {
                    url: '/cutter-tool-change-reasons',
                    controller: 'ModuleCutterToolChangeReasonsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-change-reasons.html`
                })
                .state('module.cuttertool-management.cutter-track-settings', {
                    url: '/cutter-track-settings',
                    controller: 'ModuleCutterTrackSettingsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-track-settings.html`
                })
                .state('module.cuttertool-management.cutter-advance-options', {
                    url: '/cutter-advance-options',
                    controller: 'ModuleCutterAdvanceOptionsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-advance-options.html`
                })
                .state('module.cuttertool-management.cutter-maintenance-plan', {
                    url: '/cutter-maintenance-plan',
                    controller: 'ModuleCutterMaintenancePlanViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-maintenance-setting.html`
                }).state('module.cuttertool-management.cutter-maintenance-status', {
                    url: '/cutter-maintenance-status',
                    controller: 'ModuleCutterMaintenanceStatusViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/cutter/ms.cutter.tool-maintenance-status.html`
                });

//tool-maintenance-status
        }
    )
})();
