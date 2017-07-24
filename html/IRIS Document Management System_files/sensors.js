(function () {
    angular.module('iris_sensors', []);

    angular.module('iris_sensors').factory('Sensors', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/devices/:deviceId/sensors/:id/:action", {
            id: '@id',
            deviceId: '@deviceId',
            action: '@action'
        }, {
            getDataSeries: {
                method: "GET",
                params: {action: 'dataseries'},
                isArray: true
            }
        });
    }]);

    angular.module('iris_sensors').factory('SensorsService', ['Sensors',
        function (Sensors) {
            var sensor_types = [{
                type:'NAVIGATION',
                name:'NAVIGATION'
            }, {
                type:'BELT',
                name:'BELT'
            }, {
                type:'RING',
                name:'RING'
            }, {
                type:'TBM',
                name:'TBM'
            }, {
                type:'LIVE_DATA',
                name:'LIVE DATA'
            }];

            var sensor_states = [{
                state: 'RUNNING',
                name: 'RUNNING'
            }, {
                state: 'PLANNED',
                name: 'PLANNED'
            }, {
                state: 'PAUSE',
                name: 'PAUSE'
            }, {
                state: 'DEFECT',
                name: 'DEFECT'
            }, {
                state: 'DEACTIVATED',
                name: 'DEACTIVATED'
            }];

            return {
                createSensor: function () {
                    return new Sensors();
                },
                deleteSensor: function (deviceId, sensorId) {
                    return Sensors.delete({deviceId:deviceId, id: sensorId}).$promise;
                },
                getSensorById: function (deviceId, sensorId) {
                    return Sensors.get({id:sensorId, deviceId:deviceId}).$promise;
                },
                getSensorTypes: function(filter){
                    var result = [];
                    if(filter && filter.length){
                        for(var i in sensor_types){
                            if(filter.indexOf(sensor_types[i].type)>=0){
                                result.push(sensor_types[i]);
                            }
                        }
                    } else {
                        result = sensor_types;
                    }
                    return result;
                },
                getSensorStates: function (filter) {
                    var states = [];
                    if(filter && filter.length) {
                        for (var s in sensor_states) {
                            if (filter.indexOf(sensor_states[s].state) >= 0) {
                                states.push(sensor_states[s]);
                            }
                        }
                    }
                    else {
                        states = sensor_states;
                    }
                    return states;
                },
                saveSensor: function (sensor, params) {
                    return sensor.$save(params);
                }
            };
        }
    ]);

})();
