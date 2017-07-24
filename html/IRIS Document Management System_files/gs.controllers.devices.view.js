(function () {

    angular.module('iris_gs_devices_view', []);

    angular.module('iris_gs_devices_view').controller('ModuleManageDevicesViewCtrl',
        function ($scope, $controller, $translate, $state, DevicesService, ProjectsService) {
            $scope.items = [];
            $scope.loadItems = function () {
                DevicesService.requestDevices()
                    .then(devices => $scope.items = devices);
            };
            $scope.loadItems();

            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            angular.extend($scope.gridRowActions, {
                sensors: {
                    order: 1,
                    template: `
                        <a href="javascript:void(0)" ng-click="grid.appScope.showSensorsForDeviceId(row.entity.id)" class="btn btn-default" id="goToSensors">
                            <i class="fa fa-arrow-circle-right"></i> {{'label.Sensors' | translate}}
                        </a>`
                }
            });

            $scope.updateGridRowActions();

            var table_fields = [
                {
                    name: 'machineId',
                    displayName: $translate.instant('label.MachineId'),
                    width: '*'
                },
                {
                    name: 'name',
                    displayName: $translate.instant('label.Name'),
                    width: '**'
                },
                {
                    name: 'deviceType',
                    displayName: $translate.instant('label.Type'),
                    width: '**'
                }
            ];

            $scope.addFieldsToGrid(table_fields);

            $scope.removeFieldsFromGrid(["#"]);

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.ConfirmDeleteDevice'), function (e) {
                    if (e) {
                        DevicesService.deleteDevice(item.id).then(function () {
                            $scope.loadItems();
                            ProjectsService.cleanProjectDeviceStore();
                            alertify.success($translate.instant('message.DeviceDeleted'));

                            //if device was set in settings - remove it from settings
                            //todo create validate params service later
                            var params = $state.params.params ? angular.fromJson($state.params.params) : {};
                            if (params.deviceId == item.id) {
                                delete params.deviceId;
                                $state.params.params = angular.toJson(params);
                                $state.go($state.current.name, $state.params);
                            }
                        });
                    }
                });
            };

            $scope.showSensorsForDeviceId = function (deviceId) {
                console.log('state', $state.current.name);
                $state.go($state.current.name, {
                    settings: 'manage-sensors',
                    params: angular.toJson({'deviceId': deviceId})
                });
            };
        });

    angular.module('iris_gs_devices_view').controller('ModuleManageSensorsViewCtrl',
        function ($scope, $uibModal, $controller, $translate, $state, $stateParams, DevicesService, SensorsService, GlobalSettingsService, SecurityService) {
            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            angular.extend($scope.gridRowActions, {
                ds: {
                    order: 1,
                    template: `
                        <a href="javascript:void(0)" 
                            ng-click="grid.appScope.showDataSeriesForSensorId(row.entity.id)" 
                            class="btn btn-default">
                                <i class="fa fa-arrow-circle-right"></i> {{'label.DataSeriess' | translate}}
                        </a>`
                },
                geo: {
                    order: 2,
                    template: `
                        <a href="javascript:void(0)" 
                           ng-if="grid.appScope.hasPermissionForGeosensors"
                           ng-click="grid.appScope.showGeoPositionForSensorId(row.entity.id)" 
                           class="btn btn-default" 
                           uib-tooltip="Geoposition">
                                <i class="fa fa-globe"></i>
                        </a>`
                }
            });

            $scope.updateGridRowActions();

            /*
             * @TODO
             *  once a proper 'Geomonitoring' module has been created use config-permissions for Geomonitoring, 
             *  also use Security mixin and simply call ::hasConfigPermissions() in ng-if
             */
            $scope.hasPermissionForGeosensors = SecurityService.hasPermissions('GEOPOSITION', 'Module', 'config');

            $scope.disableAddButton = true;
            $scope.items = [];
            $scope.filter = {};
            $scope.filter.selectedDeviceId = null;
            $scope.params = angular.fromJson($stateParams.params);

            $scope.loadDevices = function () {
                DevicesService.getDevices().$promise.then(function (devices) {
                    $scope.devices = devices;
                    if ($scope.params !== undefined) {
                        if ($scope.params.deviceId) {
                            $scope.filter.selectedDeviceId = $scope.params.deviceId;
                        }
                    }
                });
            };
            $scope.loadDevices();

            $scope.loadFilteredSensors = function () {
                DevicesService.getSensorsByDeviceId($scope.filter.selectedDeviceId).then(function (sensors) {
                    $scope.items = sensors;
                    //console.log("sensors", $scope.sensors);
                });
            };

            $scope.requestSensors = function () {
                $scope.items = [];
                $scope.hasPermissionToAdd = false;
                $scope.hasPermissionToDelete = false;
                if ($scope.filter.selectedDeviceId !== null) {
                    $state.transitionTo($state.current.name, {
                        params: angular.toJson({'deviceId': $scope.filter.selectedDeviceId})
                    }, {
                        inherit: true
                    });

                    /* overwrite check permissions for add / delete sensors for selected device */
                    var hasPermissionToUpdateSelectedDevice = SecurityService.hasPermissions($scope.filter.selectedDeviceId, 'Device', 'update');
                    $scope.hasPermissionToAdd = hasPermissionToUpdateSelectedDevice;
                    $scope.hasPermissionToDelete = hasPermissionToUpdateSelectedDevice;
                    $scope.loadFilteredSensors();
                }
                else {
                    $scope.items = [];
                }
                $scope.disableAddButton = !$scope.hasPermissionToAdd;
            };

            $scope.$watch('filter.selectedDeviceId', $scope.requestSensors);

            $scope.gridOptions.enableFiltering = true;
            var table_fields = [
                {
                    name: 'name',
                    displayName: $translate.instant('label.Name'),
                    width: '*'
                }, {
                    name: 'sensorDataSourceType',
                    displayName: $translate.instant('label.SensorDataSourceType'),
                    width: '*'
                }, {
                    name: 'systemIndexName',
                    displayName: $translate.instant('label.SystemIndexName'),
                    width: '*'
                }, {
                    name: 'sensorState',
                    displayName: $translate.instant('label.SensorState'),
                    width: '*'
                }
            ];

            $scope.addFieldsToGrid(table_fields);

            // override method
            $scope.openModuleSettingsModal = function (row) {
                var sensorData = {};
                sensorData.deviceId = $scope.filter.selectedDeviceId;
                GlobalSettingsService.openEditModuleSettings($stateParams.module, $stateParams.settings, row && row.entity ? row.entity.id : null, sensorData).then(function () {
                    $scope.loadFilteredSensors();
                    console.log('refresh');
                });
            };

            $scope.remove = function (item) {
                console.log('remove', item);
                alertify.confirm($translate.instant('message.ConfirmDeleteSensor'), function (e) {
                    if (e) {
                        SensorsService.deleteSensor($scope.filter.selectedDeviceId, item.id).then(function () {
                            alertify.success($translate.instant('message.SensorDeleted'));
                            $scope.requestSensors();
                        });
                    }
                });
            };

            $scope.openImportSensorsModal = function () {
                if (!$scope.filter.selectedDeviceId) return;

                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.sensors-import.html',
                    resolve: {
                        'params': function () {
                            return {
                                'device_id': $scope.filter.selectedDeviceId
                            }
                        }
                    },
                    controller: 'ModuleManageSensorsImportCtrl',
                    size: 'lg'
                }).result
                    .then($scope.requestSensors, $scope.requestSensors); //request sensors on both $close and $dismiss
            };

            $scope.showDataSeriesForSensorId = function (sensorId) {
                console.log('state', $state.current.name);
                $state.go($state.current.name, {
                    settings: 'manage-data-series',
                    params: angular.toJson({'deviceId': $scope.filter.selectedDeviceId, 'sensorId': sensorId})
                });
            };

            $scope.showGeoPositionForSensorId = function(sensorId) {
                console.log('state', $state.current.name);

                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.devices.sensor-geo-position.edit.modal.html',
                    resolve: {
                        'params': function () {
                            return {
                                'device_id': $scope.filter.selectedDeviceId,
                                'sensor_id': sensorId
                            }
                        },
                        'availableSensorTypes': function(GeosensorTypesService) {
                            return GeosensorTypesService.getSensorTypes();
                        }
                    },
                    controller: 'ModuleManageSensorGeoPositionCtrl'
                }).result
                    .then($scope.requestSensors);
            }
        });

    angular.module('iris_gs_devices_view').controller('ModuleManageSensorsImportCtrl',
        function ($scope, $translate, params, FileUploader) {
            $scope.importStrategy = '';

            $scope.setImportStrategy = function (strategy) {
                $scope.importStrategy = strategy;
                if (!$scope.uploader) return;

                var url = `${iris.config.apiUrl}/sensors/devices/${params.device_id}/sensors-import${$scope.importStrategy === 'OPC' ? '?strategy=OPC' : ''}`;
                $scope.uploader.queue.forEach(item => item.url = url);

            };

            $scope.import_errors = [];
            $scope.import_success = [];
            $scope.import_ignore_error = false;

            $scope.successGridOptions = {
                data: 'import_success',
                columnDefs: [
                    {
                        name: '#',
                        displayName: '#',
                        width: 40,
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{rowRenderIndex + 1}}</div>'
                    }, {
                        name: 'id',
                        width: 40
                    }, {
                        name: 'name',
                        displayName: $translate.instant('label.Name'),
                        width: '*'
                    }, {
                        name: 'sensorDataSourceType',
                        displayName: $translate.instant('label.SensorDataSourceType'),
                        width: '*'
                    }, {
                        name: 'systemIndexName',
                        displayName: $translate.instant('label.SystemIndexName'),
                        width: '*'
                    }, {
                        name: 'sensorState',
                        displayName: $translate.instant('label.SensorState')
                    }
                ]

            };

            $scope.errorGridOptions = {
                data: 'import_errors',
                columnDefs: [
                    {
                        name: '#',
                        displayName: '#',
                        width: 40,
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{rowRenderIndex + 1}}</div>'
                    }, {
                        name: 'description',
                        displayName: $translate.instant('label.Description'),
                        width: '*'
                    }, {
                        name: 'affectedColumn',
                        displayName: $translate.instant('label.AffectedColumn'),
                        width: 100
                    }, {
                        name: 'affectedRow',
                        displayName: $translate.instant('label.AffectedRow'),
                        width: 100
                    }
                ]
            };

            $scope.uploader = new FileUploader({
                url: iris.config.apiUrl + '/sensors/devices/' + params.device_id + '/sensors-import',
                onBeforeUploadItem: function (item) {
                    if (!item.file.name.toLowerCase().endsWith('.xls')) {
                        this.isUploading = false;
                        alertify.error($translate.instant('message.InvalidXLSFormat'));
                        throw new Error('Only to cancel upload');
                    }
                    iris.loader.start('.modal-body')
                },
                onCompleteItem: function (item, response, status, headers) {
                    $scope.import_success = response.importedSensors;
                    $scope.import_errors = response.importErrors;
                    iris.loader.stop();
                    alertify.success($translate.instant('text.SensorsImportSuccess'));
                }
            });
        });

    angular.module('iris_gs_devices_view').controller('ModuleManageDataSeriesViewCtrl',
        function ($scope, $controller, $translate, $state, $stateParams, $uibModal, $q, uiGridConstants, GlobalSettingsService, DevicesService, DataSeriesService, AlarmingService) {
            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope}));

            angular.extend($scope.gridRowActions, {
                ds: {
                    order: 1,
                    template: `
                        <a href="javascript:void(0)"
                            ng-click="grid.appScope.editAlarmLimitsForDs(row.entity)"
                            class="btn btn-default">
                                <i ng-if="row.entity.observed" class="fa fa-bell"></i>
                                <i ng-if="!row.entity.observed" class="fa fa-bell-slash"></i>
                        </a>`
                }
            });

            $scope.updateGridRowActions();

            $scope.items = [];
            $scope.filter = {};
            $scope.filter.selectedProjectId = null;
            $scope.filter.selectedDeviceId = null;
            $scope.filter.selectedSensorId = null;
            $scope.sensors = [];
            $scope.params = angular.fromJson($stateParams.params);
            $scope.devices = [];
            $scope.alarmLevelSelections = [{ value: 'all', label: $translate.instant('label.All')},
                { value: 'nolimits', label: $translate.instant('label.NoAlarmLimits')}];
            if ($scope.params && $scope.params.deviceId) {
                AlarmingService.getLevels($scope.params.deviceId).then(levels => {
                    angular.forEach(levels, level => {
                        $scope.alarmLevelSelections.push({
                            value: level.id,
                            label: level.name
                        });
                    });
                });
            }
            if ($scope.params !== undefined) {
                if ($scope.params.deviceId) {
                    $scope.filter.selectedDeviceId = $scope.params.deviceId;
                    $scope.disableDeviceSelect = true;
                }
                if ($scope.params.sensorId) {
                    $scope.filter.selectedSensorId = $scope.params.sensorId;
                }
            }
            DevicesService.getDevices().$promise.then(function (devices) {
                $scope.devices = devices;
            });
            $scope.$watch('filter.selectedDeviceId', function (newValue, oldValue) {
                $scope.items = [];
                $scope.sensors = [];
                if ($scope.filter.selectedDeviceId !== null) {
                    $state.transitionTo($state.current.name, {
                        params: angular.toJson({'deviceId': $scope.filter.selectedDeviceId})
                    }, {
                        inherit: true
                    });
                    DevicesService.getSensorsByDeviceId($scope.filter.selectedDeviceId).then(function (sensors) {
                        $scope.sensors = sensors;
                        //console.log("sensors", $scope.sensors);
                    });
                }
            });

            $scope.loadDataSeries = function () {
                if (!!$scope.filter.selectedSensorId) {
                    DevicesService.getAllDataseriesBySensor($scope.filter.selectedSensorId).then(function (dataSeries) {
                        $scope.items = dataSeries;
                        requestDsValues();
                    });
                }
                else if (!!$scope.filter.selectedDeviceId) {
                    DataSeriesService.getAllByDevice($scope.filter.selectedDeviceId).then(dataSeries => {
                        console.log('all ds', dataSeries);
                        $scope.items = dataSeries;
                    });
                }
                else {
                    $scope.items = [];
                }
            };

            $scope.$watch('filter.selectedSensorId', function (newValue, oldValue) {
                if (!!$scope.filter.selectedSensorId) {
                    $state.transitionTo($state.current.name, {
                        params: angular.toJson({'deviceId': $scope.filter.selectedDeviceId, 'sensorId': $scope.filter.selectedSensorId})
                    }, {
                        inherit: true
                    });
                    $scope.disableAddButton = false;
                }
                else if (!!$scope.filter.selectedDeviceId){
                    $state.transitionTo($state.current.name, {
                        params: angular.toJson({'deviceId': $scope.filter.selectedDeviceId})
                    }, {
                        inherit: true
                    });
                }
                $scope.loadDataSeries();
            });

            $scope.gridOptions.enableFiltering = true;
            var table_fields = [{
                name: 'name',
                displayName: $translate.instant('label.Name'),
                width: '*'
            }, {
                name: 'type',
                displayName: $translate.instant('label.Type'),
                width: 80
            }, {
                name: 'dataType',
                displayName: $translate.instant('label.Dataseries.DataType'),
                width: '*'
            }, {
                name: 'irisUnit',
                displayName: $translate.instant('label.Units'),
                width: 100,
                cellFilter: `irisUnits:'short':true`,
                enableFiltering: false
            }, {
                name: 'digits',
                displayName: $translate.instant('label.Digits'),
                width: 100,
                enableFiltering: false
            }, {
                name: 'systemIndexName',
                displayName: $translate.instant('label.SystemIndexName'),
                width: '*'
            }, {
                name: 'alarmLimit',
                displayName: $translate.instant('label.AlarmLimits'),
                width: '*',
                filter: {
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: $scope.alarmLevelSelections,
                    condition: function(searchTerm, cellValue) {
                        if (!searchTerm || searchTerm === 'all') {
                            return true;
                        }
                        else if (searchTerm === 'nolimits') {
                            if (!cellValue || !cellValue.length) {
                                return true;
                            }
                            return false;
                        }
                        else if (angular.isNumber(searchTerm) && cellValue.length) {
                            for (var limit of cellValue) {
                                if (limit.level.id === searchTerm) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        return false;
                    }
                },
                cellTemplate: `
                <div class="ui-grid-cell-contents">
                    {{row.entity.alarmLimit.length}} {{'label.configured' |  translate}}
                </div>`
            }, {
                name: 'lastValue',
                displayName: $translate.instant('label.CurrentValue'),
                width: '*',
                enableFiltering: false,
                cellTemplate: `
                <div class="ui-grid-cell-contents">
                    {{grid.appScope.getDSValue(row.entity.id)}}
                    <button ng-if="row.entity.type == 'MANUAL'"
                            uib-tooltip="{{::'label.SetValue' | translate}}"
                            ng-click="grid.appScope.openDSEditValueModal(row.entity.id)"
                            class="btn btn-sm btn-link">
                         <i class="fa fa-pencil"></i>
                    </button>
                </div>`
            }];

            $scope.addFieldsToGrid(table_fields);

            // override method
            $scope.openModuleSettingsModal = function (row) {
                var dsData = {};
                dsData.availableSensors = $scope.sensors;
                dsData.deviceId = $scope.filter.selectedDeviceId;
                dsData.sensorId = $scope.filter.selectedSensorId || (row && row.entity ? row.entity.deviceSensorId : undefined) ;
                GlobalSettingsService.openEditModuleSettings($stateParams.module, $stateParams.settings, row && row.entity ? row.entity.id : null, dsData).then(function () {
                    $scope.loadDataSeries();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.ConfirmDeleteDataSeries'), function (e) {
                    if (e) {
                        var sensorId = $scope.filter.selectedSensorId || item.deviceSensor.id;
                        DataSeriesService.deleteSensorDataSeries(sensorId, item.id).then(function () {
                            alertify.success($translate.instant('message.DataSeriesDeleted'));
                            $scope.loadDataSeries();
                        });
                    }
                });
            };

            var dsValues = {};
            function requestDsValues() {
                var dsIds = $scope.items.map(ds => {return {id: ds.id}});
                var now = new Date();
                iris.loader.start();
                DataSeriesService.getValues({
                    dataseries: angular.toJson(dsIds),
                    'date-start': now,
                    'date-end': now,
                    'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}])
                }).then(function (result) {
                    delete result[""];

                    dsValues = result;

                    iris.loader.stop();
                });
            }


            $scope.openDSEditValueModal = function (dsId) {
                DataSeriesService.openSetDsValueModal(dsId, $scope.getDSValue(dsId)).then(function (ds) {
                    //todo refactor - put setValue request to the modal
                    DataSeriesService.setValue(ds).then(function () {
                        requestDsValues()
                    });
                });
            };

            $scope.editAlarmLimitsForDs = function (ds) {
                AlarmingService.openSetAlarmLimitsModal(ds).then(function (limitContainer) {
                    console.log('finished with limits', limitContainer);

                    DataSeriesService.getSensorDataSeriesById(ds.deviceSensorId, ds.id).then(function (dataSeries) {
                        dataSeries.observed = limitContainer.observed;
                        var promises = [];
                        angular.forEach(limitContainer.remove, limitToRemove => {
                            promises.push(AlarmingService.removeLimit(limitToRemove, ds.id));
                        });
                        angular.forEach(limitContainer.save, limitToSave => {
                            promises.push(AlarmingService.saveLimit(limitToSave, ds));
                        });

                        if (!limitContainer.originalTimeoutLimit ||
                            (limitContainer.timeoutLimit.active !== limitContainer.originalTimeoutLimit.active ||
                             limitContainer.timeoutLimit.value !== limitContainer.originalTimeoutLimit.value)) {
                            promises.push(AlarmingService.saveTimeoutLimit(limitContainer.timeoutLimit, ds))
                        }

                        promises.push(DataSeriesService.saveDataSeries(dataSeries));
                        $q.all(promises).then(() => {
                            $scope.loadDataSeries();
                        });
                    });
                });
            };

            $scope.getDSValue = function (dsId) {
                return dsValues && dsValues[dsId]
                    && dsValues[dsId].length
                    && dsValues[dsId][dsValues[dsId].length - 1].value;
            }


        });

})();