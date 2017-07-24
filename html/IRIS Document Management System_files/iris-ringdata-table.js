(function () {

    angular.module('iris_ringdata_table', []);

    angular.module('iris_ringdata_table').factory('IrisGridData', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + '/meas/dataseries', {});
    }]);

    angular.module('iris_ringdata_table').factory('IrisRingData', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + '/devices/:device_id/rings', {});
    }]);

    angular.module('iris_ringdata_table').directive('irisRingGrid', ['$compile', 'IrisRingGridService',
        function ($compile, IrisGridService) {
            return {
                restrict: 'AE',
                scope: {
                    params: '=',
                    widget: '='
                },
                //template:'<span ng-repeat="p in params">{{p.label}} = {{p.value}}</span>',
                templateUrl: iris.config.widgetsUrl + '/iris-ring-grid/iris-ring-grid.view.html',
                link: function ($scope, $element, $attrs) {
                    $scope.$watch('params', function (nv, ov) {
                        //console.log(nv);
                        $scope.data = IrisGridService.init($scope.params, $scope.widget);
                    }, true);

                },
                controller: ['$scope',
                    function ($scope) {

                    }
                ]

            }
        }
    ]);

    angular.module('iris_ringdata_table').controller('RingGridEditCtrl', ['$scope', '$uibModal', '$filter', 'Devices', 'DeviceSensors', 'DataSeriesService',
        function ($scope, $uibModal, $filter, Devices, DeviceSensors, DataSeriesService) {

            $scope.devices = Devices.query();


            $scope.refreshDataSeries = function (cell) {
                var sensor_id = cell.device_sensor_id;
                if (sensor_id) {
                    $scope.data_series = DataSeriesService.getDSbySensor(sensor_id);
                    //TODO request names everytime
                    //console.log("ds",$scope.device_sensors);
                    $scope.data_series.$promise.then(function () {
                        $scope.device_sensors.$promise.then(function (data) {
                            $scope.setDataSeriesName(cell);
                            //cell.device_sensor_name = $filter('filter')($scope.device_sensors, {id: sensor_id}, true)[0].name;
                        });
                    });

                }
                else {
                    $scope.data_series = [];
                    $scope.device_sensor_name = null;
                }
            };

            this.editSensor= function (ind) {
                var sensorGroup={};
                if(ind){
                    sensorGroup=angular.copy($scope.widget.settings.sensorGroups[ind]);
                }
                $scope.sensorGroup = sensorGroup;
                $scope.refreshSensors();
                if ($scope.cell.device_sensor_id) {
                    $scope.refreshDataSeries($scope.cell);
                }
                $scope.modalInstance = $uibModal.open({
                    templateUrl: iris.config.widgetsUrl + '/iris-ringdata-table/iris-ringdata_add.html',
                    scope: $scope
                });
            }
            this.isDependOnSensor= function () {
                return $scope.widget.settings.sensors.length>0;
            }
        }

    ]);

    angular.module('iris_ringdata_table').service('IrisGridService', ['$q', 'IrisGridDefaults', 'IrisGridData', 'IrisRingData',
        function ($q, IrisGridDefaults, IrisGridData, IrisRingData) {
            this.getDefaultSettings = function () {
                return IrisGridDefaults;
            };

            this.init = function (params, widget) {
                widget.maxRing = {};
                widget.minRing = {};
                widget.dataseries = [];
                widget.dataseries_ids = [];
                widget.date = {from: {}, to: null};
                widget.date.from = new Date();
                for (var i in params) {
                    var p = params[i];

                    if (p.label == 'DateFrom') {
                        widget.date.from = p.value;
                    }
                    else if (p.label == 'DateTo') {
                        widget.date.to = p.value;
                    }
                }
                if (widget.date.to == null) {
                    widget.date.to = widget.date.from;
                }
                var _this = this;
                //
                //console.log("w", widget.settings.layout);
                this.initRings(widget).then(function (value) {
                    for (var rowId in widget.settings.layout.rows) {

                        var row = widget.settings.layout.rows[rowId];
                        for (var colId in row.columns) {
                            var column = row.columns[colId];
                            if (column.cell) {
                                _this.initCell(column.cell, params, widget);
                            }
                        }
                    }
                    _this.initDataSeries(widget);
                });


            };

            this.initCell = function (cell, params, widget) {
                // console.log(cell);
                switch (cell.type) {
                    case 'text':
                        cell.view = cell.value;
                        break;
                    case 'parameter':
                        cell.view = params[cell.value].value;
                        break;
                    case 'sensor':
                        widget.dataseries[cell.data_series_id] = {cell: cell, series_id: cell.data_series_id};
                        widget.dataseries_ids.push({dataSeriesId: cell.data_series_id});
                        break;
                    case 'ring':
                        //{type:'Begin'}, {type:'End'},{type:'Count'}
                        console.log("cell", cell);

                        switch (cell.value) {
                            case 'Begin':
                                cell.view = widget.isRingNameView ? widget.minRing.name : widget.minRing.id;
                                break;
                            case 'End':
                                cell.view = widget.isRingNameView ? widget.maxRing.name : widget.maxRing.id;
                                break;
                            case 'Count':
                                cell.view = widget.rings.length;
                        }
                        break;
                }
            };

            this.initRings = function (widget) {
                widget.rings = IrisRingData.query({
                    device_id: widget.settings.device_id,
                    from: widget.date.from,
                    to: widget.date.to,
                    'only-fields': '["id","name","endTime","startTime"]'
                });

                return widget.rings.$promise.then(function (value) {
                    widget.isRingNameView = true;
                    var ring;
                    if (widget.rings.length > 0) {
                        ring = widget.rings[0];
                        widget.maxRing = ring;
                        widget.minRing = ring;
                    }
                    if (widget.rings.length > 1) {
                        ring = widget.rings[widget.rings.length - 1];
                        widget.maxRing = ring;
                    }

                    for (var i in widget.rings) {
                        ring = widget.rings[i];
                        if (ring.name == null || ring.name == "") {
                            widget.isRingNameView = false;
                        }
                    }
                    return value;
                })
            };

            this.initDataSeries = function (widget) {
                if (widget.dataseries_ids.length > 0) {
                    var req_param = {
                        dates: [widget.date.from, widget.date.to],
                        settings: widget.dataseries_ids
                    };

                    IrisGridData.query({settings: angular.toJson(req_param)}, function (result) {
                        var i, j;
                        for (i = 0, c = result.length; i < c; i++) {
                            console.log("D");
                            var data = result[i];
                            var cell = widget.dataseries[data.sensor_id].cell;
                            if (cell.data_series_type != 'CONDENSED') {
                                console.log("D1");
                                switch (cell.data_series_function) {
                                    case 'MAX':
                                        var max = null;
                                        for (j in data.data) {
                                            if (max == null || max < data.data[j].value) {
                                                max = data.data[j].value;
                                            }
                                        }
                                        cell.view = max;
                                        break;
                                    case 'MIN':
                                        var min = null;
                                        for (j in data.data) {
                                            if (min == null || min > data.data[j].value) {
                                                min = data.data[j].value;
                                            }
                                        }
                                        cell.view = min;
                                        break;
                                    default :
                                        //case 'SUM':
                                        //    console.log("D2");
                                        var sum = 0.0;
                                        for (j in data.data) {
                                            sum += data.data[j].value;
                                            //console.log("D21",data.data[j].value,sum);
                                        }
                                        cell.view = sum;
                                        break;

                                }
                            }
                            else {
                                console.log("init cell CONDENSED");
                                for (j in data.data) {
                                    if (data.data[j].value != null) {
                                        cell.view = data.data[j].value;

                                        break;
                                    }
                                }
                            }
                            //cell.view=cell.data_series_name+''+cell.view;
                            //console.log("cell=",cell.view);
                            //cell.view = data.data[0].value;
                        }
                    });
                }
            };
        }
    ]);


    angular.module('iris_ringdata_table').factory('IrisGridDefaults', [function () {
        return {
            sensorsGroups:[],
            deviceId: null
        };
    }])
})();

