(function () {
    angular.module('irisTableWidget').directive('irisTableWidgetCellPerformance',
        function ($q, $filter, $compile, ReportsService) {
            return {
                restrict: 'EA',
                scope: {
                    widget: '=',
                    cell: '=',
                    interval: '='
                },
                template: '',

                controller: function ($scope) {
                    $scope.cell.params.function || ($scope.cell.params.function = "AVERAGE");
                    $scope.cell.params.type || ($scope.cell.params.type = "TUNNELMETER");
                    $scope.cell.params.period || ($scope.cell.params.period = "DAY");
                    $scope.cell.params.decimals || ($scope.cell.params.decimals = 0);
                },

                link: function (scope, element, attrs) {
                    var mode = attrs["mode"];

                    function calcAdvancesPerIntervals(data, intervals) {
                        if (!data || !data.length) return intervals.map(i => 0);
                        var res = [];
                        for (var i = 0; i < intervals.length; i++) {
                            res[i] = 0;
                            data.forEach(a => {
                                var date = new Date(a.endTime);
                                if (date >= intervals[i].from && date < intervals[i].to) {
                                    res[i]++;
                                }
                            });
                        }
                        return res;
                    }

                    function calculateCellValue(data) {
                        if (!data || !data.length) return;

                        switch (scope.cell.params.function) {
                            case "START":
                                scope.cellValue = data[0];
                                break;
                            case "END":
                                scope.cellValue = data[data.length - 1];
                                break;
                            case "MIN":
                                scope.cellValue = Math.min(data);
                                break;
                            case "MAX":
                                scope.cellValue = Math.max(data);
                                break;
                            case "AVERAGE":
                                var sum = 0;
                                data.forEach(v => sum += v);
                                scope.cellValue = sum / data.length;
                                break;
                        }
                    }

                    scope.cellValue = null;
                    function refreshCellValue() {
                        if (mode == "demo") {
                            scope.cellValue = Math.random() * 100;
                        } else {
                            if (scope.cell.params.type == "TUNNELMETER") {
                                scope.widget.dataSeriesPromise.then(res => {
                                    var tunnelmeterData = res ? (res[scope.cell.params.dataSeries.id] || []) : [];
                                    tunnelmeterData = tunnelmeterData.filter(d => {
                                        return d.date && new Date(d.date) >= new Date(scope.interval.from) && new Date(d.date) <= new Date(scope.interval.to)
                                    });
                                    if (!tunnelmeterData.length) return;

                                    ReportsService.evaluateCondensations({
                                        condensation: { condensationType: scope.cell.params.period, projectId: scope.widget.projectId },
                                        workDaysConfigurationId: scope.widget.settings.workDaysConfigurationId,
                                        startDate: scope.interval.from,
                                        endDate: scope.interval.to,
                                        startPartial: "PARTIAL",
                                        endPartial: "PARTIAL"
                                    }).then(res => {
                                        var intervalsData = res.map(r => {
                                            return {from: new Date(r.from), to: new Date(r.to)};
                                        });
                                        var data = ReportsService.calcTunnelmeterPerIntervals(tunnelmeterData, intervalsData);
                                        calculateCellValue(data);
                                    });
                                });
                            } else if (scope.cell.params.type == "ADVANCE") {
                                scope.widget.advancesPromise.then(res => {
                                    var advancesData = res.filter(d => {
                                        return d.startTime && d.endTime && new Date(d.startTime) >= new Date(scope.interval.from) && new Date(d.endTime) <= new Date(scope.interval.to)
                                    });
                                    if (!advancesData.length) return;

                                    ReportsService.evaluateCondensations({
                                        condensation: { condensationType: scope.cell.params.period, projectId: scope.widget.projectId },
                                        workDaysConfigurationId: scope.widget.settings.workDaysConfigurationId,
                                        startDate: scope.interval.from,
                                        endDate: scope.interval.to,
                                        startPartial: "PARTIAL",
                                        endPartial: "PARTIAL"
                                    }).then(res => {
                                        var intervalsData = res.map(r => {
                                            return {from: new Date(r.from), to: new Date(r.to)};
                                        });
                                        var data = calcAdvancesPerIntervals(advancesData, intervalsData);
                                        calculateCellValue(data);
                                    });
                                });
                            }
                        }
                    }

                    switch (mode) {
                        case "edit":
                            var template = "<div><i>{{'label.Type' | translate}}:</i> {{cell.params.type | IrisFilterField:[widget.performanceTypes]}}</div>";
                            template += "<div><i>{{'label.Period' | translate}}:</i> {{cell.params.period | IrisFilterField:[widget.performancePeriods]}}</div>";
                            template += "<div><i>{{'label.Function' | translate}}:</i> {{cell.params.function | IrisFilterField:[widget.performanceFunctions]}}</div>";
                            element.html($compile(template)(scope));
                            break;
                        case "view":
                        case "demo":
                            refreshCellValue();
                            var template = "<span>{{cellValue | number:cell.params.decimals}}</span>";
                            element.html($compile(template)(scope));
                            break;
                        default:
                            var template = "<span class='alert alert-warning'>[mode] not defined</span>";
                            element.html(template);
                            break;
                    }
                }
            };
        });
})();

