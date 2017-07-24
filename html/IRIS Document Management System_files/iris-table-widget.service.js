(function () {
    angular.module('irisTableWidget').factory('IrisTableWidgetService',
        function ($http, $translate, $state, ReportsService, ProjectsService) {
            function getEmptyCell() {
                var format = angular.extend({}, getDefaultTextFormat(), getDefaultCellFormat());
                return {
                    format
                };
            }

            function getDefaultTextFormat() {
                return {
                    fontFamily: "Arial",
                    fontSize: 12,
                    fontColor: "#424242",
                    bold: false,
                    italic: false,
                    underline: false
                };
            }

            function getDefaultCellFormat() {
                return {
                    backgroundColor: null,
                    align: "left",
                    verticalAlign: "top"
                };
            }

            function getCellTypes() {
                return [
                    {
                        id: "dataSeries",
                        directive: "iris-table-widget-cell-data-series",
                        shortLabel: $translate.instant("label.DataSeries"),
                        label: $translate.instant("label.Add") + " " + $translate.instant("label.DataSeries"),
                        icon: "fa-dot-circle-o"
                    }, {
                        id: "date",
                        directive: "iris-table-widget-cell-date",
                        shortLabel: $translate.instant("label.Data"),
                        label: $translate.instant("label.Add") + " " + $translate.instant("label.Data"),
                        icon: "fa-calendar"
                    }, {
                        id: "performance",
                        directive: "iris-table-widget-cell-performance",
                        shortLabel: $translate.instant("label.Performance"),
                        label: $translate.instant("label.Add") + " " + $translate.instant("label.Performance"),
                        icon: "fa-line-chart"
                    }, {
                        id: "shiftInformation",
                        directive: "iris-table-widget-cell-shift-information",
                        shortLabel: $translate.instant("label.ShiftInformation"),
                        label: $translate.instant("label.Add") + " " + $translate.instant("label.ShiftInformation"),
                        icon: "fa-table"
                    }, {
                        id: "text",
                        directive: "iris-table-widget-cell-text",
                        shortLabel: $translate.instant("label.Text"),
                        label: $translate.instant("label.Add") + " " + $translate.instant("label.Text"),
                        icon: "fa-globe"
                    }
                ];
            }

            function getTableTypes() {
                return [
                    {id: "STANDARD", name: $translate.instant("label.tableWidget.StandardTable")},
                    {id: "RIGHT", name: $translate.instant("label.tableWidget.RightFillingTable")},
                    {id: "BOTTOM", name: $translate.instant("label.tableWidget.BottomFillingTable")}
                ];
            }

            function getCondensationTypes() {
                return [
                    {id: "ADVANCE", name: $translate.instant("label.Advance")},
                    {id: "DAY", name: $translate.instant("label.Day")},
                    {id: "WEEK", name: $translate.instant("label.Week")},
                    {id: "SHIFT_REPORT", name: $translate.instant("label.ShiftReport")}
                ];
            }

            function getDataSeriesFunctions() {
                return [
                    {id: "CURRENT", name: $translate.instant("label.Current")},
                    {id: "START", name: $translate.instant("label.Start")},
                    {id: "END", name: $translate.instant("label.End")},
                    {id: "MIN", name: $translate.instant("label.Min")},
                    {id: "MAX", name: $translate.instant("label.Max")},
                    {id: "AVERAGE", name: $translate.instant("label.Average")},
                    {id: "MEDIAN", name: $translate.instant("label.Median")},
                    {id: "SUM", name: $translate.instant("label.Sum")},
                    {id: "DIFFERENCE", name: $translate.instant("label.Difference")}
                ];
            }

            function getPerformanceFunctions() {
                return [
                    {id: "AVERAGE", name: $translate.instant("label.Average")},
                    {id: "START", name: $translate.instant("label.Start")},
                    {id: "END", name: $translate.instant("label.End")},
                    {id: "MIN", name: $translate.instant("label.Min")},
                    {id: "MAX", name: $translate.instant("label.Max")}
                ];
            }

            function getPerformanceTypes() {
                return [
                    {id: 'TUNNELMETER', name: $translate.instant("label.Tunnelmeter")},
                    {id: 'ADVANCE', name: $translate.instant("label.Advance")}
                ];
            }

            function getPerformancePeriods() {
                return [
                    {id: 'DAY', name: $translate.instant("label.Day")},
                    {id: 'WEEK', name: $translate.instant("label.Week")},
                    {id: 'MONTH', name: $translate.instant("label.Month")}
                ];
            }

            function getTimeRangeTypes() {
                return [
                    {id: "TIME_INTERVAL", name: $translate.instant("label.TimeInterval")},
                    {id: "PHASE", name: $translate.instant("label.Phase")},
                    {id: "ADVANCE", name: $translate.instant("label.Advance")},
                    {id: "SHIFT_REPORT", name: $translate.instant("label.ShiftReport")},
                    {id: "DATASERIES", name: $translate.instant("label.DataSeries")}
                ];
            }

            function getPointsInTime() {
                return [
                    {id: "START", name: $translate.instant("label.Start")},
                    {id: "END", name: $translate.instant("label.End")}
                ];
            }

            function getShiftParameters() {
                return [
                    {id: "shift.name", name: "Shift {{shift.name}}"},
                    {id: "name", name: "Report No. {{name}}"},
                    {id: "period", name: "Shift period {{period}}"},
                    {id: "lastModified", name: "Last change {{lastModified}}"},
                    {id: "lastDataImport", name: "Last data import {{lastDataImport}}"},
                    {id: "advance.chainage.start", name: "Start chainage {{advance.chainage.start}}"},
                    {id: "advance.chainage.end", name: "End Chainage {{advance.chainage.end}}"},
                    {id: "advance.tunnelmeter.start", name: "Start tunnelmeter {{advance.tunnelmeter.start}}"},
                    {id: "advance.tunnelmeter.end", name: "End tunnelmeter {{advance.tunnelmeter.end}}"},
                    {id: "advance.interval.start", name: "Start interval {{advance.interval.start}}"},
                    {id: "advance.interval.end", name: "End interval {{advance.interval.end}}"},
                    {id: "job3", name: "Foreman {{job3}}"},
                    {id: "job2", name: "Shift Engineer {{job2}}"},
                    {id: "job1", name: "TBM Driver {{job1}}"}
                ];
            }

            function getCellFormatting(cell) {
                if (!cell || !cell.format) return "";
                var res = "";
                if (cell.format.bold) res += "font-weight: bold; ";
                if (cell.format.italic) res += "font-style: italic; ";
                if (cell.format.underline) res += "text-decoration: underline; ";
                if (cell.format.fontFamily) res += "font-family: " + cell.format.fontFamily + "; ";
                if (cell.format.fontSize) res += "font-size: " + cell.format.fontSize + "px; ";
                if (cell.format.fontColor) res += "color: " + cell.format.fontColor + "; ";
                if (cell.format.backgroundColor) res += "background-color: " + cell.format.backgroundColor + "; ";
                if (cell.format.align) res += "text-align: " + cell.format.align + "; ";
                if (cell.format.verticalAlign) res += "vertical-align: " + cell.format.verticalAlign + "; ";
                return res;
            }

            var defaultSettings = {
                layout: { rows: [{ columns: [getEmptyCell()] }] },
                metaRow: { columnSizes: [100], columns: [{ index: 0, name: 'A' }] },
                tableType: "STANDARD",
                condensationType: "DAY",
                valueColumn: 0,
                valueRow: 0
            };

            return {
                getEmptyCell,
                getCellTypes,
                getTableTypes,
                getCondensationTypes,
                getCellFormatting,
                getDefaultTextFormat,
                getDefaultCellFormat,
                getDataSeriesFunctions,
                getPerformanceFunctions,
                getPerformanceTypes,
                getPerformancePeriods,
                getTimeRangeTypes,
                getPointsInTime,
                getShiftParameters,

                getDefaultSettings: function () {
                    return defaultSettings;
                },

                getCondensationIntervals: function(settings, periodStart, periodEnd, projectId, deviceId) {
                    return ReportsService.evaluateCondensations({
                        condensation: {
                            condensationType: settings.condensationType,
                            shiftModelsIds: settings.shiftModels,
                            projectDeviceId: ProjectsService.getProjectDevice(projectId, deviceId).id,
                            projectId: projectId,
                            deviceId: deviceId
                        },
                        workDaysConfigurationId: settings.workDaysConfigurationId,
                        startDate: periodStart,
                        endDate: periodEnd,
                        startPartial: "PARTIAL",
                        endPartial: "PARTIAL"
                    });
                },

                postSave: function() {
                    $state.reload();
                }
            };
        });

})();

