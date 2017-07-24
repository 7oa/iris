(function () {

    angular.module('iris_interval_chart', []);

    angular.module('iris_interval_chart').directive('irisIntervalChart', ['$compile','$translate', '$timeout','$stateParams',
        'irisIntervalChartService',
        'IrisSpoilManagementService',
        'IntervalScannerService',
        'DataSeriesService',
        function ($compile,$translate,$timeout, $stateParams, irisIntervalChartService, IrisSpoilManagementService, IntervalScannerService, DataSeriesService) {
            return {
                restrict: 'AE',
                scope: {
                    params: '=',
                    widget: '='
                },
                //template:'<span ng-repeat="p in params">{{p.label}} = {{p.value}}</span>',
                templateUrl: iris.config.widgetsUrl + '/iris-interval-chart/templates/iris-interval-chart.view.html',
                link: function ($scope, element, $attrs) {

                    $scope.dataseries = [];

                    $scope.api = {};
                    $scope.chartOptions = {
                        "xAxis":"DATE",
                        "axisStyle":{}

                    };
                    $scope.axisConfig = {
                        x: {
                            xAxis: 'DATE'
                        },
                        y: {}
                    };

                    var scanner = $scope.params.scanner;
                    IntervalScannerService.getScannerDataSeries(scanner.deviceId,scanner.id).then(function (ds) {
                        for(var i = 0, c = ds.length; i < c; i++) {
                            ds[i].color = Highcharts.getOptions().colors[i];
                                //iris.tools.getRandomColor();
                        }
                        $scope.dataseries = ds;
                    });

                    $scope.selected_ds = [];
                    $scope.toggleSelected = function (ds) {
                        if(!ds.selected){
                            for (var i = 0, c = $scope.selected_ds.length; i < c; i++) {
                                if($scope.selected_ds[i].id == ds.id){
                                    $scope.selected_ds.splice(i,1);
                                    break;
                                }
                            }
                            return;
                        }
                        $scope.selected_ds.push(ds);
                    };
                }
            }
        }
    ]);

    angular.module('iris_interval_chart').service('irisIntervalChartService',
        ['$q', '$translate', 'irisIntervalChartDefaults', 'DeviceDataService',
            function ($q, $translate, irisIntervalChartDefaults, DeviceDataService) {
                this.getDefaultSettings = function () {
                    return irisIntervalChartDefaults;
                };

                this.initGrid = function (scope, params, widget, mode) {

                    scope.gridOptions = scope.gridOptions ||
                        {
                            enableSorting: false,
                            data: [],
                            onRegisterApi: function (gridApi) {
                                scope.gridApi = gridApi;
                            }
                        };
                    scope.gridOptions.columnDefs = widget.settings.columns;

                    var paginationPageSizes = widget.settings.paginationPageSizes;
                    paginationPageSizes = paginationPageSizes || 50;
                    scope.gridOptions.paginationPageSizes = [paginationPageSizes];
                    return scope.gridOptions;
                };

                this.addDataSeries = function (widget, ds) {
                    var column = {
                        field: "" + ds.data_series_id, displayName: ds.device_sensor_name,
                        name: new Date().getTime() + "_" + ds.data_series_id,
                        headerCellTemplate: iris.config.widgetsUrl + '/iris-interval-condensed/templates/header.template.html',
                        ds: ds
                    };

                    console.log('added column:', column);
                    widget.settings.columns = widget.settings.columns || [];
                    widget.settings.columns.push(column);
                };

                this.editDataSeries = function (widget, ds) {
                    var column = {
                        field: "" + ds.data_series_id, displayName: ds.device_sensor_name,
                        name: new Date().getTime() + "_" + ds.data_series_id,
                        headerCellTemplate: iris.config.widgetsUrl + '/iris-interval-condensed/templates/header.template.html',
                        ds: ds
                    };
                    if (!ds.col_name) {
                        console.log('added column:', column);
                        widget.settings.columns = widget.settings.columns || [];
                        widget.settings.columns.push(column);
                        ds.col_name = column.name;
                    }
                    else {
                        for (var ind in widget.settings.columns) {
                            var col = widget.settings.columns[ind];
                            if (col.name == ds.col_name) {
                                widget.settings.columns[ind] = column;
                                break;
                            }
                        }
                    }
                };

                this.initData = function (params, widget, mode) {
                    console.log('params', params);
                    console.log('widget', widget);
                    var dataseries = [];
                    for (var i = 3; i < widget.settings.columns.length; i++) {
                        var column = widget.settings.columns[i];

                        var ds = {id: column.ds.data_series_id, targetUnit: column.ds.data_unit};
                        dataseries.push(ds);
                    }


                    var data = DataSeriesService.getValues({
                        dataseries: angular.toJson(dataseries),
                        'date-start': params['period'].date_start,
                        'date-end': params['period'].date_end,
                        project: widget.parameters[0].project_id,
                        device: widget.parameters[1].device_id,
                        'group-by': angular.toJson([{type: 'advance'},{type:'field',value:'dataseriesId'}])
                    });
                    var unwraped=[];
                    data.then(function(values){
                        for(var advance in values){
                            var rows=values[advance];
                            if(advance==""){
                                advance="empty";
                            }
                            for(var id in rows){
                                var ds=rows[id];
                                var value=ds[ds.length-1].value; //if we have many values of dataseries fo this ring - last
                                rows[id]=value;
                            }
                            rows.advances=advance;
                            unwraped.push(rows);
                        }
                        widget.gridOptions.data=unwraped;
                    });

                };
            }
        ]);

    angular.module('iris_interval_chart').factory('irisIntervalChartDefaults', ['$translate', function ($translate) {
        return {
            columns: [
                {field: 'advances', displayName: $translate.instant('label.Advance'), pinnedRight: true},
                {field: 'date_start', displayName: $translate.instant('label.StartDate')},
                {field: 'date_end', displayName: $translate.instant('label.EndDate')}
            ]
        };
    }])
})();
