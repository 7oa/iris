(function() {

    'use strict';

    var module = angular.module('iris_gs_alarming_states', []);

    module.config(
        function ($stateProvider) {

            $stateProvider
                .state('module.alarming', {
                    url: '/device/:deviceId',
                    controller: 'ModuleAlarmingViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/alarming/ms.alarming.common.html`
                })
                .state('module.alarming.schemes', {
                    url: '/schemes',
                    controller: 'ModuleSchemesViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/alarming/ms.alarming.scheme.html`,
                    resolve: {
                        mainIntervalScanners: function($stateParams, IntervalScannerService) {
                            return isNaN(parseInt($stateParams.deviceId)) ? [] : IntervalScannerService.getMainIntervalScanners($stateParams.deviceId);
                        },
                        channels: function (AlarmingService) {
                            return AlarmingService.getChannels();
                        },
                        levels: function($stateParams, AlarmingService) {
                            return isNaN(parseInt($stateParams.deviceId)) ? [] : AlarmingService.getLevels($stateParams.deviceId);
                        },
                        companies: function(CompaniesService) {
                            return CompaniesService.getCompanies();
                        },
                        groups: function(UserGroups) {
                            var params = {
                                'exclude-fields': angular.toJson([
                                    'permissions',
                                    'createdBy',
                                    'createdOn',
                                    'updatedBy',
                                    'updatedOn'
                                ])
                            };

                            return UserGroups.query(params);
                        }
                    }
                })
                .state('module.alarming.levels', {
                    url: '/levels',
                    controller: 'ModuleLevelsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/alarming/ms.alarming.level.html`,
                    resolve: {}
                })
                .state('module.scheme', {
                    url: '/device/:deviceId/scheme/:schemeId/edit',
                    controller: 'ModuleSchemeEditCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/alarming/ms.alarming.scheme.edit.html`,
                    resolve: {
                        mainIntervalScanners: function($stateParams, IntervalScannerService) {
                            return isNaN(parseInt($stateParams.deviceId)) ? [] : IntervalScannerService.getMainIntervalScanners($stateParams.deviceId);
                        },
                        scheme: function($stateParams, AlarmingService) {
                            return AlarmingService.getScheme($stateParams.deviceId, $stateParams.schemeId);
                        },
                        units: function(IrisUtilsService) {
                            return IrisUtilsService.getUnitsList();
                        },
                        dsTypes: function(DataSeriesService) {
                            return DataSeriesService.getTypes();
                        },
                        sensorTypes: function(SensorsService) {
                            return SensorsService.getSensorTypes();
                        },
                        channels: function (AlarmingService) {
                            return AlarmingService.getChannels();
                        },
                        levels: function($stateParams, AlarmingService) {
                            return AlarmingService.getLevels($stateParams.deviceId);
                        },
                        companies: function(CompaniesService) {
                            return CompaniesService.getCompanies();
                        },
                        groups: function(UserGroups) {
                            var params = {
                                'exclude-fields': angular.toJson([
                                    'permissions',
                                    'createdBy',
                                    'createdOn',
                                    'updatedBy',
                                    'updatedOn'
                                ])
                            };

                            return UserGroups.query(params);
                        },
                        devices: function(DevicesService) {
                            return DevicesService.getDevices();
                        }
                    }
                });
        }
    )
})();