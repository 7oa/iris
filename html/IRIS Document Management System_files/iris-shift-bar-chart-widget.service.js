(function () {
    angular.module('irisShiftBarChartWidget').factory('IrisShiftBarChartWidgetService',
        function ($translate, $q, $filter, ReportsService, ShiftProtocolService, DataSeriesService) {
            var defaultSettings = {
                selectedOperatingStates: [],
                useOnlyWithTasks: false,
                useOnlyCriticalTasks: true,
                projectChildrenTasks: true,
                title: "Monthly evaluation",
                titleTranslations: {},
                lineChartLegend: "Tunnelmeter",
                lineChartLegendTranslations: {},
                condensationType: "MONTH",
                showShiftValues: true,
                shiftDecimals: 2,
                shiftSumUnit: "HOUR",
                xAxisFormat: "MMM YY",
                showLegend: true,
                performanceColor: "#333",
                performanceValues: false,
                performanceDecimals: 2
            };

            var condensationTypes = [{
                id: 'DAY',
                name: $translate.instant("label.Day")
            }, {
                id: 'WEEK',
                name: $translate.instant("label.Week")
            }, {
                id: 'MONTH',
                name: $translate.instant("label.Month")
            }];

            var shiftSumUnits = [{
                id: 'MINUTE',
                name: $translate.instant("label.Minute"),
                sign: "m"
            }, {
                id: 'HOUR',
                name: $translate.instant("label.Hour"),
                sign: "h"
            }, {
                id: 'DAY',
                name: $translate.instant("label.Day"),
                sign: "d"
            }];

            function getShiftSeriesCodes(data) {
                var res = [];
                data.forEach(d => {
                    d && d.forEach(t => {
                        if (t && (res.map(r => r.name).indexOf(t[1]) < 0)) {
                            res.push({ color: t[0], name: t[1] });
                        }
                    });
                });
                return res;
            }

            function getShiftSeries(settings, intervals, data) {
                var res = getShiftSeriesCodes(data);
                for (let i = 0; i < res.length; i++) {
                    res[i].data = [];
                    res[i].tooltip = {
                        valueDecimals: settings.shiftDecimals,
                        valueSuffix: ' ' + $filter("IrisFilterField")(settings.shiftSumUnit, [shiftSumUnits, "sign"])
                    };
                    res[i].animation = false;
                    for (let j = 0; j < intervals.length; j++) {
                        data[j] && data[j].forEach(t => {
                            if (t && (t[1] == res[i].name)) {
                                switch (settings.shiftSumUnit) {
                                    case "MINUTE":
                                        res[i].data[j] = t[3];
                                        break;
                                    case "HOUR":
                                        res[i].data[j] = t[4];
                                        break;
                                    case "DAY":
                                        res[i].data[j] = t[5];
                                        break;
                                }
                            }
                        });
                        if (!res[i].data[j]) res[i].data[j] = 0;
                    }
                }
                return res;
            }

            return {
                getDefaultSettings: () => defaultSettings,
                getCondensationTypes: () => condensationTypes,
                getShiftSumUnits: () => shiftSumUnits,

                getDataIntervals: function(settings, periodStart, periodEnd, projectId) {
                    if (!projectId || !settings.condensationType) {
                        var q = new $q.defer();
                        q.resolve([]);
                        return q.promise;
                    }

                    return ReportsService.evaluateCondensations({
                        condensation: { condensationType: settings.condensationType, projectId },
                        workDaysConfigurationId: settings.workDaysConfigurationId,
                        startDate: periodStart,
                        endDate: periodEnd,
                        startPartial: "FULL",
                        endPartial: "FULL"
                    });
                },

                getDemoTunnelmeterData: function(dataseriesId, periodStart, periodEnd) {
                    var q = new $q.defer(),
                        res = DataSeriesService.getDemoTunnelmeterValues(dataseriesId, periodStart, periodEnd);
                    q.resolve(res);
                    return q.promise;
                },

                getDemoShiftData: function() {
                    return ShiftProtocolService.getDemoStatistics().then(res => {
                        return res.rows;
                    });
                },

                getShiftData: function(settings, periodStart, periodEnd, projectId, deviceId) {
                    return ShiftProtocolService.getStatistics({
                        projectId: projectId,
                        deviceId: deviceId,
                        from: periodStart,
                        to: periodEnd,
                        shiftModelIds: settings.shiftModels,
                        selectedStates: settings.selectedOperatingStates,
                        onlyCriticalTasks: settings.useOnlyCriticalTasks,
                        projectChildrenTasks: true,
                        columns: ['COLOR', 'CODE_NAME', 'PERCENTAGE', 'SUM_MINUTES', 'SUM_HOURS', 'SUM_DAYS']
                    }).then(res => {
                        return res.rows;
                    });
                },

                getChartConfiguration: function(settings, intervals, data) {
                    var categories = intervals.map(i => $filter("irisTime")(i.from, this, settings.xAxisFormat));
                    var shiftSeries = getShiftSeries(settings, intervals, data.shiftData);
                    var performanceSeries = ReportsService.calcTunnelmeterPerIntervals(data.tunnelmeterData, intervals);
                    var lineVisible = settings.dataSeries && settings.dataSeries.id;

                    var series = angular.copy(shiftSeries);
                    lineVisible && series.push({
                        type: 'spline',
                        name: $translate.instant('label.TunnelmeterPerformance'),
                        animation: false,
                        color: settings.performanceColor,
                        data: performanceSeries,
                        yAxis: 1,
                        tooltip: {
                            valueDecimals: settings.performanceDecimals,
                            valueSuffix: ' ' + $filter("irisUnits")(settings.unit, "short")
                        }
                    });

                    return {
                        title: {
                            text: $filter("irisTranslate")(settings.title, settings.titleTranslations)
                        },
                        chart: {
                            type: 'column'
                        },
                        xAxis: {
                            categories: categories
                        },
                        yAxis: [{
                            min: 0,
                            title: null,
                            labels: {
                                format: "{value}%"
                            }
                        }, {
                            title: lineVisible ? {
                                text: $filter("irisTranslate")(settings.lineChartLegend, settings.lineChartLegendTranslations) + ", " + $filter("irisUnits")(settings.unit, "short")
                            } : null,
                            labels: {
                                format: "{value} " + $filter("irisUnits")(settings.unit, "short")
                            },
                            opposite: true
                        }],
                        legend: {
                            enabled: settings.showLegend
                        },
                        exporting: {
                            enabled: false
                        },
                        plotOptions: {
                            column: {
                                stacking: 'percent',
                                dataLabels: {
                                    enabled: settings.showShiftValues,
                                    format: "{y:." + settings.shiftDecimals + "f} "
                                }
                            },
                            spline: {
                                dataLabels: {
                                    enabled: settings.performanceValues,
                                    format: "{y:." + settings.performanceDecimals + "f} "
                                }
                            }
                        },
                        series: series
                    };
                }
            };
        });

})();