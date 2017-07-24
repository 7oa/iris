(function () {

    angular.module('iris_gs_devices_edit', []);

    angular.module('iris_gs_devices_edit').controller('ModuleManageDevicesEditCtrl',
        function ($scope, $controller, $translate, $timeout, $q, params, $uibModalInstance, DevicesService, UserGroupsService, SecurityService) {
            $scope.setDeviceTypeTemplateUrl = function () {
                if ($scope.device.deviceType === 'TBM') {
                    $scope.deviceTypeTemplateUrl = iris.config.componentsUrl + '/global-settings/templates/device-type-templates/device-type.tbm.html';
                }
                else if ($scope.device.deviceType === 'SBR') {
                    $scope.deviceTypeTemplateUrl = iris.config.componentsUrl + '/global-settings/templates/device-type-templates/device-type.sbr.html';
                }
                else if ($scope.device.deviceType === 'SEPARATION_PLANT') {
                    $scope.deviceTypeTemplateUrl = iris.config.componentsUrl + '/global-settings/templates/device-type-templates/device-type.separation-plant.html';
                }
                else if ($scope.device.deviceType === 'GEOMONITORING') {
                    $scope.deviceTypeTemplateUrl = iris.config.componentsUrl + '/global-settings/templates/device-type-templates/device-type.geomonitoring.html';
                }
                else if ($scope.device.deviceType === 'CONVEYER_BELT') {
                    $scope.deviceTypeTemplateUrl = iris.config.componentsUrl + '/global-settings/templates/device-type-templates/device-type.conveyer-belt.html';
                }
                console.log('setted device template: ', $scope.deviceTypeTemplateUrl);
            };

            $scope.deviceId = params.object_id;
            
            $scope.forms = {};
            $scope.tabs = {};

            function setActiveTab(tab) {
                $scope.tabs.active = tab;
            }

            $scope.tabSelect = function() {
                $timeout(() => iris.grid.fixWidth($scope.userGroupsGridOptions.gridAPI), 50);
            };

            $scope.availableDeviceTypes = DevicesService.getDeviceTypes();
            $scope.availableShieldTypes = DevicesService.getDeviceShieldTypes();
            $scope.deviceTypeTemplateUrl = '';
            if (!params.object_id) {
                $scope.is_add = true;
                $scope.device = DevicesService.createDevice();
                // preselect
                $scope.device.deviceType = $scope.availableDeviceTypes[0];
                $scope.device.settings = {};
                $scope.setDeviceTypeTemplateUrl();
            }
            else {
                $scope.is_add = false;
                $scope.device = DevicesService.getById(params.object_id);
                $scope.setDeviceTypeTemplateUrl();
                console.log("Device to edit: ", $scope.device);
            }

            $scope.save = function () {
                if (!$scope.hasAnyPermission()) {
                    setActiveTab('UserGroups');
                    alertify.error($translate.instant('message.config.NoUserGroupPermissions'));
                    return;
                }

                DevicesService.saveDevice($scope.device).then(function(device) {
                    if ($scope.is_add) {
                        $scope.deviceId = device.id;
                        $scope.is_add = false;

                        var realGroups = UserGroupsService.getUserGroups(),
                            promises = [];

                        $scope.userGroups.forEach(g => {
                            var realGroup = realGroups.find(rg => rg.id == g.id),
                                addPermissions = [];
                            if (!realGroup) return;
                            ['read', 'update'].forEach(a => {
                                if (g[a] && g[a].allowed) {
                                    addPermissions.push(setPermission(realGroup, a, true));
                                }
                            });
                            addPermissions.length && promises.push(UserGroupsService.addPermissionsToUserGroup(realGroup.id, addPermissions).then(pRes => {
                                realGroup.permissions = pRes.permissions;
                            }));
                        });

                        $q.all(promises).then(() => {
                            alertify.success($translate.instant('message.DeviceSaved'));
                            $uibModalInstance.close($scope.device);
                        });
                    } else {
                        alertify.success($translate.instant('message.DeviceSaved'));
                        $uibModalInstance.close($scope.device);
                    }
                })
            };

            $scope.userGroups = $scope.is_add
                ? UserGroupsService.getUserGroups().map(g => angular.copy(g))
                : UserGroupsService.getUserGroups();

            $scope.userCanChangePermission = function (userGroup, action) {
                return true;
            };

            $scope.hasAnyPermission = function() {
                if ($scope.is_add) {
                    for (let i = 0; i < $scope.userGroups.length; i++) {
                        if (($scope.userGroups[i]['read'] && $scope.userGroups[i]['read'].allowed)
                            || ($scope.userGroups[i]['update'] && $scope.userGroups[i]['update'].allowed))
                            return true;
                    }
                    return false;
                } else {
                    return true;
                }
            };

            function getPermission(userGroup, action) {
                return $scope.is_add ? userGroup[action] : UserGroupsService.getUserGroupPermissionForSubjectAndAction(userGroup, $scope.deviceId, 'Device', action);
            }

            function createPermission(action, allowed) {
                return $scope.is_add ? {allowed: allowed} : SecurityService.createPermission('Device', $scope.deviceId, action, allowed);
            }

            $scope.hasPermission = function (userGroup, action) {
                var permission = getPermission(userGroup, action);
                return permission ? permission.allowed : false;
            };

            function setPermission(userGroup, action, allowed) {
                var permission = getPermission(userGroup, action);
                if (permission) {
                    permission.allowed = allowed;
                } else {
                    permission = createPermission(action, allowed);
                    if ($scope.is_add) {
                        userGroup[action] = permission;
                    } else {
                        userGroup.permissions.push(permission);
                    }
                }
                return permission;
            }

            $scope.togglePermission = function (userGroup, action) {
                var permission = setPermission(userGroup, action, !$scope.hasPermission(userGroup, action));

                if (action == 'read' && !permission.allowed) {
                    setPermission(userGroup, 'update', false);
                } else if (action == 'update' && permission.allowed) {
                    setPermission(userGroup, 'read', true);
                }
            };

            $scope.userGroupsGridOptions = {
                data: 'userGroups',

                enableSorting: true,
                enableFiltering: true,
                enableVerticalScrollbar: true,

                onRegisterApi(gridApi) {
                    $scope.userGroupsGridOptions.gridAPI = gridApi;
                },

                columnDefs: [
                    {
                        field: 'name',
                        displayName: $translate.instant('label.GroupName'),
                        width: '*'
                    }, {
                        name: 'read',
                        displayName: $translate.instant('label.Read.present'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link disabled-visible"
                                        ng-disabled="!grid.appScope.userCanChangePermission(row.entity, 'read')"
                                        ng-click="grid.appScope.togglePermission(row.entity, 'read')">
                                    <i class="fa" ng-class="grid.appScope.hasPermission(row.entity, 'read') ? 'fa-check' : 'fa-square-o'"/>
                                </button>
                            </div>`
                    }, {
                        name: 'edit',
                        displayName: $translate.instant('label.Edit'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link disabled-visible"
                                        ng-disabled="!grid.appScope.userCanChangePermission(row.entity, 'update')"
                                        ng-click="grid.appScope.togglePermission(row.entity, 'update')">
                                    <i class="fa" ng-class="grid.appScope.hasPermission(row.entity, 'update') ? 'fa-check' : 'fa-square-o'"/>
                                </button>
                            </div>`
                    }
                ]
            };
        });

    angular.module('iris_gs_devices_edit').controller('ModuleManageSensorsEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, DevicesService, SensorsService) {
            $scope.availableTypes = SensorsService.getSensorTypes();
            $scope.availableDataSources = SensorsService.getSensorTypes();
            $scope.availableSensorStates = SensorsService.getSensorStates();
            $scope.devices = DevicesService.getDevices();
            if (!params.object_id) {
                $scope.is_add = true;
                $scope.sensor = SensorsService.createSensor();
                $scope.sensor.deviceId = params.data.deviceId;
                $scope.sensor.sensorDataSourceType = $scope.availableDataSources[0].type;
                $scope.sensor.sensorState = $scope.availableSensorStates[0].state;
            }
            else {
                $scope.is_add = false;
                $scope.sensor = SensorsService.getSensorById(params.data.deviceId, params.object_id).then(function (sensor) {
                    $scope.sensor = sensor;
                    $scope.sensor.deviceId = params.data.deviceId;
                    console.log("Sensor to edit: ", $scope.sensor);
                });

            }
        
            $scope.save = function () {
                SensorsService.saveSensor($scope.sensor, params.data).then(function () {
                    alertify.success($translate.instant('message.SensorSaved'));
                    $uibModalInstance.close($scope.sensor);
                })
            };
        });

    angular.module('iris_gs_devices_edit').controller('ModuleManageSensorGeoPositionCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, availableSensorTypes, SensorsService, GeosensorTypesService, GeosensorsService) {
            $scope.availableSensorTypes = availableSensorTypes;
            $scope.geosensor;
            if (params.sensor_id) {
                $scope.sensor = SensorsService.getSensorById(params.device_id, params.sensor_id).then(function (sensor) {
                    $scope.sensor = sensor;
                    GeosensorsService.getGeosensor($scope.sensor).then(result => {
                        if (result.id) {
                            $scope.geosensor = result;
                            $scope.geosensor.geosensorType = +$scope.geosensor.geosensorType.id;
                        } else {
                            $scope.geosensor = GeosensorsService.createGeosensor($scope.sensor);
                        }
                    })
                    console.log("Geosensor to edit: ", $scope.geosensor);
                });
            }
            else {
                console.log("No sensor selected!");
            }

            $scope.save = function () {
                $scope.geosensor.geosensorType = $scope.availableSensorTypes.find(it => it.id == +$scope.geosensor.geosensorType);
                GeosensorsService.saveGeosensor($scope.sensor, $scope.geosensor).then(function () {
                    alertify.success($translate.instant('message.SensorSaved'));
                    $uibModalInstance.close($scope.geosensor);
                })
            };
        });


    angular.module('iris_gs_devices_edit').controller('ModuleManageDataSeriesEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, DataSeriesService, IrisUnitsService) {
            $scope.availableSensors = params.data.availableSensors;
            $scope.units = IrisUnitsService.getUnitsAsArray();
            $scope.availableDataSeriesTypes = DataSeriesService.getTypes();
            $scope.availableDataSeriesDataTypes = DataSeriesService.getDSDatTypes();
            $scope.is_add = !params.object_id;

            if (params.data && params.data.deviceId) {
                if (!params.object_id) {
                    $scope.dataSeries = DataSeriesService.createSensorDataSeries({
                        deviceId: params.data.deviceId,
                        deviceSensorId: params.data.sensorId
                    });
                }
                else {
                    $scope.dataSeries = DataSeriesService.getSensorDataSeriesById(params.data.sensorId, params.object_id).then(function (dataSeries) {
                        $scope.dataSeries = dataSeries;
                    });
                }
            }

            $scope.save = function () {
                DataSeriesService.saveDataSeries($scope.dataSeries).then(function (value) {
                    alertify.success($translate.instant('message.DataSeriesSaved'));
                    $uibModalInstance.close(value);
                });
            };
        });
})();