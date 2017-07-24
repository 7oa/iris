(function () {
    angular.module('irisTableWidget').directive('irisTableWidgetCellDate',
        function ($q, $filter, $compile, DeviceDataService) {
            return {
                restrict: 'EA',
                scope: {
                    widget: '=',
                    cell: '=',
                    interval: '='
                },
                template: '',

                controller: function ($scope) {
                    $scope.cell.params.timeRangeType || ($scope.cell.params.timeRangeType = "TIME_INTERVAL");
                    $scope.cell.params.pointInTime || ($scope.cell.params.pointInTime = "START");
                    $scope.cell.params.format || ($scope.cell.params.format = "DD.MM");

                    $scope.$on("mainIntervalScannerIdChanged", function(e, data) {
                        $scope.cell.params.intervalScannerId = data;
                    });

                    $scope.$on("dataSeriesCellsChanged", function(e, data) {
                        if ($scope.cell.params.dataSeriesCell) {
                            if (!data.length || !data.filter(r => r.id == $scope.cell.params.dataSeriesCell).length)
                                $scope.cell.params.dataSeriesCell = null;
                        }
                    });
                },

                link: function (scope, element, attrs) {
                    var mode = attrs["mode"],
                        condensationShift = attrs["condensationShift"] ? Number(attrs["condensationShift"]) : 0;;

                    scope.cellValue = null;
                    function refreshCellValue() {
                        if (mode == "demo") {
                            scope.cellValue = scope.cell.params.pointInTime == "START" ? new Date(scope.interval.from) : new Date(scope.interval.to);
                        } else {
                            switch (scope.cell.params.timeRangeType) {
                                case "TIME_INTERVAL":
                                    scope.cellValue = scope.cell.params.pointInTime == "START" ? new Date(scope.interval.from) : new Date(scope.interval.to);
                                    break;
                                case "PHASE":
                                    if (scope.widget.phasesPromises[scope.cell.params.phaseId]) {
                                        scope.widget.phasesPromises[scope.cell.params.phaseId].then(data => {
                                            var arr = data.filter(d => d.startTime && d.endTime && new Date(d.startTime) >= new Date(scope.interval.from) && new Date(d.endTime) <= new Date(scope.interval.to));
                                            if (!arr || !arr.length) return;
                                            scope.cellValue = scope.cell.params.pointInTime == "START" ? new Date(arr[0].startTime) : new Date(arr[arr.length - 1].endTime);
                                        });
                                    }
                                    break;
                                case "ADVANCE":
                                    scope.widget.advancesPromise.then(data => {
                                        var arr = data.filter(d => d.startTime && d.endTime && new Date(d.startTime) >= new Date(scope.interval.from) && new Date(d.endTime) <= new Date(scope.interval.to));
                                        if (!arr || !arr.length) return;
                                        scope.cellValue = scope.cell.params.pointInTime == "START" ? new Date(arr[0].startTime) : new Date(arr[arr.length - 1].endTime);
                                    });
                                    break;
                                case "SHIFT_REPORT":
                                    scope.widget.shiftReportsPromise.then(data => {
                                        var arr = data.filter(d => d.protocol.startTime && d.protocol.endTime && new Date(d.protocol.startTime) >= new Date(scope.interval.from) && new Date(d.protocol.endTime) <= new Date(scope.interval.to));
                                        if (!arr || !arr.length) return;
                                        scope.cellValue = scope.cell.params.pointInTime == "START" ? new Date(arr[0].protocol.startTime) : new Date(arr[arr.length - 1].protocol.endTime);
                                    });
                                    break;
                            }
                        }
                    }

                    switch (mode) {
                        case "edit":
                            var template = "<div><i>{{'label.TimeRangeType' | translate}}:</i> {{cell.params.timeRangeType | IrisFilterField:[widget.timeRangeTypes]}}</div>";
                            template += "<div><i>{{'label.widget.time.type.date' | translate}}:</i> {{cell.params.pointInTime | IrisFilterField:[widget.pointsInTime]}}</div>";
                            element.html($compile(template)(scope));
                            break;
                        case "view":
                        case "demo":
                            if (scope.cell.params.timeRangeType == "DATASERIES") {
                                scope.dsCellRowIndex = $filter("IrisFilterField")(scope.cell.params.dataSeriesCell, [scope.widget.dataSeriesCells, "rowIndex"]);
                                scope.dsCellColumnIndex = $filter("IrisFilterField")(scope.cell.params.dataSeriesCell, [scope.widget.dataSeriesCells, "columnIndex"]);
                                var template = `<span>{{widget.settings.layout.rows[dsCellRowIndex].columns[dsCellColumnIndex].params.valueDates[${condensationShift}] | irisTime:this:cell.params.format}}</span>`;
                                element.html($compile(template)(scope));
                            } else {
                                refreshCellValue();
                                var template = "<span>{{cellValue | irisTime:this:cell.params.format}}</span>";
                                element.html($compile(template)(scope));
                            }
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

