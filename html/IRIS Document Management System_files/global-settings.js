(function () {

    irisAppDependencies.add('iris_global_settings');

    angular.module('iris_global_settings', ['iris_global_settings_controllers']);

    angular.module('iris_global_settings').factory('GlobalSettings', function ($resource) {
        return $resource(iris.config.apiUrl + "/global-settings/:alias", {
            alias: '@alias'
        });
    });

    angular.module('iris_global_settings').factory('GlobalSettingsService',
        function ($translate, $uibModal, $filter, ModuleService, SecurityService, GlobalSettings) {
            var modules_list = [{
                name: $translate.instant('label.System'),
                alias: 'system',
                icon: 'fa-cogs',
                rights: [{
                    subject: 'Module',
                    id: 'SYSTEM',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Countries'),
                    alias: 'countries'
                }, {
                    name: $translate.instant('label.Departments'),
                    alias: 'departments'
                }]
            }, {
                name: $translate.instant('label.Security'),
                alias: 'security',
                icon: 'fa-shield',
                rights: [{
                    subject: 'Module',
                    id: 'SECURITY',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Companies'),
                    alias: 'companies'
                }, {
                    name: $translate.instant('label.UserGroups'),
                    alias: 'user-groups',
                    customToolbar: true
                }, {
                    name: $translate.instant('label.Users'),
                    alias: 'users',
                    customToolbar: true
                }]
            }, {
                name: $translate.instant('label.Projects'),
                alias: 'projects',
                icon: 'fa-briefcase',
                rights: [{
                    subject: 'Module',
                    id: 'PROJECT_HIERARCHY',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Projects'),
                    alias: 'projects',
                    subject: 'Project'
                }]
            }, {
                name: $translate.instant('label.Devices'),
                alias: 'devices',
                icon: 'fa-train',
                rights: [{
                    subject: 'Module',
                    id: 'DEVICE_DATA',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Devices'),
                    alias: 'manage-devices',
                    subject: 'Device',
                    customToolbar: false,
                    customActions: true
                }, {
                    name: $translate.instant('label.Sensors'),
                    alias: 'manage-sensors',
                    customToolbar: true,
                    customActions: true
                }, {
                    name: $translate.instant('label.DataSeries'),
                    alias: 'manage-data-series',
                    customToolbar: true
                }]
            }, {
                name: $translate.instant('label.DataImport'),
                alias: 'sensor-data-import',
                icon: 'fa-download',
                rights: [{
                    subject: 'Module',
                    id: 'SENSOR_IMPORT',
                    action: 'read'
                }],
                settings: [{
                    name: $translate.instant('label.ImportSettings'),
                    alias: 'settings'
                }, {
                    name: $translate.instant('label.ProgramAgents'),
                    alias: 'agents'
                }]
            }, {
                name: $translate.instant('label.SensorManagement'),
                alias: 'sensor-management',
                icon: 'fa-tachometer',
                rights: [{
                    subject: 'Module',
                    id: 'DEVICE_DATA',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.IntervalScanners'),
                    alias: 'interval-scanners'
                }, {
                    name: $translate.instant('label.VirtualDataSeries'),
                    alias: 'virtual-data-series'
                }, {
                    name: $translate.instant('label.SensorGroups'),
                    alias: 'sensor-groups'
                }]
            }, {
                name: $translate.instant('label.Geomonitoring'),
                alias: 'geomonitoring',
                icon: 'fa-globe',
                rights: [{
                    subject: 'Module',
                    id: 'GEOMONITORING',
                    action: 'read'
                }],
                settings: [{
                    name: $translate.instant('Sensor Types'),
                    alias: 'sensor-types'
                }]
            }, /*{
                name: $translate.instant('label.ProgramAgents'),
                alias: 'program-agents',
                icon: 'fa-qrcode',
                rights: [{
                    subject: 'Module',
                    id: 'PROGRAM_AGENTS',
                    action: 'read'
                }],
                settings: [{
                    name: $translate.instant('label.ProgramAgents'),
                    alias: 'agents'
                }]
            },*/ {
                name: $translate.instant('label.PersonnelManagement'),
                alias: 'personnel-mgmt',
                icon: 'fa-users',
                rights: [{
                    subject: 'Module',
                    id: 'PERSONNEL_MGMT',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.JobTitles'),
                    alias: 'job-titles'
                }, {
                    name: $translate.instant('label.Staff'),
                    alias: 'staff'
                }]
            }, {
                name: $translate.instant('label.TaskManagement'),
                alias: 'task-mgmt',
                icon: 'fa-check',
                rights: [{
                    subject: 'Module',
                    id: 'TASK_MGMT',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.ProjectSettings'),
                    alias: 'project-settings'
                }]
            }, {
                name: $translate.instant('label.Notifications'),
                alias: 'notification-mgmt',
                icon: 'fa-envelope',
                rights: [{
                    subject: 'Module',
                    id: 'NOTIFICATIONS',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Templates'),
                    alias: 'notification-templates'
                }]
            }, {
                name: $translate.instant('label.WorkShiftDataManagement'),
                alias: 'workshift-management',
                icon: 'fa-gavel',
                rights: [{
                    subject: 'Module',
                    id: 'SHIFT_MANAGEMENT',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.ShiftModel'),
                    alias: 'shift-model'
                }, {
                    name: $translate.instant('label.ShiftProtocolTemplate'),
                    alias: 'shift-protocol-template'
                }, {
                    name: $translate.instant('label.ManualOperatingState'),
                    alias: 'manual-operating-state'
                }, {
                    name: $translate.instant('label.AutomaticOperatingState'),
                    alias: 'auto-operating-state'

                }, {
                    name: $translate.instant('label.InternalCommentSecurity'),
                    alias: 'internal-comment-security'

                }]
            }, {
                name: $translate.instant('label.Geology'),
                alias: 'geology',
                icon: 'fa-adjust',
                rights: [{
                    subject: 'Module',
                    id: 'GEOLOGY',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.geology.GeologicalClassesParameters'),
                    alias: 'geological-classes-parameters'
                }, {
                    name: $translate.instant('label.geology.GeologicalClasses'),
                    alias: 'geological-classes'
                }]
            }, {
                name: $translate.instant('label.Maps'),
                alias: 'maps',
                icon: 'fa-map-o',
                rights: [{
                    subject: 'Module',
                    id: 'MAPS',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Layers'),
                    alias: 'layers'
                }, {
                    name: $translate.instant('label.Projections'),
                    alias: 'projections'
                }, {
                    name: $translate.instant('label.TileServer'),
                    alias: 'tile-server'
                }, {
                    name: $translate.instant('label.UpdateFrequency'),
                    alias: 'update-frequency-maps',
                    type: 'user'
                }]
            }, {
                name: $translate.instant('label.ReportingManagement'),
                alias: 'reporting-mgmt',
                icon: 'fa-book',
                rights: [{
                    subject: 'Module',
                    id: 'REPORTING_MGMT',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.ReportTypes'),
                    alias: 'report-types'
                }, {
                    name: $translate.instant('label.WorkDaysConfiguration'),
                    alias: 'work-days-configurations'
                }, {
                    name: $translate.instant('label.PrintTemplate'),
                    alias: 'print-templates'
                }]
            }, {
                name: $translate.instant('label.Images'),
                alias: 'images',
                icon: 'fa-image',
                rights: [{
                    subject: 'Module',
                    id: 'IMAGES',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Images'),
                    alias: 'images',
                    type: 'project'
                }]
            },{
                name: $translate.instant('label.NavigationView'),
                alias: 'navi-view',
                icon: 'fa-paper-plane-o',
                rights: [{
                    subject: 'Module',
                    id: 'NAVIGATION_VIEW',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.UpdateFrequency'),
                    alias: 'update-frequency-navigation-view',
                    type: 'user'
                }, {
                    name: $translate.instant('label.Steps'),
                    alias: 'steps',
                    type: 'user'
                }, {
                    name: $translate.instant('label.Units'),
                    alias: 'units',
                    type: 'project'
                }, {
                    name: $translate.instant('label.Arrow'),
                    alias: 'arrow',
                    type: 'device'
                }, {
                    name: $translate.instant('label.NavigationSensors'),
                    alias: 'navigation-sensors',
                    type: 'device'
                }]
            }, {
                name: $translate.instant('label.SpoilManagement'),
                alias: 'spoil-mgt',
                icon: 'fa-bar-chart',
                rights: [{
                    subject: 'Module',
                    id: 'SPOIL_MANAGEMENT',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.General'),
                    alias: 'general',
                    state: 'spoil-general'
                }, {
                    name: $translate.instant('label.Sensors'),
                    alias: 'spoil-management',
                    type: 'device'
                }]
            }, {
                name: $translate.instant('label.IntegratedManagement'),
                alias: 'ims',
                icon: 'fa-folder-open-o',
                rights: [{
                    subject: 'Module',
                    id: 'IMS',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.General'),
                    alias: 'general'
                }, {
                    name: $translate.instant('label.LandingPage'),
                    alias: 'landing-page'
                }]
            }, {
                name: $translate.instant('label.ExternalFilesViewer'),
                alias: 'efv',
                icon: 'fa-search-plus',
                rights: [{
                    subject: 'Module',
                    id: 'FilesViewer',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.General'),
                    alias: 'general'
                }]
            }, {
                name: $translate.instant('label.Documents'),
                alias: 'documents',
                icon: 'fa-file',
                rights: [{
                    subject: 'Module',
                    id: 'DOCUMENTS',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.DocumentCollections'),
                    alias: 'collections'
                }, {
                    name: $translate.instant('label.Forms'),
                    alias: 'forms'
                }, {
                    name: $translate.instant('label.DocumentTemplates'),
                    alias: 'templates'
                }]
            }, {
                name: $translate.instant('label.DigitalProtocolManagement'),
                alias: 'dpm',
                icon: 'fa-newspaper-o',
                rights: [{
                    subject: 'Module',
                    id: 'DPM',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.General'),
                    alias: 'general'
                }, {
                    name: $translate.instant('label.dpm.ProtocolTemplates'),
                    alias: 'protocol-templates'
                }]
            }, {
                name: $translate.instant('label.DigitalDamageManagement'),
                alias: 'dsm',
                icon: 'fa-chain-broken',
                rights: [{
                    subject: 'Module',
                    id: 'DAMAGE_MGMT',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.General'),
                    alias: 'general'
                }]
            }, {
                name: $translate.instant('label.Integration'),
                alias: 'integration',
                icon: 'fa-american-sign-language-interpreting',
                rights: [{
                    subject: 'Module',
                    id: 'DPM',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.MobileDevices'),
                    alias: 'mobile-devices'
                }]
            }, {
                name: $translate.instant('label.CutterToolManagement'),
                alias: 'cuttertool-management',
                icon: 'fa-sun-o',
                rights: [{
                    subject: 'Module',
                    id: 'CUTTERTOOL',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.cutter.CommonSettings'),
                    alias: 'cutter-common'
                }, {
                    name: $translate.instant('label.cutter.ToolChangeReasons'),
                    alias: 'cutter-tool-change-reasons'
                }, {
                    name: $translate.instant('label.cutter.ToolManufacturers'),
                    alias: 'cutter-tool-manufacturers'
                }, {
                    name: $translate.instant('label.cutter.ToolMaterials'),
                    alias: 'cutter-tool-materials'
                }, {
                    name: $translate.instant('label.cutter.DiscDiameters'),
                    alias: 'cutter-disc-diameters'
                }, {
                    name: $translate.instant('label.cutter.ToolOptions'),
                    alias: 'cutter-tool-options'
                }/*,{
                 name: $translate.instant('label.cutter.AdvanceOption'),
                 alias: 'cutter-advance-options'
                 }*/, {
                    name: $translate.instant('label.cutter.TrackSettings'),
                    alias: 'cutter-track-settings'
                }, {
                    name: $translate.instant('label.cutter.MaintenancePlan'),
                    alias: 'cutter-maintenance-plan'
                }, {
                    name: $translate.instant('label.cutter.MaintenancePlanStatuses'),
                    alias: 'cutter-maintenance-status'
                }
                ]
            }, {
                name: $translate.instant('label.RingBuildManagement'),
                alias: 'ringbuild-management',
                icon: 'fa-plug',
                rights: [{
                    subject: 'Module',
                    id: 'CONSTRUCTION',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.construction.JackConfiguration'),
                    alias: 'jack-configuration'
                }]
            }, {
                name: $translate.instant('label.SegmentManagement'),
                alias: 'segment-management',
                icon: 'fa-life-ring',
                rights: [{
                    subject: 'Module',
                    id: 'CONSTRUCTION',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.SegmentConfiguration'),
                    alias: 'segment-configuration',
                    customToolbar: true
                }]
            }, {
                name: $translate.instant('label.Buildings'),
                alias: 'buildings',
                icon: 'fa-cubes',
                rights: [{
                    subject: 'Module',
                    id: 'CONSTRUCTION',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Buildings'),
                    alias: 'building'
                }]
            }, {
                name: $translate.instant('label.Workflows'),
                alias: 'workflows',
                icon: 'fa-code-fork',
                rights: [{
                    subject: 'Module',
                    id: 'WORKFLOWS',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Workflows'),
                    alias: 'workflow'
                }]
            }, {
                name: $translate.instant('label.Alarming'),
                alias: 'alarming',
                icon: 'fa-bell-o',
                rights: [{
                    subject: 'Module',
                    id: 'ALARMING',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.AlarmingSchemes'),
                    alias: 'schemes'
                }, {
                    name: $translate.instant('label.AlarmingLevels'),
                    alias: 'levels'
                }]
            }, {
                name: $translate.instant('label.DocumentManagementSystem'),
                alias: 'dms',
                icon: 'fa-envelope',
                rights: [{
                    subject: 'Module',
                    id: 'DMS',
                    action: 'config'
                }],
                settings: [{
                    name: $translate.instant('label.Properties'),
                    alias: 'properties'
                }]
            }];

            var adminModules = ModuleService.getActiveModules();

            return {
                getGlobalSettingsById: function (alias) {
                    if (!alias) return;
                    var global_settings = GlobalSettings.get({alias: alias});
                    return global_settings.$promise.then(function (result) {
                        return result;
                    });
                },

                saveGlobalSettings: function (alias, settings) {
                    settings.alias = alias;
                    alias = settings.id ? alias : null;
                    return GlobalSettings.save({alias: alias}, settings, function (value) {
                        return value;
                    }).$promise;
                },

                getModulesList: function () {
                    return modules_list;
                },

                getModule: function (module_alias) {
                    for (var i in modules_list) {
                        if (modules_list[i].alias == module_alias) return modules_list[i];
                    }
                    return null;
                },

                getModuleSettings: function (module, settings_alias) {
                    if (!module || !settings_alias) return null;
                    for (var i in module.settings) {
                        if (module.settings[i].alias == settings_alias) return module.settings[i];
                    }
                    return null;
                },

                hasPermission: function (rights) {
                    if (!rights) return true;

                    var res = false;
                    for (var right of rights) {
                        //if we check for permissions to modules - check that module is activated
                        if(right.subject === 'Module'
                            && adminModules.length
                            && !adminModules.find(m => right.id === m.moduleCode)) {
                            return false;
                        }
                        res = SecurityService.hasPermissions(right.id, right.subject, right.action);
                        if (res) return res;
                    }
                    return res;
                },

                openEditModuleSettings: function (module, settings, obj_id, data, size) {
                    obj_id = obj_id || null;
                    data = data || null;
                    size = size || 'lg';

                    console.error('Deprecated. Use PopupMixin.');

                    return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.' + module + '.' + settings + '.edit.html',
                        resolve: {
                            'params': function () {
                                return {
                                    'object_id': obj_id,
                                    'settings_alias': settings,
                                    'module_alias': module,
                                    'data': data || {}
                                }
                            }

                        },
                        controller: 'Module' + $filter('PascalCase')(settings) + 'EditCtrl',
                        size: size
                    }).result;
                }
            };
        });
})();


