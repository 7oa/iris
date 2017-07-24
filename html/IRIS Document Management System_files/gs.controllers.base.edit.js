(function () {
    
    angular.module('iris_gs_base_edit', []);
    
    angular.module('iris_gs_base_edit').controller('UserSettingsBaseEditCtrl',
        function ($scope, $stateParams, $translate, $uibModalInstance, UserSettingsService, UserService) {
            UserSettingsService.getUserSettingsById($scope.params.settings_alias, $scope.params.object_id).then(function (settings) {
                if ($scope.is_add) settings.id = null;
                $scope.settings_object = settings;
            });

            $scope.users = [];
            $scope.available_users = []; // users, that has no settings at the moment
            UserService.getUsers().$promise.then(function (users) {
                $scope.users = users;
                UserSettingsService.getUserSettingsList($scope.params.settings_alias).then(function (settings) {
                    for (var i = 0, c = users.length; i < c; i++) {
                        var flag = true;
                        for (var j = 0, cc = settings.length; j < cc; j++) {
                            if (users[i].id == settings[j].userId) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) $scope.available_users.push(users[i]);
                    }
                })
            });

            $scope.save = function () {
                UserSettingsService.saveUserSettings($scope.params.settings_alias, $scope.settings_object, $scope.params.object_id).then(function (user_settings) {
                    alertify.success($translate.instant('text.UserSettingsSaved'));
                    $uibModalInstance.close(user_settings);
                });
            };
        });

    angular.module('iris_gs_base_edit').controller('DeviceSettingsBaseEditCtrl',
        function ($scope, $stateParams, $translate, $uibModalInstance, DeviceSettingsService, DevicesService) {
            DeviceSettingsService.getDeviceSettingsById($scope.params.settings_alias, $scope.params.object_id).then(function (settings) {
                if ($scope.is_add) settings.id = null;
                $scope.settings_object = settings;
            });

            $scope.devices = [];
            $scope.available_devices = []; // devices, that has no settings at the moment
            DevicesService.getDevices().$promise.then(function (devices) {
                $scope.devices = devices;
                DeviceSettingsService.getDeviceSettingsList($scope.params.settings_alias).then(function (settings) {
                    for (var i = 0, c = devices.length; i < c; i++) {
                        var flag = true;
                        for (var j = 0, cc = settings.length; j < cc; j++) {
                            if (devices[i].id == settings[j].deviceId) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) $scope.available_devices.push(devices[i]);
                    }
                })
            });

            $scope.save = function () {
                DeviceSettingsService.saveDeviceSettings($scope.params.settings_alias, $scope.settings_object, $scope.params.object_id).then(function (settings) {
                    alertify.success($translate.instant('text.SettingsSaved'));
                    $uibModalInstance.close(settings);
                });
            };
        });

    angular.module('iris_gs_base_edit').controller('ProjectSettingsBaseEditCtrl',
        function ($scope, $stateParams, $translate, $uibModalInstance, ProjectSettingsService, ProjectsService) {
            ProjectSettingsService.getProjectSettingsById($scope.params.settings_alias, $scope.params.object_id).then(function (settings) {
                if ($scope.is_add) settings.id = null;
                $scope.settings_object = settings;
            });

            $scope.projects = [];
            $scope.available_projects = []; // projects, that has no settings at the moment
            ProjectsService.getProjects().$promise.then(function (projects) {
                $scope.projects = projects;
                ProjectSettingsService.getProjectSettingsList($scope.params.settings_alias).then(function (settings) {
                    for (var i = 0, c = projects.length; i < c; i++) {
                        var flag = true;
                        for (var j = 0, cc = settings.length; j < cc; j++) {
                            if (projects[i].id == settings[j].projectId) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) $scope.available_projects.push(projects[i]);
                    }
                })
            });

            $scope.save = function () {
                ProjectSettingsService.saveProjectSettings($scope.params.settings_alias, $scope.settings_object, $scope.params.object_id).then(function (settings) {
                    alertify.success($translate.instant('text.SettingsSaved'));
                    $uibModalInstance.close(settings);
                });
            };
        });

    angular.module('iris_gs_base_edit').controller('ModuleSettingsBaseEditCtrl',
        function ($scope, $controller, $filter, $stateParams, $uibModalInstance, params, GlobalSettingsService) {
            $scope.params = params;
            $scope.module = GlobalSettingsService.getModule(params.module_alias);
            $scope.module_settings = GlobalSettingsService.getModuleSettings($scope.module, params.settings_alias);
            $scope.is_add = !params.object_id;

            if ($scope.module_settings && $scope.module_settings.type) {
                angular.extend($scope, $controller($filter('PascalCase')($scope.module_settings.type) + 'SettingsBaseEditCtrl', {
                    $scope: $scope,
                    $uibModalInstance: $uibModalInstance
                }));
            }
        });


})();