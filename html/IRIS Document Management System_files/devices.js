(function () {

    angular.module('iris_devices', ['iris_device_boundaries']);

    angular.module('iris_devices').factory('Devices', function ($resource) {
        return $resource(iris.config.apiUrl + "/devices/:id/:action", {
            id: '@id',
            action: '@action'
        }, {
            getSensors: {
                method: "GET",
                params: {action: 'sensors'},
                isArray: true
            },
            getDataSeries:{
                method: "GET",
                params: {action: 'dataseries'},
                isArray: true
            }
        });
    });

    angular.module('iris_devices').factory('DeviceSettings', function ($resource) {
        return $resource(iris.config.apiUrl + "/device-settings/:module/:id", {
            id: '@id',
            module: '@module'
        });
    });

    angular.module('iris_devices').factory('SensorDataSeries', function ($resource) {
        return $resource(iris.config.apiUrl + "/sensors/:sensor_id/data-series/:id", {
            sensor_id: '@sensor_id',
            id: '@id'
        });
    });

    angular.module('iris_devices').factory('DeviceState', function ($resource) {
        return $resource(iris.config.apiUrl + "/device-data/projects/:project_id/devices/:device_id/status", {
            project_id: '@project_id',
            device_id: '@device_id'
        });
    });

    angular.module('iris_devices').factory('WidgetTimePeriodQuery', function ($resource) {
        return $resource(iris.config.apiUrl + "/device-data/projects/:project_id/devices/:device_id/status/time-period", {
            project_id: '@project_id',
            device_id: '@device_id'
        });
    });

    angular.module('iris_devices').factory('DeviceMainIntervalDataSeries', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/devices/:device_id/main-interval-ds", {
            device_id: '@device_id'
        });
    });

    angular.module('iris_devices').factory('DevicesService',
        function ($filter, Devices, SensorDataSeries, DeviceSettings, DeviceState, WidgetTimePeriodQuery, DeviceMainIntervalDataSeries) {
            var default_order = angular.toJson([{
                name: 'name',
                value: 'asc'
            }]);

            var device_types = ['TBM', 'SBR', 'SEPARATION_PLANT', 'GEOMONITORING', 'CONVEYER_BELT'];
            var device_shield_types = ['Gripper', 'Single Shield', 'Hydro Shield', 'Earth Pressure Shield', 'DoubleShield', 'Stabilizer', 'UNDEFINED'];

            var devices = Devices.query({
                'order-by': default_order
            }, function (value) {
                return value;
            });

            return {
                getDataseriesByDeviceId: (id, filter) => Devices.getDataSeries({ id }, filter).$promise,

                getDeviceTypes: function () {
                    return device_types;
                },

                getDeviceShieldTypes: function () {
                    return device_shield_types;
                },

                createDevice: function () {
                    return new Devices();
                },

                deleteDevice: function(id) {
                    var _that = this;
                    return Devices.delete({id}, null, res => {
                        _that.requestDevices();
                        return res;
                    }).$promise;
                },

                getDevices: function () {
                    return devices;
                },

                requestDevices: function () {
                    return Devices.query({
                        'order-by': default_order
                    }, result => devices = result).$promise;
                },

                filter: function (filter, strict) {
                    filter = filter || {};
                    strict = strict || true;
                    return $filter('filter')(devices, filter, strict);
                },

                loadById: function(id) {
                    return Devices.get({id: id}).$promise;
                },

                getById: function (id) {
                    return this.filter({id: id})[0];
                },

                //todo duplicate
                getSensors: function (id,filter) {
                    filter = filter || {};
                    angular.extend(filter,{id: id});
                    return Devices.getSensors(filter);
                },

                getSensorsByDeviceId: function (device_id,sensorTypes,dataSeriesTypes,filter) {
                    filter = filter || {};
                    angular.extend(filter,{id: device_id,types:sensorTypes,'ds-types':angular.toJson(dataSeriesTypes)});
                    var sensors = Devices.getSensors(filter);
                    return sensors.$promise;
                },

                getAllDataseriesBySensor: function (sensor_id) {
                    var dataseries = SensorDataSeries.query({sensor_id: sensor_id});
                    return dataseries.$promise;
                },

                getDeviceSettingsById: function (module, device_id) {
                    device_id = device_id || 'default';
                    var device_settings = DeviceSettings.get({module: module, id: device_id});
                    return device_settings.$promise.then(function (result) {
                        if (result.deviceId != device_id && device_id != 'default')
                            result.deviceId = device_id;
                        return result;
                    });
                },

                saveDevice: function (device) {
                    var is_new = !device.id;
                    var _that = this;
                    return Devices.save(device, device, result => {
                        _that.requestDevices();
                        return result;
                    }).$promise;
                },

                saveDeviceSettings: function (module, settings, device_id) {
                    var is_new = !settings.id > 0 && device_id != 'default';
                    settings.deviceId = device_id;
                    settings.module = module;
                    return DeviceSettings.save({module: module, id: is_new ? null : device_id}, settings, function (value) {
                        return value;
                    }).$promise;
                },

                getDeviceState: function (project_id, device_id,params) {
                    params = params || {};
                    params.ring = params.ring || params.advance;
                    angular.extend(params,{project_id:project_id,device_id:device_id});
                    return DeviceState.get(params).$promise;
                },

                getDeviceStateByQuery(deviceId, projectId, query) {
                    return WidgetTimePeriodQuery.save({device_id: deviceId, project_id: projectId}, query).$promise;
                },

                getMainIntervalDataSeries: function (deviceId) {
                    return DeviceMainIntervalDataSeries.get({device_id: deviceId}).$promise;
                }
            };
        });

    angular.module('iris_devices').factory('DeviceSettingsService',
        function (DeviceSettings, $rootScope) {
            return {
                getDeviceSettingsList: function (alias) {
                    return DeviceSettings.query({module:alias}).$promise;
                },

                getDeviceSettingsById: function (alias, device_id) {
                    device_id = device_id || 'default';
                    var device_settings = DeviceSettings.get({module: alias, id: device_id});
                    return device_settings.$promise.then(function (result) {
                        if (result.deviceId != device_id && device_id != 'default')
                            result.id = null;
                        if (!result.module) result.module = alias;
                        return result;
                    });
                },

                saveDeviceSettings: function (alias, settings, device_id) {
                    var is_new = !settings.deviceId > 0 && device_id != 'default';
                    if(device_id != 'default' && device_id!= null)
                        settings.deviceId = device_id;

                    return DeviceSettings.save({module: alias, id: is_new ? null : device_id}, settings, function (value) {
                        $rootScope.$broadcast('device-settings.' + alias + '.updated', value);
                        return value;
                    }).$promise;
                },

                removeDeviceSettings: function (alias, settings) {
                    return DeviceSettings.remove({module: alias, id: settings.deviceId > 0 ? settings.deviceId : "default"}, function (value) {
                        return value;
                    }).$promise;
                }
            };
        });

})();

