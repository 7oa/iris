(function () {
    angular.module('iris_dataseries', ['iris_sensors']);

    angular.module('iris_dataseries').factory('DataSeries', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/dataseries/:dataseries_id", {
            dataseries_id: '@dataseries_id'
        },{
            getNonWrappedByDeviceId: {
                url: iris.config.apiUrl + "/data-series/nonWrapped/:deviceId",
                params: {
                    deviceId: 0
                },
                method:     "GET",
                isArray:    true
            }
        });
    }]);

    angular.module('iris_dataseries').factory('VirtualDataSeries', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/data-series/virtual/:id", {
            id: '@id'
        },{
            getByDeviceId: {
                url:        iris.config.apiUrl + "/data-series/devices/:deviceId/virtual",
                params: {
                    deviceId:   0
                },
                method:     "GET",
                isArray:    true
            }
        });
    }]);

    angular.module('iris_dataseries').factory('SensorDataSeries', ['$resource', function ($resource) {
        //sensors/{id}/data-series
        return $resource(iris.config.apiUrl + "/sensors/:sensor_id/data-series/:id", {
            sensor_id: '@sensor_id',
            id: '@id'
        }, {
                getDataSeriesBySensorAndType: {
                    url: iris.config.apiUrl + "/sensors/:sensor_id/data-series",
                    params: {
                        sensor_id: '@sensor_id'
                    },
                    isArray: true,
                    method: "GET"
                }
            }
        );
    }]);

  angular.module('iris_dataseries').factory('DeviceDataSeries', ['$resource', function ($resource) {
    return $resource(iris.config.apiUrl + "/system/devices/:device_id/dataseries", {
      device_id: '@device_id'
    });
  }]);

  angular.module('iris_dataseries').factory('DeviceDataSeriesDependencies', function ($resource) {
    return $resource(iris.config.apiUrl + "/system/devices/:deviceId/dataseries-dependencies/:id", {
        deviceId: '@deviceId',
        id: '@id'
    });
  });

  angular.module('iris_dataseries').factory('DataseriesValues', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/device-data/dataseries/:dataseries_id/:action", {
            dataseries_id: '@dataseries_id',
            action: '@action'
        }, {
            getValue: {
                method: "GET",
                params: {action: 'value'}
            },
            getValues: {
                method: "GET",
                params: {action: 'values'}
            },
            setValue: {
                method: "POST",
                params: {action: 'value'}
            },
            updateValue: {
                method: "POST",
                params: {action: 'update'}
            }
            
        });
    }]);

    angular.module('iris_dataseries').factory('DataSeriesLimits', function ($resource) {
        return $resource(iris.config.apiUrl + "/device-data/dataseries/limits", {});
    });

    angular.module('iris_dataseries').factory('DataSeriesService',
        function ($filter, $q, $uibModal, DataSeries, DataseriesValues, SensorDataSeries, DeviceDataSeries, DeviceDataSeriesDependencies, DataSeriesLimits) {
            //todo translations
            var default_ds_types = [
                {type: 'RAW', name: 'RAW'},
                {type: 'CONDENSED', name: 'CONDENSED'},
                {type: 'VIRTUAL', name: 'VIRTUAL'},
                {type: 'MANUAL', name: 'MANUAL'},
                {type: 'INTERVAL', name: 'INTERVAL'}
            ];

            var ds_data_types = [
                {type: 'UNSPECIFIED', name: 'UNSPECIFIED'},
                {type: 'NORTHING', name: 'NORTHING'},
                {type: 'EASTING', name: 'EASTING'},
                {type: 'ELEVATION', name: 'ELEVATION'},
                {type: 'NORTHING_WGS84', name: 'NORTHING_WGS84'},
                {type: 'EASTING_WGS84', name: 'EASTING_WGS84'},
                {type: 'ELEVATION_WGS84', name: 'ELEVATION_WGS84'},
                {type: 'DEVIATION_HZ', name: 'DEVIATION_HZ'},
                {type: 'DEVIATION_VT', name: 'DEVIATION_VT'},
                {type: 'CHAINAGE', name: 'CHAINAGE'},
                {type: 'TUNNEL_CHAINAGE', name: 'TUNNEL_CHAINAGE'},
                {type: 'TUNNEL_DISTANCE', name: 'TUNNEL_DISTANCE'},
                {type: 'ADVANCE_NO', name: 'ADVANCE_NO'},
                {type: 'ROLL', name: 'ROLL'},
                {type: 'PITCH', name: 'PITCH'},
                {type: 'DRIFT_VT', name: 'DRIFT_VT'},
                {type: 'DRIFT_HZ', name: 'DRIFT_HZ'}
            ];

            var all_ds = [];

            return {
                getDSDatTypes: function () {
                    return ds_data_types;
                },

                createDataSeries: function () {
                    return new DataSeries();
                },
                createSensorDataSeries: function (ds) {
                    return new SensorDataSeries(ds);
                },
                deleteSensorDataSeries: function (sensorId, dataSeriesId) {
                    return SensorDataSeries.delete({sensor_id:sensorId, id: dataSeriesId}).$promise;
                },
                getSensorDataSeriesById: function (sensorId, dataSeriesId) {
                    var sensor = SensorDataSeries.get({sensor_id:sensorId, id:dataSeriesId});
                    return sensor.$promise;
                },
                getAll: function (filter) {
                    filter = filter || {};
                    return DataSeries.query(filter).$promise;
                },

                getAllByDevice: function (deviceId, filter) {
                    filter = filter || {};
                    filter.device_id = deviceId;
                    return DeviceDataSeries.query(filter).$promise;
                },

                getDeviceDataseriesDependancies: (deviceId,id) => DeviceDataSeriesDependencies.query({deviceId,id}).$promise,

                getNonWrappedByDeviceId: function(deviceId) {
                    return DataSeries.getNonWrappedByDeviceId({deviceId:deviceId}).$promise;
                },

                getById: function (id) {
                    return DataSeries.get({dataseries_id:id}).$promise;
                },

                setValue: function (dataseries) {
                    return DataseriesValues.setValue(dataseries).$promise;
                },

                getDemoTunnelmeterValues: function(dataseriesId, periodStart, periodEnd) {
                    var getVal = () => Math.random() * 10;
                    var indexDate = new Date(periodStart),
                        limitDate = new Date(periodEnd),
                        res = {},
                        series = [],
                        val = getVal();
                        i = 0;
                    while (indexDate < limitDate) {
                        series.push({
                            "grouped" : dataseriesId.toString(),
                            "projectId" : null,
                            "deviceId" : null,
                            "dataseriesId" : dataseriesId,
                            "id" : i++,
                            "date" : indexDate,
                            "dateEnd" : indexDate,
                            "value" : val,
                            "unit" : "METER"
                        });
                        indexDate = new Date(indexDate);
                        indexDate.setDate(indexDate.getDate() + 1);
                        val += getVal();
                    }
                    res[dataseriesId.toString()] = series;
                    return res;
                },

                getValues: function (filter) {
                    let deferred = $q.defer();
                    DataseriesValues.getValues(filter).$promise.then(function (values) {
                        deferred.resolve(JSON.parse(angular.toJson(values)));
                    });
                    return deferred.promise;
                },

                updateValue: function (params) {
                    return DataseriesValues.updateValue(params).$promise;
                },

                getTypes: function (filter) {
                    var result = [];
                    if(filter && filter.length){
                        for(var i in default_ds_types){
                            if(filter.indexOf(default_ds_types[i].type)>=0){
                                result.push(default_ds_types[i]);
                            }
                        }
                    } else {
                        result = default_ds_types;
                    }
                    return result;
                },

                openSelectDSModal: function (resolve) {
                    return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + "/dataseries/templates/select-ds.modal.html",
                        resolve: resolve,
                        controller: 'DataSeriesController'
                    }).result;
                },

                openSelectDSListModal: function (resolve) {
                    resolve = resolve || {};
                    resolve['params'] = resolve['params'] || function () {return {}};
                    return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + "/dataseries/templates/select-ds-list.modal.html",
                        resolve: resolve,
                        controller: 'DataSeriesListController',
                        size: 'lg'
                    }).result;
                },

                openSetDsValueModal: function (dsId, initValue) {
                    return $uibModal.open({
                        templateUrl: iris.config.widgetsUrl + '/iris-spoil-management/templates/iris-spoil-management.edit-ds-value.html',
                        resolve: {
                            'dataseries': function () {
                                return {
                                    dataseries_id: dsId,
                                    value: initValue,
                                    time: new Date()
                                }
                            }
                        },
                        controller: 'DataSeriesController'
                    }).result
                },

                //TODO return $promise
                getDSbySensor: function (sensor_id) {
                    return SensorDataSeries.query({sensor_id:sensor_id});
                },
                saveDataSeries: function (ds) {
                    return ds.$save({sensor_id: ds.deviceSensorId}, function (data) {
                        return data;
                    });
                },

                getIntervalDS: function (devices) {
                    //fetch interval dataseries list
                    var filter = {
                        filter: angular.toJson([{
                            f: 'type',
                            v: ['INTERVAL']
                        }]),
                        'only-fields': angular.toJson(['id', 'name'])
                    };
                    var that = this;
                    var promises = devices.map(device => that.getAllByDevice(device.id, filter));

                    return $q.all(promises).then(results => {
                        return [].concat.apply([], results); //flattern arrays
                    })
                },

                getDSBySensorAndType: function (sensor_id, type) {
                    var ds = SensorDataSeries.getDataSeriesBySensorAndType({sensor_id: sensor_id});
                    return ds.$promise.then(results => {
                        return results.filter((ds) => ds.type === type);
                    })
                },

                getLimits: function (projectDeviceId, dataSeriesIdsList) {
                    var params = {
                        'reference-project-device': projectDeviceId,
                        'dataseries-ids': JSON.stringify(dataSeriesIdsList)
                    };
                    return DataSeriesLimits.get(params).$promise;
                }
            };
        });

    angular.module('iris_dataseries').factory('VirtualDataSeriesService', ['VirtualDataSeries',function(VirtualDataSeries){
        return {
            getById: function (id) {
                return VirtualDataSeries.get({id:id}).$promise;
            },
            getByDeviceId: function(deviceId) {
                return VirtualDataSeries.getByDeviceId({'deviceId': deviceId}).$promise;
            },
            newSeries: function(deviceId, properties) {
                var series = new VirtualDataSeries();
                if(properties instanceof Object) {
                    for(var propName in properties) {
                        series[propName] = properties[propName];
                    }
                }
                series.deviceID = deviceId||0;
                return series;
            },
            saveSeries: function(series, callback) {
                return series.$save(callback);
            },
            deleteSeries: function(series) {
                return VirtualDataSeries.delete({id:series.id});
            }
        };
    }]);

    angular.module('iris_dataseries').controller('DataSeriesController', ['$scope', 'dataseries',
        function ($scope, dataseries) {
            $scope.dataseries = dataseries;
        }
    ]);

    angular.module('iris_dataseries').controller('DataSeriesListController', ['$scope', 'params',
        function ($scope, params) {
            $scope.params = params;
        }
    ]);

    angular.module('iris_dataseries').directive('irisDataSeries', ['$filter', 'ProjectsService', 'DevicesService', 'DataSeriesService',
        function ($filter, ProjectsService, DevicesService, DataSeriesService) {
            return {
                restrict: 'EA',
                scope: {
                    dataseries: '='
                },
                templateUrl: iris.config.componentsUrl + '/dataseries/templates/iris-data-series.html',
                link: function (scope, element, attrs) {
                    scope.projects = ProjectsService.getProjects();
                    scope.ds_types = DataSeriesService.getTypes(scope.dataseries.allowDSTypes);

                    scope.getDeviceSensors = function (device_id) {
                        if (!device_id) return;
                        console.log('Only types:', scope.dataseries.allowDSTypes);
                        DevicesService.getSensorsByDeviceId(device_id, scope.dataseries.allowSensorTypes, scope.dataseries.allowDSTypes)
                            .then(function (device_sensors) {
                                scope.device_sensors = device_sensors;
                                return device_sensors;
                            });
                    };

                    if(scope.dataseries && scope.dataseries.device_id) scope.getDeviceSensors(scope.dataseries.device_id);

                    scope.setSensor = function () {
                        var sensor_id = scope.dataseries.device_sensor_id;
                        if (sensor_id) {
                            DevicesService.getAllDataseriesBySensor(sensor_id).then(function (data_series) {
                                scope.data_series = data_series;
                                scope.setDataSeries();
                            });
                        } else {
                            scope.data_series = [];
                            scope.device_sensor_name = null;
                        }
                    };

                    if (scope.dataseries && scope.dataseries.device_id) {
                        scope.getDeviceSensors(scope.dataseries.device_id);
                        if (scope.dataseries && scope.dataseries.data_series_id) scope.setSensor(); //for editing
                    }

                    scope.setDataSeriesType = function (type) {
                        if (scope.dataseries.data_series_id) {
                            if (type && scope.dataseries.type != type) {
                                scope.dataseries.data_series_id = null;
                                scope.setDataSeries();
                            }
                        }
                    };
                    scope.setDataSeries = function () {
                        scope.dataseries.type = null;
                        scope.dataseries.data_series_name = null;
                        scope.dataseries.device_sensor_name = null;
                        scope.dataseries.data_unit = null;
                        if (scope.dataseries.data_series_id) {
                            var ds = $filter('filter')(scope.data_series, {id: +scope.dataseries.data_series_id}, true)[0];
                            var sens = $filter('filter')(scope.device_sensors, {id: +scope.dataseries.device_sensor_id}, true)[0];
                            if (ds) {
                                scope.dataseries.device_sensor_name = sens.name;
                                scope.dataseries.data_series_name = ds.name;
                                scope.dataseries.type = ds.type;
                                scope.dataseries.data_unit = ds.irisUnit;
                                if (scope.dataseries.type != 'RAW') {
                                    scope.dataseries.data_series_function = null;
                                }
                            }
                        } else {
                            scope.dataseries.data_series_function = null;
                        }

                    }

                }
            };
        }
    ]);

})();
