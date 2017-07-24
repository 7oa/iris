(function () {
    angular.module('iris_navi_config', []);

    angular.module('iris_navi_config').factory('NaviConfigs', function ($resource, $q, $translate) {
        return $resource(iris.config.apiUrl + "/tunneling/navigation-configurations/:id", {
            id: '@id'
        }, {
            get: {
                interceptor: {
                    'responseError': (errorResponse) => {
                        iris.loader.stop();
                        alertify.error($translate.instant('text.NavigationConfigurationIsMissingForSelectedDevice'));
                        console.log(errorResponse);
                        return $q.reject(errorResponse);
                    }
                }
            }
        });
    });

    angular.module('iris_navi_config').factory('DeviceNaviConfigs', function ($resource, $q, $translate) {
        return $resource(iris.config.apiUrl + "/tunneling/devices/:deviceId/navigation-configuration", {
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_navi_config').factory('DeviceReferenceSeries', function ($resource, $q, $translate) {
        return $resource(iris.config.apiUrl + "/tunneling/devices/:deviceId/reference-dataseries", {
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_navi_config').factory('NaviConfigService',
        function ($filter, $translate, NaviConfigs, DeviceNaviConfigs, DeviceReferenceSeries) {
            var navi_configs = NaviConfigs.query({}, function (value) {
                return value;
            });

            var machine_types = [{type:'TWO_POINTS'},{type: 'THREE_POINTS'}];

            var arrow_types = [{type: 'points', name: $translate.instant('label.Points')},{type: 'paper-plane', name: $translate.instant('label.PaperPlane')}];

            var navi_sensor_groups = [{
                alias: 'referencePointFront',
                name: $translate.instant('label.ReferencePointFront'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels: [
                    {id:'label.Cutterhead', name: $translate.instant('label.Cutterhead')},
                    {id:'label.CuttingWheel', name: $translate.instant('label.CuttingWheel')},
                    {id:"label.ShieldEdge", name:$translate.instant("label.ShieldEdge")},
                    {id:"label.ShieldArticulation", name:$translate.instant("label.ShieldArticulation")},
                    {id:"label.TargetUnit", name:$translate.instant("label.TargetUnit")},
                    {id:"label.ThrustCylinder", name:$translate.instant("label.ThrustCylinder")},
                    {id:"label.TailskinArticulation", name:$translate.instant("label.TailskinArticulation")},
                    {id:"label.ThrustCylinderSecondary", name:$translate.instant("label.ThrustCylinderSecondary")},
                    {id:"label.Front", name:$translate.instant("label.Front")},
                    {id:"label.Behind", name:$translate.instant("label.Behind")},
                    {id:"label.DeflectorStrip", name:$translate.instant("label.DeflectorStrip")}
                ]
            },{
                alias: 'referencePointCenter',
                name: $translate.instant('label.ReferencePointCenter'),
                available_for: ['THREE_POINTS'],
                labels: [
                    {id:'label.Cutterhead', name: $translate.instant('label.Cutterhead')},
                    {id:'label.CuttingWheel', name: $translate.instant('label.CuttingWheel')},
                    {id:"label.ShieldEdge", name:$translate.instant("label.ShieldEdge")},
                    {id:"label.ShieldArticulation", name:$translate.instant("label.ShieldArticulation")},
                    {id:"label.TargetUnit", name:$translate.instant("label.TargetUnit")},
                    {id:"label.ThrustCylinder", name:$translate.instant("label.ThrustCylinder")},
                    {id:"label.TailskinArticulation", name:$translate.instant("label.TailskinArticulation")},
                    {id:"label.ThrustCylinderSecondary", name:$translate.instant("label.ThrustCylinderSecondary")},
                    {id:"label.Front", name:$translate.instant("label.Front")},
                    {id:"label.Behind", name:$translate.instant("label.Behind")},
                    {id:"label.DeflectorStrip", name:$translate.instant("label.DeflectorStrip")}
                ]
            },{
                alias: 'referencePointRear',
                name: $translate.instant('label.ReferencePointRear'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels: [
                    {id:'label.Cutterhead', name: $translate.instant('label.Cutterhead')},
                    {id:'label.CuttingWheel', name: $translate.instant('label.CuttingWheel')},
                    {id:"label.ShieldEdge", name:$translate.instant("label.ShieldEdge")},
                    {id:"label.ShieldArticulation", name:$translate.instant("label.ShieldArticulation")},
                    {id:"label.TargetUnit", name:$translate.instant("label.TargetUnit")},
                    {id:"label.ThrustCylinder", name:$translate.instant("label.ThrustCylinder")},
                    {id:"label.TailskinArticulation", name:$translate.instant("label.TailskinArticulation")},
                    {id:"label.ThrustCylinderSecondary", name:$translate.instant("label.ThrustCylinderSecondary")},
                    {id:"label.Front", name:$translate.instant("label.Front")},
                    {id:"label.Behind", name:$translate.instant("label.Behind")},
                    {id:"label.DeflectorStrip", name:$translate.instant("label.DeflectorStrip")}
                ]
            },{
                alias: 'chainageSensor',
                name: $translate.instant('label.Chainage'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels: [
                    {id:'label.Chainage', name: $translate.instant('label.Chainage')},
                    {id:'label.Cutterhead', name: $translate.instant('label.Cutterhead')},
                    {id:'label.CuttingWheel', name: $translate.instant('label.CuttingWheel')},
                    {id:"label.ShieldEdge", name:$translate.instant("label.ShieldEdge")},
                    {id:"label.ShieldArticulation", name:$translate.instant("label.ShieldArticulation")},
                    {id:"label.TargetUnit", name:$translate.instant("label.TargetUnit")},
                    {id:"label.ThrustCylinder", name:$translate.instant("label.ThrustCylinder")},
                    {id:"label.TailskinArticulation", name:$translate.instant("label.TailskinArticulation")},
                    {id:"label.ThrustCylinderSecondary", name:$translate.instant("label.ThrustCylinderSecondary")},
                    {id:"label.Front", name:$translate.instant("label.Front")},
                    {id:"label.Behind", name:$translate.instant("label.Behind")},
                    {id:"label.DeflectorStrip", name:$translate.instant("label.DeflectorStrip")}
                ]
            },{
                alias: 'advanceSensor',
                name: $translate.instant('label.Advance'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels:[]
            },{
                alias: 'tunnelmeterSensor',
                name: $translate.instant('label.Tunnelmeter'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels: []
            },{
                alias: 'machinePartFront',
                name: $translate.instant('label.MachinePartFront'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels: []
            },{
                alias: 'machinePartRear',
                name: $translate.instant('label.MachinePartRear'),
                available_for: ['THREE_POINTS'],
                labels: []
            },{
                alias: 'machinePoint0',
                name: $translate.instant('label.MachinePoint0'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels: []
            },{
                alias: 'machinePoint1',
                name: $translate.instant('label.MachinePoint1'),
                available_for: ['TWO_POINTS','THREE_POINTS'],
                labels: []
            },{
                alias: 'machinePoint2',
                name: $translate.instant('label.MachinePoint2'),
                available_for: ['THREE_POINTS'],
                labels: []
            },{
                alias: 'machinePoint3',
                name: $translate.instant('label.MachinePoint3'),
                available_for: ['THREE_POINTS'],
                labels: []
            }];

            return {
                arrow_types: arrow_types,

                machine_types: machine_types,

                navi_sensor_groups: navi_sensor_groups,

                getAll: function () {
                    return navi_configs;
                },

                getById: function (id) {
                    return NaviConfigs.get({id: id}).$promise;
                },

                filter: function(filter, strict){
                    strict = strict || false;
                    return $filter('filter')(navi_configs,filter,strict)[0];
                },

                getByDeviceId: function(device_id){
                    for (var i = 0, c = navi_configs.length; i < c; i++) {
                        if(navi_configs[i].device.id == device_id)
                            return navi_configs[i];
                    }
                    return null;
                },

                create: function () {
                    return new NaviConfigs();
                },

                save: function (navi_config) {
                    var is_new = navi_config.id == null;
                    var _this = this;
                    return navi_config.$save({}, function (value) {
                        if (is_new) {
                            navi_configs.push(navi_config);
                        } else {
                            for(var i in navi_configs){
                                if(navi_configs[i].id == value.id)
                                    navi_configs[i] = value;
                            }
                        }
                        return value;
                    });
                },

                remove: function (navi_config) {
                    return navi_config.$remove({}, function (value) {
                        for(var i in navi_configs){
                            if(navi_configs[i].id == value.id){
                                navi_configs.splice(i,1);
                                break;
                            }
                        }
                        return value;
                    })
                },

                setSensor: function(navi_config, sensor, alias){
                    navi_config[alias] = sensor;
                    return this.save(navi_config).then(function(value){return value;});
                },

                getDeviceNaviConfig: function(deviceId) {
                    return DeviceNaviConfigs.get({deviceId: deviceId}).$promise
                },

                getReferenceSeries: function(deviceId){
                    return DeviceReferenceSeries.get({deviceId: deviceId}).$promise
                }
            }
        });

})();
