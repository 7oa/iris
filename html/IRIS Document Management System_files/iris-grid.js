(function () {

    angular.module('iris_grid', []);

    angular.module('iris_grid').factory('IrisGridData', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + '/meas/dataseries', {});
    }]);

    angular.module('iris_grid').directive('irisGrid', ['$compile', 'IrisGridService',
        function ($compile, IrisGridService) {
            return {
                restrict: 'AE',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-grid/iris-grid.view.html',
                link: function ($scope, $element, $attrs) {
                    $scope.$watch('params', function (nv, ov) {
                        console.log('iris-grid params $watch', nv, ov);
                        $scope.data = IrisGridService.init($scope.params, $scope.widget, $attrs.mode);
                    }, true);
                }
            }
        }
    ]);

    angular.module('iris_grid').controller('GridEditCtrl', ['$scope', '$uibModal', '$filter', 'Devices', 'DeviceSensors', 'DataSeriesService',
        function ($scope, $uibModal, $filter, Devices, DeviceSensors, DataSeriesService) {
            $scope.addWidgetRow = function () {
                var row = {columns: []};
                for (var i = 0; i < $scope.getMaxColumns(); i++) {
                    row.columns.push({cell: {span: 1}});
                }
                $scope.widget.settings.layout.rows.push(row);
            };


            var forAllCells = function (func) {
                var result = [];
                for (var i in $scope.widget.settings.layout.rows) {
                    var row = $scope.widget.settings.layout.rows[i];
                    for (var j in row.columns) {
                        var cell = row.columns[j].cell;
                        if (cell) {
                            result.push(func(cell));
                        }
                    }
                }
                return result;
            };

            $scope.getColumnWidth = function (row, i) {
                var w = $scope.widget.settings.table[i];

                for (var j = i + 1; j < row.columns.length; j++) {
                    var nextCell = row.columns[j].cell || {span: 1};
                    if (nextCell.span == 0) {
                        w += $scope.widget.settings.table[j];
                    } else {
                        break;
                    }
                }
                return w;
            };


            $scope.isDependOnSensor = function () {

                var haveDependencies = false;
                forAllCells(function (cell) {
                    if (cell.type == 'ring' || cell.type == 'sensor') {
                        haveDependencies = true;
                    }
                });
                return haveDependencies;
            };

            //$scope.$watch('widget.settings.device_id', function (nv, ov) {
            //    //if (ov && nv && ov !== nv) {
            //    //    doWithCells(function(cell){
            //    //        console.log(cell);
            //    //
            //    //    });
            //    //}
            //
            //});

            $scope.addWidgetColumn = function (row) {
                //var max=$scope.getMaxColumns();
                //row.columns.push({
                //    width: null
                //});
                for (var i in $scope.widget.settings.layout.rows) {
                    $scope.widget.settings.layout.rows[i].columns.push({cell: {span: 1}})
                }
                $scope.updateGrid();
            };

            $scope.updateGrid = function () {
                var count = $scope.getMaxColumns();
                if (count == $scope.widget.settings.table.length) {
                    return;
                }
                var newColW = 100 / count;
                var k = (100 - newColW) / 100;
                if (count > $scope.widget.settings.table.length) {
                    for (var i in $scope.widget.settings.table) {
                        $scope.widget.settings.table[i] = $scope.widget.settings.table[i] * k;
                    }
                    $scope.widget.settings.table.push(newColW);
                }
                else {
                    for (var i in $scope.widget.settings.table) {
                        if (k == 0) {
                            $scope.widget.settings.table[i] = 100;
                        }
                        else
                            $scope.widget.settings.table[i] = $scope.widget.settings.table[i] * (1 + k);
                    }
                    $scope.widget.settings.table.splice(-1, 1)
                    //console.log("ccc", $scope.widget.settings.table)
                }
            };

            $scope.openEditCell = function (r, c) {

                $scope.sel_row = r;
                $scope.sel_cell = c;
                $scope.cell = angular.copy($scope.widget.settings.layout.rows[$scope.sel_row].columns[$scope.sel_cell].cell) || {};
                $scope.cell.device_id = $scope.widget.settings.device_id;
                $scope.refreshSensors();
                if ($scope.cell.device_sensor_id) {
                    $scope.refreshDataSeries($scope.cell);
                }
                $scope.modalInstance = $uibModal.open({
                    templateUrl: iris.config.widgetsUrl + '/iris-grid/grid_cell_edit.html',
                    scope: $scope
                });
            };

            $scope.splitSpan = function (row, j) {
                var found = false;
                for (var i = j; i < row.columns.length; i++) {
                    var cell = row.columns[i].cell || {span: 1};
                    if (cell.span == 0) {
                        found = true;
                    }
                    if (found && cell.span != 0) {
                        break;
                    }
                    cell.span = 1;
                    cell = row.columns[i].cell = cell;
                }
            };

            $scope.saveCell = function () {

                var cell;
                if ($scope.cell.type == 'sensor' && $scope.cell.add_name) {
                    var row = $scope.widget.settings.layout.rows[$scope.sel_row];
                    var nextFreeCell = function (row, ind) {
                        for (var i = ind; i < row.columns.length; i++) {
                            console.log(i, row.columns)
                            console.log(i, row.columns[i])
                            row.columns[i].cell = row.columns[i].cell || {span: 1};
                            if (row.columns[i].cell.span > 0) {
                                return i;
                            }
                        }
                        return null;
                    };

                    var cellInd = nextFreeCell(row, $scope.sel_cell);
                    if (cellInd != null) {
                        cell = row.columns[cellInd].cell = angular.copy($scope.cell);
                        cell.type = 'text';
                        cell.value = $scope.cell.data_series_name;


                        cellInd = nextFreeCell(row, cellInd + 1);
                        if (cellInd != null) {
                            row.columns[cellInd].cell = angular.copy($scope.cell);
                        }
                        cellInd = nextFreeCell(row, cellInd + 1);
                        if (cellInd != null) { //todo need new type
                            cell = row.columns[cellInd].cell = angular.copy($scope.cell);
                            cell.type = 'text';
                            cell.value = $scope.cell.data_unit;
                        }
                    }


                }
                else {
                    $scope.widget.settings.layout.rows[$scope.sel_row].columns[$scope.sel_cell].cell = angular.copy($scope.cell);
                }
                $scope.cell = {};
                $scope.closeModal();
            };

            $scope.spanRight = function (row, i) {
                var target = row.columns[i].cell || {span: 1};
                row.columns[i].cell = target;

                var next = null;
                for (var j = i + 1; j < row.columns.length; j++) {
                    var cur_next = row.columns[j].cell || {span: 1};
                    row.columns[j].cell = cur_next;
                    if (cur_next.span != 0) {
                        next = cur_next;
                        break;
                    }
                }
                if (next != null) {
                    target.span += next.span;
                    next.span = 0;
                }
            };

            $scope.removeWidgetRow = function (i) {
                if ($scope.widget.settings.layout.rows.length > 1) {
                    $scope.widget.settings.layout.rows.splice(i, 1);
                    $scope.updateGrid();
                }
            };


            $scope.removeWidgetColumn = function () {
                var i;
                if ($scope.getMaxColumns() > 1) {
                    for (var j in $scope.widget.settings.layout.rows) {
                        var row = $scope.widget.settings.layout.rows[j];
                        var column = row.columns[row.columns.length - 1];
                        if (column.cell.span == 0) {
                            for (i = row.columns.length - 1; i >= 0; i--) {

                                var cell = row.columns[i].cell;
                                if (cell.span != 0) {
                                    cell.span = cell.span - 1;
                                    break;
                                }
                            }
                        }
                    }

                    for (i in $scope.widget.settings.layout.rows) {
                        $scope.widget.settings.layout.rows[i].columns.splice(-1, 1);
                    }
                }
                $scope.updateGrid();
            };

            $scope.clearCell = function (row, i) {
                var cell = {};
                cell.span = row.columns[i].cell.span;
                console.log(cell);

                row.columns[i].cell = cell;
            };

            $scope.$watch('cell.device_id', function (nv, ov) {
                if (nv) {

                }
            });

            $scope.refreshSensors = function () {
                $scope.device_sensors = DeviceSensors.query({device_id: $scope.widget.settings.device_id});
            };

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

            $scope.setDataSeriesName = function (cell) {
                cell.data_series_name = "";
                cell.date_series_type = "";
                var ds = $filter('filter')($scope.data_series, {id: cell.data_series_id}, true)[0];
                var sens = $filter('filter')($scope.device_sensors, {id: cell.device_sensor_id}, true)[0];
                //  console.log("ds",ds)
                if (ds) {

                    cell.device_sensor_name = sens.name;
                    cell.data_series_name = ds.name;
                    cell.data_series_type = ds.dataSeriesType;
                    cell.data_unit = ds.irisUnit;
                    // console.log("DDDD",cell.date_series_type)
                }
            };

            $scope.devices = Devices.query();

            $scope.closeModal = function () {
                $scope.modalInstance.close();
            };

            $scope.getColumnsCount = function (row) {
                return row.columns.length;
            };

            $scope.getMaxColumns = function () {
                var max = 0;
                for (var i in $scope.widget.settings.layout.rows) {
                    var row = $scope.widget.settings.layout.rows[i];
                    var cur = $scope.getColumnsCount(row);
                    if (cur > max) {
                        max = cur;
                    }
                }
                return max;
            };

            $scope.getColSpan = function (row, i) {
                var cell = row.columns[i].cell || {span: 1};
                if (!angular.isDefined(cell.span)) {
                    return 1;
                }
                return cell.span;

                //var count = $scope.getColumnsCount(row);
                //var max = $scope.getMaxColumns();
                //var w = parseInt(max / $scope.getColumnsCount(row));
                //if (row.columns.length == 3)
                //    console.log("c m w", count, max, w);
                //
                //if (count == i + 1) {
                //    return max - w * (count - 1);
                //}
                //return w;
            };


            $scope.getDefaultColumnsWeight = function () {

                var columns = [];
                var count = $scope.getMaxColumns();
                for (var i = 0; i < count; i++) {
                    columns.push(100 / count);
                }
                return columns;
            };
            //if(!$scope.widget.settings.table){
            //    $scope.getDefaultColumnsWeight();
            //}
            $scope.widget.settings.table = $scope.widget.settings.table || $scope.getDefaultColumnsWeight();
        }
    ]);

    angular.module('iris_grid').service('IrisGridService', ['$q', 'IrisGridDefaults', 'IrisGridData', 'DeviceDataService',
        function ($q, IrisGridDefaults, IrisGridData, DeviceDataService) {
            this.getDefaultSettings = function () {
                return IrisGridDefaults;
            };

            this.init = function (params, widget, mode) {
                console.log(mode);
                params = params || {};
                widget.maxRing = {};
                widget.minRing = {};
                widget.dataseries = [];
                widget.dataseries_ids = [];


                widget.date = {from: {}, to: null};


                if (widget.timeType == 'period') {
                    widget.date.from = params['period'].date_start;
                    var date_end = params['period'].date_end;
                    if (!date_end) {
                        widget.date.to = widget.date.from;
                    } else {
                        widget.date.to = date_end;
                    }
                }
                else {
                    widget.date.from = params['date'] ? params['date'].date : new Date();
                    widget.date.to = widget.date.from;
                }
                console.log('params', params, widget);


                var _this = this;

                //console.log("w", widget.settings.layout);

                if (mode != 'demo') {
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
                } else {

                    for (var rowId in widget.settings.layout.rows) {
                        var row = widget.settings.layout.rows[rowId];
                        for (var colId in row.columns) {
                            var column = row.columns[colId];
                            if (column.cell) {
                                _this.initCell(column.cell, params, widget,mode );
                            }
                        }
                    }
                }
            };

            this.initCell = function (cell, params, widget, mode) {
                // console.log(cell);
                switch (cell.type) {
                    case 'text':
                        cell.view = cell.value;
                        break;
                    case 'parameter':
                        cell.view = params[cell.value].value;
                        break;
                    case 'sensor':
                        if (mode == 'demo') {
                            cell.view = 10;
                        } else {
                            widget.dataseries[cell.data_series_id] = {cell: cell, series_id: cell.data_series_id};
                            widget.dataseries_ids.push({dataSeriesId: cell.data_series_id});
                        }
                        break;
                    case 'ring':
                        //{type:'Begin'}, {type:'End'},{type:'Count'}
                        console.log("cell", cell);

                        switch (cell.value) {
                            case 'Begin':
                                cell.view = mode == 'demo' ? '1' : ( widget.isRingNameView ? widget.minRing.name : widget.minRing.id);
                                break;
                            case 'End':
                                cell.view = mode == 'demo' ? '1' :  (widget.isRingNameView ? widget.maxRing.name : widget.maxRing.id);
                                break;
                            case 'Count':
                                cell.view =  mode == 'demo' ? '1' : (widget.rings.length);
                        }
                        break;
                }
            };

            this.initRings = function (widget) {
                widget.rings = DeviceDataService.getAdvances({
                    project_id: widget.settings.project_id,
                    device_id: widget.settings.device_id,
                    from: widget.date.from,
                    to: widget.date.to
                });

                return widget.rings.then(function (value) {
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

                            var data = result[i];
                            var cell = widget.dataseries[data.sensor_id].cell;
                            if (cell.data_series_type != 'CONDENSED') {

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

    angular.module('iris_grid').factory('IrisGridDefaults', [function () {
        return {
            page: {},
            layout: {
                rows: [
                    {
                        columns: [
                            {
                                width: 12
                            }
                        ]
                    }
                ]
            }
        };
    }])
})();

