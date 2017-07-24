(function () {
    angular.module('irisSpoilManagement').directive('irisSpoilManagementLine', function ($translate, $filter, $timeout, IrisSpoilManagementService) {
        return {
            restrict: 'EA',
            scope: {
                values: '=',
                dataseries: '=',
                target: '=',
                params: '=',
                stroke_ds: '=strokeDs',
                range_ds: '=rangeDs',
                averageValue: '='
            },
            template: '<highchart config="chartConfig"></highchart>',
            link: function (scope, element, attrs) {
                scope.default_range = IrisSpoilManagementService.getDefaultRange();

                scope.chartConfig.series = [{
                    name: $translate.instant(attrs.labelCurrent),
                    tooltip: {
                        valueDecimals: scope.$parent.getDigitsByDSId(scope.dataseries),
                        valueSuffix: ' ' + $translate.instant(attrs.unitY)
                    },
                    data: [],
                    color: '#93BE3D'
                }, {
                    name: $translate.instant(attrs.labelTarget),
                    tooltip: {
                        valueDecimals: scope.$parent.getDigitsByDSId(scope.target),
                        valueSuffix: ' ' + $translate.instant(attrs.unitY)
                    },
                    data: [],
                    color: '#D74C0C'
                }, {
                    name: $translate.instant(attrs.labelTarget) + ' + ' + $filter('number')(scope.default_range, 0) + ' %',
                    tooltip: {
                        valueDecimals: scope.$parent.getDigitsByDSId(scope.target),
                        valueSuffix: ' ' + $translate.instant(attrs.unitY)
                    },
                    data: [],
                    color: '#FFC0A4'
                }, {
                    name: $translate.instant(attrs.labelTarget) + ' - ' + $filter('number')(scope.default_range, 0) + ' %',
                    tooltip: {
                        valueDecimals: scope.$parent.getDigitsByDSId(scope.target),
                        valueSuffix: ' ' + $translate.instant(attrs.unitY)
                    },
                    data: [],
                    color: '#FFC0A4'
                }];

                var averageSeries = {
                    name: $translate.instant('label.Average'),
                    tooltip: {
                        valueDecimals: scope.$parent.getDigitsByDSId(scope.dataseries),
                        valueSuffix: ' ' + $translate.instant(attrs.unitY)
                    },
                    data: [],
                    color: '#FF8A00'
                };
                var averageCoefficient = 0;

                if (scope.params.demo) {
                    scope.demo_ds_values = IrisSpoilManagementService.getDemoData('line');
                    for (var i = 0; i < 4; i++) scope.chartConfig.series[i].data = scope.demo_ds_values[i].values;
                    console.log(scope.chartConfig.series);
                }

                //For each new step we need to calculate the current sum value
                scope.prepareData = function () {
                    $timeout(function () {
                        scope.chartConfig.yAxis.title.text = '[' + $translate.instant(attrs.unitY) + ']';
                        scope.chartConfig.xAxis = IrisSpoilManagementService.getLineXAxisParams(scope.params.xAxis);
                        scope.chartConfig.options.tooltip.headerFormat = IrisSpoilManagementService.getLineXAxisHeader(scope.params.xAxis);
                        if (scope.params.xAxis === 'length' && attrs.unitX !== undefined) {
                            scope.chartConfig.xAxis.title.text = $translate.instant('label.StrokeLength') + (' ' + $translate.instant(attrs.unitX));
                            scope.chartConfig.xAxis.unit = $translate.instant(attrs.unitX);
                        }
                    }, 0);

                    if (scope.params.demo) return;

                    if(scope.averageValue) {
                        scope.chartConfig.series.push(averageSeries);
                        averageCoefficient = (+scope.averageValue) / scope.params.averageDeltaStroke;
                    } else {
                        scope.chartConfig.series = scope.chartConfig.series.slice(0, 4);
                    }

                    scope.chartConfig.series[0].data = [];
                    scope.chartConfig.series[1].data = [];
                    scope.chartConfig.series[2].data = [];
                    scope.chartConfig.series[3].data = [];
                    averageSeries.data = [];

                    if (!scope.dataseries || angular.isUndefined(scope.values) || !scope.target || !scope.stroke_ds || !scope.range_ds) return;

                    scope.ds_values = scope.values[scope.dataseries] || [];
                    scope.stroke_ds_values = scope.values[scope.stroke_ds] || [];
                    scope.target_values = scope.values[scope.target] || [];
                    scope.range_values = scope.values[scope.range_ds] || [];

                    var x = 0;
                    if(scope.params.xAxis == 'time') {
                        var date = new Date(scope.stroke_ds_values[0].date).getTime();
                        x = date - scope.$parent.getTZOffset(date) * 60 * 1000;
                    }

                    //Set the first value = 0
                    scope.chartConfig.series[0].data.push([x, 0]);
                    scope.chartConfig.series[1].data.push([x, 0]);
                    scope.chartConfig.series[2].data.push([x, 0]);
                    scope.chartConfig.series[3].data.push([x, 0]);
                    averageSeries.data.push([x, 0]);

                    //Number of values - to show existed number of points
                    var num_ds_vals = scope.ds_values.length;
                    //Number of stroke values to merge
                    var num_stroke_vals = scope.stroke_ds_values.length;
                    var num_target_vals = scope.target_values.length;
                    var num_range_vals = scope.range_values.length;

                    //change legend labels for DS with range
                    if (num_range_vals) {
                        var last_range_val = scope.range_values[num_range_vals - 1].value;
                        if (angular.isUndefined(last_range_val) || last_range_val == null) last_range_val = scope.default_range;
                        scope.chartConfig.series[2].name = $translate.instant(attrs.labelTarget) + ' + ' + $filter('number')(last_range_val, 0) + ' %';
                        scope.chartConfig.series[3].name = $translate.instant(attrs.labelTarget) + ' - ' + $filter('number')(last_range_val, 0) + ' %';
                    }

                    var prev_val = 0; //previous value used to show the line like step-chart
                    var cur_val = 0; //current calculated value - sum of previous
                    var i = 0, j = 0, k = 0, r = 0, cur_target_val = 0, cur_range_val = scope.default_range;

                    //duplicate last stroke value with it's date end to show values while stroke was not growing in the end
                    if(num_stroke_vals > 0){
                        var val = scope.stroke_ds_values[num_stroke_vals - 1];
                        val.date = val.dateEnd;
                        if(val.date){
                            scope.stroke_ds_values.push(val);
                            num_stroke_vals++;
                        }
                    }

                    while (j < num_stroke_vals) {
                        //console.log('j',j,num_stroke_vals,scope.stroke_ds_values[j].date,scope.stroke_ds_values[j].value);
                        while (i < num_ds_vals && new Date(scope.stroke_ds_values[j].date) >= new Date(scope.ds_values[i].date)) {
                            cur_val = scope.ds_values[i].value;

                            if(scope.params.xAxis == 'time') {
                                x = new Date(scope.ds_values[i].date).getTime() - scope.$parent.getTZOffset(date) * 60 * 1000;
                                scope.chartConfig.series[0].data.push([x, cur_val]);
                            }
                            //console.log('i',i,num_ds_vals,scope.ds_values[i].date,scope.ds_values[i].value,cur_val);
                            i++;
                        }

                        while (k < num_target_vals && new Date(scope.stroke_ds_values[j].date) >= new Date(scope.target_values[k].date)) {
                            cur_target_val = scope.target_values[k].value;
                            //console.log('k',k,num_target_vals,scope.target_values[k].date,scope.target_values[k].value);
                            k++;
                        }

                        while (r < num_range_vals && new Date(scope.stroke_ds_values[j].date) >= new Date(scope.range_values[r].date)) {
                            cur_range_val = scope.range_values[r].value;
                            //console.log('r',r,num_range_vals,scope.range_values[r].date,scope.range_values[r].value);
                            r++;
                        }

                        //If first dry mass value comes after current stroke value - ignore stroke value point
                        //Or if the Dry mass value has not been changed then take next stroke value
                        //Don't forget to put the last stroke point (reason for -1)
                        if ((i == 0 || cur_val == prev_val) && j != num_stroke_vals - 1) {
                            j++;
                            continue;
                        }

                        if(scope.params.xAxis == 'time') {
                            var date = new Date(scope.stroke_ds_values[j].date).getTime();
                            x = date - scope.$parent.getTZOffset(date) * 60 * 1000;
                        } else {
                            x = scope.stroke_ds_values[j].value;
                        }

                        if (scope.params.xAxis != 'time') scope.chartConfig.series[0].data.push([x, prev_val]);
                        scope.chartConfig.series[0].data.push([x, cur_val]);
                        scope.chartConfig.series[1].data.push([x, cur_target_val]);
                        scope.chartConfig.series[2].data.push([x, cur_target_val * (1 + cur_range_val / 100)]);
                        scope.chartConfig.series[3].data.push([x, cur_target_val * (1 - cur_range_val / 100)]);
                        averageSeries.data.push([x, averageCoefficient * scope.stroke_ds_values[j].value]);

                        prev_val = cur_val;
                        j++;
                    }
                };

                scope.$watchGroup(['values', 'dataseries'], scope.prepareData);

                scope.$on('spoilmgt.values_changed', scope.prepareData);

                scope.$watch('params', scope.prepareData, true);
            },
            controller:
                function ($scope, $timeout, IrisSpoilManagementService) {
                    console.log('nerv', $scope);
                    $scope.chartConfig = {
                        options: {
                            chart: {
                                zoomType: 'xy'
                            },

                            //to hide points on the line (triangles, squares, circles, etc)
                            plotOptions: {
                                line: {
                                    marker: {
                                        enabled: false
                                    }
                                }
                            },

                            //hide exporting buttons
                            exporting: {
                                enabled: false
                            },

                            //to have one line on mouse move which will show one tooltip, which contains values from all lines
                            tooltip: {
                                headerFormat: IrisSpoilManagementService.getLineXAxisHeader('stroke'),
                                xDateFormat: '%d.%m.%Y %H:%M:%S',
                                shared: true
                            },

                            title: {
                                text: ''
                            },
                            legend: {
                                verticalAlign: 'bottom'
                            }
                        },
                        yAxis: {
                            title: {
                                text: ''
                            },
                            labels: {
                                format: '{value:.0f}'
                            },
                            lineWidth: 1
                        },
                        xAxis: IrisSpoilManagementService.getLineXAxisParams('stroke'),
                        series: [],
                        func: function (chart) {
                            $timeout(function () {
                                chart.reflow();
                            }, 0);
                        }
                    };
                }
        };
    });

})();

