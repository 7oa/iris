(function () {

    angular.module('iris_bar_chart').directive('irisBarChart',
        function ($filter, $timeout, IrisBarChartService, DataSeriesService) {
            return {
                restrict: 'AE',
                scope: {
                    params: '=',
                    widget: '=',
                    settings: '='
                },
                template: '<highchart config="chartConfig"></highchart>',
                link: function (scope, elem, attrs) {

                    var defaults = IrisBarChartService.getDefaultSettings();
                    var settings = scope.widget && scope.widget.settings || defaults;
                    var chartOptions = {data : []};

                    function requestData(ring){
                        if(!ring) return;

                        var dsList = settings.dataSeries.map(ds => {
                            return {id: ds.id, targetUnit: settings.dataSeriesUnit}
                        });

                        // Fetch condensed data series values
                        DataSeriesService.getValues({
                            dataseries: angular.toJson(dsList),
                            'advance-start': scope.params.date.ring,
                            'advance-end': scope.params.date.ring,
                            project: scope.widget.projectId,
                            device: scope.widget.deviceId,
                            'group-by': angular.toJson([{type: 'advance'}, {type: 'field', value: 'dataseriesId'}])
                        }).then(function (result) {
                            var requestedAdvance = result[scope.params.date.ring];

                            if(!requestedAdvance) {
                                chartOptions.data = [];
                            } else {
                                chartOptions.data = settings.dataSeries.map(ds => {
                                    var dataSeriesID = ds.id;
                                    var lastIndex = requestedAdvance[dataSeriesID] && (requestedAdvance[dataSeriesID].length - 1);

                                    return lastIndex >= 0 ? requestedAdvance[dataSeriesID][lastIndex].value : null;
                                });
                            }

                            renderData();
                        });
                    }

                    function renderData() {
                        scope.chartConfig.xAxis.categories = settings.dataSeries.map(ds => ds.name);

                        if (attrs.mode == 'demo') {
                            // Set demo values for chart
                            chartOptions.demoData = chartOptions.demoData || [];
                            chartOptions.data = settings.dataSeries.map((ds, i) => chartOptions.demoData[i] = chartOptions.demoData[i] || Math.random() * 100);
                        }

                        scope.chartConfig.series = [{
                            data: chartOptions.data,
                            color: settings.barColor
                        }];

                        var chartType = settings.isHorizontal ? 'bar' : 'column';
                        scope.chartConfig.options.chart = {
                            type: chartType,
                            height: settings.chartHeight > 200 ? settings.chartHeight : 200
                        };

                        scope.chartConfig.options.tooltip = {
                            valueDecimals: settings.measurementDecimals,
                            valueSuffix: ' ' + $filter("irisUnits")(settings.dataSeriesUnit, "short")
                        };

                        scope.chartConfig.options.plotOptions[chartType] = {
                            dataLabels: {
                                enabled: settings.isShowValues,
                                format: "{y:." + settings.measurementDecimals + "f} " + $filter("irisUnits")(settings.dataSeriesUnit, "short")
                            },
                            enableMouseTracking: true
                        };

                        if (!settings.isAutoScale) {
                            var mainAxis = settings.isHorizontal ? 'yAxis' : 'xAxis';
                            var otherAxis = settings.isHorizontal ? 'xAxis' : 'yAxis';
                            scope.chartConfig.options[mainAxis] = {
                                min: settings.minRange,
                                max: settings.maxRange
                            };
                            scope.chartConfig.options[mainAxis].title = {text: null};
                            scope.chartConfig.options[otherAxis].title = {text: settings.measurementLabel};
                        }

                    }

                    scope.$watch('widget.settings',(nv, ov) => {
                        if(!nv || angular.equals(nv,ov)) return;
                        renderData();
                    }, true);

                    $timeout(()=>{
                        renderData();
                    },100);

                    scope.$watch('params.date.ring',requestData);

                },
                controller: function ($scope) {
                    $scope.barChart = null;
                    $scope.chartConfig = {
                        options: {
                            chart: {
                                type: 'bar'
                            },
                            exporting: {
                                enabled: false
                            },
                            plotOptions: {},
                            yAxis: {},
                            xAxis: {},
                            legend: {
                                enabled: false
                            },
                            tooltip: {},
                        },
                        yAxis: {
                            title: {text:null},
                            labels: {
                                format: '{value:.0f}'
                            },
                            lineWidth: 1
                        },
                        xAxis: {
                            title: {text:null},
                            categories: []
                        },
                        plotOptions: {},
                        title: {
                            text: '',
                            x: -20 //center
                        },
                        series: [],
                        func: function (chart) {
                            $scope.barChart = chart;
                        }
                    };
                }
            }
        });
})();