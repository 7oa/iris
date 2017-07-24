(function () {

    'use strict';

    angular.module('iris_gs_sensor_data_import_states', []);

    angular.module('iris_gs_sensor_data_import_states').controller('ModuleSensorManagementFakeCtrl', function($scope) {} );

    angular.module('iris_gs_sensor_data_import_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.sensor-data-import', {
                    url: '/sensor-data-import',
                    controller: 'ModuleSensorManagementFakeCtrl',
                    template: '<div class="flex-col-auto b-window" ui-view></div>'
                })
                .state('module.sensor-data-import.settings', {
                    url: '/settings',
                    resolve: {
                        'devices': function(DevicesService) {
                            return DevicesService.requestDevices();
                        },
                        'buildings': function(BuildingService) {
                            return BuildingService.queryByParent(null);
                        }
                    },
                    controller: 'ModuleSensorDataImportViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/sensor-data-import/sensor-data-import-settings.html`
                })
                .state('module.sensor-data-import.settings.edit', {
                    url: '/edit/:id?:deviceId',
                    controller: 'ModuleSensorDataImportModalCtrl',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/sensor-data-import/sensor-data-import-modal.edit.html',
                    resolve:{
                        'importSettings': function ($stateParams, ImportSettingsService) {
                            return $stateParams.id == 'add'
                                ? ImportSettingsService.getImportDefaults({deviceId: $stateParams.deviceId})
                                : ImportSettingsService.getImportSettingById($stateParams.deviceId, $stateParams.id)
                        },
                        'projects': function(ProjectsService) {
                            return ProjectsService.requestProjects();
                        },
                        'devices': function(DevicesService) {
                            return DevicesService.requestDevices();
                        },
                        'buildings': function(BuildingService) {
                            var filter = [{f:'type', v:['TUNNEL', 'STORAGE']}];
                            return BuildingService.query(filter);
                        },
                        'agents': function(ProgramAgentsService) {
                            return ProgramAgentsService.query();
                        }
                    }
                })
                .state('module.sensor-data-import.agents', {
                    url: '/agents',
                    controller: 'ModuleAgentsViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/sensor-data-import/program-agents.html`
                })
                .state('module.sensor-data-import.agents.run', {
                    url: '/run/:id',
                    controller: 'ModuleAgentsRunCtrl',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/sensor-data-import/program-agents.run.html',
                    resolve:{
                        'projects': function(ProjectsService) {
                            return ProjectsService.getPreloadedProjects();
                        },
                        'agent': function ($stateParams, ProgramAgentsService) {
                            return $stateParams.id == 'add'
                                ? ProgramAgentsService.create({ type: "IMPORT", module: "MODULE" })
                                : ProgramAgentsService.get($stateParams.id)
                        }
                    }
                })
                .state('module.sensor-data-import.agents.edit', {
                    url: '/edit/:id',
                    controller: 'ModuleAgentsEditCtrl',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/sensor-data-import/program-agents.edit.html',
                    resolve:{
                        'projects': function(ProjectsService) {
                            return ProjectsService.getPreloadedProjects();
                        },
                        'agent': function ($stateParams, ProgramAgentsService) {
                            return $stateParams.id == 'add'
                                ? ProgramAgentsService.create({ type: "IMPORT", module: "MODULE" })
                                : ProgramAgentsService.get($stateParams.id)
                        }
                    }
                })
        }
    )
})();
