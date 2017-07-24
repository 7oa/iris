(function () {
    angular.module('iris_intervals', []);

    angular.module('iris_intervals').factory('IntervalScanners', ['$resource', function ($resource) {
        var IntervalScanners = $resource(iris.config.apiUrl +
            "/device-data/devices/:deviceId/interval-scanners/:id/:action", {
            id: '@id',
            deviceId: '@deviceId'
        }, {
            activate: {
                method: "POST",
                params: {action: 'activate'}
            },

            getDataseries: {
                method: "GET",
                params: {action: 'dataseries'},
                isArray: true
            },

            getIntervalPhases: {
                method: 'GET',
                params: {action: 'phases'},
                isArray: true
            }

        });

        // Define api for all interval scanner objects by extending the prototype
        angular.extend(IntervalScanners.prototype,{

            isOfTypeNormal: function() {
                return this.type == 'START_STOP';
            },

            isOfTypeBased: function() {
                return this.type == 'BASED';
            },

            isOfTypeSensor: function() {
                return this.type == 'PROVIDED_BY_SENSOR';
            }
        });

        return IntervalScanners;
    }]);


    angular.module('iris_intervals').factory('ProcessIntervals', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl +
            "/device-data/devices/:deviceId/interval-scanners/:scannerId/intervals/:id/:action", {
            scannerId: '@scannerId',
            deviceId: '@deviceId',
            id: '@id'
        }, {
            recalculateInterval: {
                method: "POST",
                params: {action: 'recalculate-interval'}
            },
            recalculate: {
              method: "POST",
              params: {action: 'recalculate'}
            },
            recalculateByDevice: {
                url: iris.config.apiUrl + "/device-data/devices/:deviceId/interval-scanners/recalculate",
                method: "POST"
            }
        })
    }]);


    angular.module('iris_intervals').factory('IntervalScannerService', ['$filter', '$translate', 'IntervalScanners', 'ProcessIntervals',
        function ($filter, $translate, IntervalScanners, ProcessIntervals) {

            var scannerTypes = [
                {
                    value: 'START_STOP',
                    label: $translate.instant('label.IntervalScanner.TypeStartStop')
                },
                {
                    value: 'BASED',
                    label: $translate.instant('label.IntervalScanner.TypeBased')
                },
                {
                    value: 'PROVIDED_BY_SENSOR',
                    label: $translate.instant('label.IntervalScanner.TypeProvidedBySensor')
                }
            ];

            scannerTypes.StartStop          = scannerTypes[0];
            scannerTypes.Based              = scannerTypes[1];
            scannerTypes.ProvidedBySensor   = scannerTypes[2];

            return {
                getScanners: _getScanners,
                getMainIntervalScanners: function(deviceId) {
                    var params = {
                        deviceId: deviceId,
                        filter: angular.toJson([
                            { f: "type", v: ["BASED"] },
                            { f: "mainNamedIntervalScanner", v: [true] }
                        ])
                    };

                    // TODO API filters don't work
                    return _getScanners(params).then(response => {
                        return response.filter(scanner => {
                            return scanner.type == "BASED" && scanner.mainNamedIntervalScanner;
                        });
                    });
                },
                getScanner: function (device_id, id) {
                    return IntervalScanners.get({deviceId: device_id, id: id}).$promise;
                },
                getScannerTypes: function() {
                    return scannerTypes;
                },
                newScanner: function(device_id, properties) {
                    var scanner = new IntervalScanners();

                    if(properties instanceof Object) {
                        angular.extend(scanner,properties);
                    }

                    if(device_id > 0) {
                        scanner.deviceId = device_id;
                    }

                    scanner.conditions   = [];
                    scanner.ringNameGaps = {};

                    return scanner;
                },
                newScannerCondition: function(properties) {
                    var condition = {
                        name:               null,
                        condition:          null,
                        startCondition:     false,
                        rank:               null
                    };
                    if(properties instanceof Object) {
                        for (var property in condition) {
                            if(condition[property] !== undefined && properties[property] !== undefined) {
                                condition[property] = properties[property];
                            }
                        }
                    }
                    return condition;
                },
                saveScanner: function(scanner) {
                    var createRequest = scanner.id <= 0;
                    return scanner.$save(function(result) {
                        angular.extend(scanner, result);
                        return result;
                    });
                },
                deleteScanner: function (device_id, id) {
                    return IntervalScanners.delete({deviceId: device_id, id: id}).$promise;
                },
                activateScanner: function (device_id, id, active, date) {
                    return IntervalScanners.activate({deviceId: device_id, id: id, active: active, from:date}, null).$promise;
                },
                getScannerDataSeries: function (device_id, id) {
                    return IntervalScanners.getDataseries({deviceId: device_id, id: id}).$promise;
                },
                getScannerIntervalPhases: function(deviceId, id) {
                    return IntervalScanners.getIntervalPhases({deviceId: deviceId, id: id}).$promise;
                },
                getIntervals: function (device_id, scanner_id) {
                    return ProcessIntervals.query({deviceId: device_id, scannerId: scanner_id}).$promise;
                },
                getInterval: function (device_id, scanner_id, id) {
                    return ProcessIntervals.query({deviceId: device_id, scannerId: scanner_id, id: id}).$promise;
                },
                saveInterval: function (device_id, scanner_id, interval) {
                    interval.deviceId = device_id;
                    interval.scannerId = scanner_id;
                    return ProcessIntervals.save(interval).$promise;
                },
                deleteInterval: function (device_id, scanner_id, id) {
                    return ProcessIntervals.delete({deviceId: device_id, scannerId: scanner_id, id: id}).$promise;
                },

                recalcInterval: function (device_id, scanner_id, id, deleteIntervals, virtualSensors, phases) {
                    return ProcessIntervals.recalculateInterval(
                        {
                            deviceId: device_id,
                            scannerId: scanner_id,
                            id: id,
                            deleteIntervals: deleteIntervals,
                            virtualSensors : virtualSensors,
                            phases: phases
                        }, null
                    ).$promise;
                },

                recalcIntervals: function (device_id, scanner_id, from, to, deleteIntervals, virtualSensors, phases) {
                    return ProcessIntervals.recalculate(
                        {
                            deviceId: device_id,
                            scannerId: scanner_id,
                            deleteIntervals: deleteIntervals,
                            virtualSensors : virtualSensors,
                            phases: phases,
                            from: from,
                            to: to
                        }, null
                    ).$promise;
                },

                recalcByDevice: function (device_id, from, to, deleteIntervals, virtualSensors, phases) {
                    return ProcessIntervals.recalculateByDevice(
                        {
                            deviceId: device_id,
                            deleteIntervals: deleteIntervals,
                            virtualSensors : virtualSensors,
                            phases: phases,
                            from: from,
                            to: to
                        }, null
                    ).$promise;
                }
            };

            function _getScanners(params) {
                return IntervalScanners.query(angular.isObject(params) ? params : {deviceId: params}).$promise;
            }
        }
    ]);

})();
