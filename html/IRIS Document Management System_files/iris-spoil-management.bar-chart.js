(function () {
    angular.module('irisSpoilManagement').directive('irisSpoilManagementBar', function ($translate, $timeout, IrisSpoilManagementService) {
        return {
            restrict: 'EA',
            scope: {
                values: '=',
                dataseries: '=',
                params: '=',
                show_controls: '=showControls'
            },
            template: '<highchart config="chartConfig"></highchart>',
            link: function (scope, element, attrs) {

                scope.chartConfig.xAxis.categories = [];
                scope.chartConfig.series = [{
                    type: 'column',
                    name: $translate.instant(attrs.label),
                    tooltip: {
                        valueDecimals: 0,
                        valueSuffix: ' ' + $translate.instant(attrs.units)
                    },
                    data: [],
                    color: '#93BE3D'
                }, {
                    type: 'line',
                    name: $translate.instant('label.Average'),
                    tooltip: {
                        valueDecimals: 0,
                        valueSuffix: ' ' + $translate.instant(attrs.units)
                    },
                    data: [],
                    color: '#FF8A00'
                }];

                if (scope.params.demo) {
                    scope.demo_ds_values = IrisSpoilManagementService.getDemoData('bar');
                    for (var i = 0; i < 2; i++) scope.chartConfig.series[i].data = scope.demo_ds_values[i].values;
                }

                $timeout(function () {
                    scope.chartConfig.yAxis.title.text = '[' + $translate.instant(attrs.units) + ']';
                }, 0);

                scope.prepareData = function () {
                    if (scope.params.demo) return;

                    scope.chartConfig.xAxis.categories = (scope.params.advancesForBars || []).map(advance => advance.name);
                    var bars = scope.chartConfig.xAxis.categories;

                    scope.chartConfig.series[0].data = [];
                    scope.chartConfig.series[1].data = [];
                    scope.min = null;
                    scope.max = null;
                    if (!scope.dataseries || !scope.values || !bars.length) return;

                    iris.loader.start(element);
                    var sum = 0;
                    var num_of_advances = 0;

                    //first advance in the list
                    var first_advance = null;

                    bars.sort((a,b) => a - b);

                    var advance;

                    //Filling the bars data array
                    for (advance of bars) {
                        //Don't show the current selected advance value , only the previous ones
                        var cur_adv_number = +advance;
                        if (cur_adv_number >= +scope.params.advance) continue;

                        first_advance = first_advance || advance;
                        var value = scope.values[advance] && scope.values[advance][scope.dataseries] || [];
                        var n = value.length - 1;
                        if (n < 0) {
                            scope.chartConfig.series[0].data.push(null);
                            continue;
                        }
                        value = value[n].value;
                        if (scope.max == null || scope.max < value) {
                            scope.max = value;
                        }
                        if (scope.min == null || scope.min > value) {
                            scope.min = value;
                        }
                        sum += value;
                        scope.chartConfig.series[0].data.push(value);
                    }

                    //Filling the avg line data array
                    var avg = sum / bars.length;
                    scope.chartConfig.series[1].data = new Array(bars.length).fill(avg);

                    //Preparing values for ranges
                    scope.min = scope.min > 0 || !angular.isNumber(scope.min) ? 0 : scope.min;
                    scope.max = angular.isNumber(scope.max) ? (scope.max * 1.1 + 1).toFixed(0) : 0;
                    iris.loader.stop();
                };

                scope.$watchGroup(['values', 'dataseries'], scope.prepareData);
                scope.$on('spoil.data.loaded', scope.prepareData);
                scope.$on('spoilmgt.values_changed', scope.prepareData);
            },
            controller:
                function ($scope, $timeout) {
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
                                formatter: function () {
                                    var s = '<b>' + this.points[0].series.xAxis.userOptions.title.text + ': ' + this.x + '</b><br/>';

                                    $.each(this.points, function () {
                                        s += '<br/><span style="color: ' + this.series.color + '">● </span>' + this.series.name + ' ' + this.series.yAxis.userOptions.title.text + ': ' +
                                            Math.round(this.y);
                                    });

                                    return s;
                                },
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
                        xAxis: {
                            categories: [],
                            type: 'linear',
                            crosshair: true,
                            title: {
                                text: $translate.instant('label.Advance')
                            }
                        },
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

