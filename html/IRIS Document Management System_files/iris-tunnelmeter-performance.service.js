(function () {
    angular.module('irisTunnelmeterPerformanceWidget').factory('IrisTunnelmeterPerformanceWidgetService',
        function ($translate, $filter, $window, $q, DataSeriesService, ReportsService, ProjectsService) {
            var defaultSettings = {
                condensationPeriod: "MDAY",
                expectedPerformanceValue: 20,
                unit: "METER",
                expectedPerformance: {
                    visible: false,
                    color: "#d43f3a",
                    text: "",
                    textTranslations: {}
                },
                expectedTunnelmeter: {
                    visible: false,
                    color: "#d43f3a"
                },
                performanceChart: {
                    color: "#88ae39",
                    numericalValues: {
                        visible: false,
                        decimals: 2
                    }
                },
                tunnelmeterChart: {
                    color: "#333",
                    numericalValues: {
                        visible: false,
                        decimals: 2
                    }
                },
                averageTunnelmeterChart: {
                    color: "#3a3fd4",
                    numericalValues: {
                        visible: false,
                        decimals: 2
                    }
                }
            };

            var demoDataStart = new Date(2000, 3, 25, 12),
                demoDataEnd = new Date(2000, 4, 15, 12),
                demoData = [
                {date: new Date(2000, 3, 25), value: 30},
                {date: new Date(2000, 3, 26), value: 59},
                {date: new Date(2000, 3, 27), value: 65},
                {date: new Date(2000, 3, 28), value: 89},
                {date: new Date(2000, 3, 29), value: 111},
                {date: new Date(2000, 3, 30), value: 132},
                {date: new Date(2000, 4, 1), value: 187},
                {date: new Date(2000, 4, 2), value: 213},
                {date: new Date(2000, 4, 2), value: 223},
                {date: new Date(2000, 4, 4), value: 228},
                {date: new Date(2000, 4, 5), value: 243},
                {date: new Date(2000, 4, 7), value: 276},
                {date: new Date(2000, 4, 8), value: 289},
                {date: new Date(2000, 4, 9), value: 299},
                {date: new Date(2000, 4, 10), value: 317},
                {date: new Date(2000, 4, 11), value: 331},
                {date: new Date(2000, 4, 13), value: 352},
                {date: new Date(2000, 4, 14), value: 372},
                {date: new Date(2000, 4, 15), value: 398},
                {date: new Date(2000, 4, 15), value: 420}
            ];

            var periods = [{
                id: 'MDAY',
                name: $translate.instant("label.performance.MDay")
            }, {
                id: 'MWEEK',
                name: $translate.instant("label.performance.MWeek")
            }, {
                id: 'MMONTH',
                name: $translate.instant("label.performance.MMonth")
            }];

            function getExpectedPerformanceSeries(expectedValue, length) {
                var res = [];
                for (var i = 1; i <= length; i++) {
                    res.push(expectedValue * i);
                }
                return res;
            }

            function getTunnelmeterSeries(performanceSeries) {
                if (!performanceSeries.length) return [];
                var res = [];
                res.push(performanceSeries[0]);
                for (var i = 1; i < performanceSeries.length; i++) {
                    res.push(res[i - 1] + performanceSeries[i]);
                }
                return res;
            }

            function getAverageTunnelmeterSeries(performanceSeries) {
                if (!performanceSeries.length) return [];
                var res = [],
                    sum = performanceSeries[0];
                res.push(performanceSeries[0]);
                for (var i = 1; i < performanceSeries.length; i++) {
                    sum += performanceSeries[i];
                    res.push(sum / (i + 1));
                }
                return res;
            }

            return {
                getDefaultSettings: function () {
                    return defaultSettings;
                },

                getDataIntervals: function(settings, periodStart, periodEnd, projectId) {
                    if (!projectId) {
                        var q = new $q.defer();
                        q.resolve([]);
                        return q.promise;
                    }

                    var condensationType = "";
                    switch (settings.condensationPeriod) {
                        case "MDAY":
                            condensationType = "DAY";
                            break;
                        case "MWEEK":
                            condensationType = "WEEK";
                            break;
                        case "MMONTH":
                            condensationType = "MONTH";
                            break;
                    }

                    return ReportsService.evaluateCondensations({
                        condensation: { condensationType, projectId },
                        workDaysConfigurationId: settings.workDaysConfigurationId,
                        startDate: periodStart,
                        endDate: periodEnd,
                        startPartial: "FULL",
                        endPartial: "FULL"
                    });
                },

                getDemoData: () => demoData,
                getDemoDataStart: () => demoDataStart,
                getDemoDataEnd: () => demoDataEnd,

                getData: function(dataSeriesId, periodStart, periodEnd) {
                    return DataSeriesService.getValues({
                        dataseries: angular.toJson([{id: dataSeriesId}]),
                        'date-start': periodStart,
                        'date-end': periodEnd,
                        'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}])
                    });
                },

                getPeriods: function() {
                    return periods;
                },

                getExpectedPerformanceSeries,

                getChartConfiguration: function(settings, intervals, rawData) {
                    var categories = intervals.map(i => $filter("irisTime")(i.from, this, settings.xAxisFormat));
                    var performanceSeries = ReportsService.calcTunnelmeterPerIntervals(rawData, intervals);
                    var tunnelmeterSeries = getTunnelmeterSeries(performanceSeries);
                    var averageTunnelmeterSeries = getAverageTunnelmeterSeries(performanceSeries);
                    var expectedTunnelmeterSeries = getExpectedPerformanceSeries(settings.expectedPerformanceValue, intervals.length);

                    return {
                        title: {
                            text: null
                        },
                        xAxis: [{
                            categories: categories
                        }],
                        yAxis: [{
                            title: {
                                text: $filter("irisTranslate")(settings.barChartLegend, settings.barChartLegendTranslations) + ", " + $filter("IrisFilterField")(settings.condensationPeriod, [periods]),
                                style: {
                                    color: "#333"
                                }
                            },
                            labels: {
                                format: "{value} " + $filter("irisUnits")(settings.unit, "short"),
                                style: {
                                    color: "#333"
                                }
                            },
                            plotLines: [{
                                value: settings.expectedPerformanceValue,
                                color: settings.expectedPerformance.color,
                                width: settings.expectedPerformance.visible ? 2 : 0,
                                label: {
                                    text: $filter("irisTranslate")(settings.expectedPerformance.text, settings.expectedPerformance.textTranslations),
                                    style: {
                                        color: settings.expectedPerformance.color
                                    }
                                },
                                zIndex: 10
                            }]
                        }, {
                            title: {
                                text: $filter("irisTranslate")(settings.lineChartLegend, settings.lineChartLegendTranslations) + ", " + $filter("IrisFilterField")(settings.condensationPeriod, [periods]),
                                style: {
                                    color: "#333"
                                }
                            },
                            labels: {
                                format: "{value} " + $filter("irisUnits")(settings.unit, "short"),
                                style: {
                                    color: "#333"
                                }
                            },
                            opposite: true
                        }],
                        legend: {
                            enabled: true
                        },
                        exporting: {
                            enabled: false
                        },
                        plotOptions: {
                            spline: {
                                dataLabels: {
                                    enabled: settings.tunnelmeterChart.numericalValues.visible,
                                    format: "{y:." + settings.tunnelmeterChart.numericalValues.decimals + "f} "
                                },
                                enableMouseTracking: true
                            },
                            line: {
                                dataLabels: {
                                    enabled: settings.averageTunnelmeterChart.numericalValues.visible,
                                    format: "{y:." + settings.averageTunnelmeterChart.numericalValues.decimals + "f} "
                                },
                                enableMouseTracking: true
                            },
                            column: {
                                dataLabels: {
                                    enabled: settings.performanceChart.numericalValues.visible,
                                    format: "{y:." + settings.performanceChart.numericalValues.decimals + "f} "
                                },
                                enableMouseTracking: true
                            }
                        },
                        series: [{
                            type: 'column',
                            name: $translate.instant('label.TunnelmeterPerformance'),
                            animation: false,
                            color: settings.performanceChart.color,
                            data: performanceSeries,
                            tooltip: {
                                valueDecimals: settings.performanceChart.numericalValues.decimals,
                                valueSuffix: ' ' + $filter("irisUnits")(settings.unit, "short")
                            }
                        }, {
                            type: 'spline',
                            name: $translate.instant('label.TunnelMeter'),
                            animation: false,
                            color: settings.tunnelmeterChart.color,
                            data: tunnelmeterSeries,
                            yAxis: 1,
                            tooltip: {
                                valueDecimals: settings.tunnelmeterChart.numericalValues.decimals,
                                valueSuffix: ' ' + $filter("irisUnits")(settings.unit, "short")
                            }
                        }, {
                            type: 'line',
                            name: $translate.instant('label.AveragePerformance'),
                            animation: false,
                            color: settings.averageTunnelmeterChart.color,
                            data: averageTunnelmeterSeries,
                            tooltip: {
                                valueDecimals: settings.averageTunnelmeterChart.numericalValues.decimals,
                                valueSuffix: ' ' + $filter("irisUnits")(settings.unit, "short")
                            }
                        }, {
                            type: 'line',
                            name: $translate.instant('label.performance.ExpectedTunnelmeter'),
                            animation: false,
                            marker: {
                                enabled: false
                            },
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: false,
                            color: settings.expectedTunnelmeter.color,
                            visible: !!settings.expectedTunnelmeter.visible,
                            data: expectedTunnelmeterSeries,
                            yAxis: 1,
                            tooltip: {
                                valueDecimals: settings.tunnelmeterChart.numericalValues.decimals,
                                valueSuffix: ' ' + $filter("irisUnits")(settings.unit, "short")
                            }
                        }]
                    };
                }
            };
        });

})();