(function () {
    angular.module('irisTableWidget').directive('irisTableWidget',
        function ($q, $filter, $compile, IrisTableWidgetService, DeviceDataService, DataSeriesService, ProjectsService, DevicesService, ShiftProtocolService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-table-widget/templates/iris-table-widget.view.html',

                controller: function ($scope) {
                    $scope.condensationIntervals = [];
                    $scope.widgetsUrl = iris.config.widgetsUrl;

                    var periodInterval = null;
                    $scope.getPeriodInterval = () => { return periodInterval || (periodInterval = { from: $scope.params.period.date_start, to: $scope.params.period.date_end }); };

                    $scope.getValueColumnIndex = () => Number($scope.widget.settings.valueColumn);
                    $scope.getValueRowIndex = () => Number($scope.widget.settings.valueRow);

                    $scope.rowsBeforeFilling = () => $scope.widget.settings.layout.rows.slice(0, $scope.getValueRowIndex());
                    $scope.getValueRow = () => $scope.widget.settings.layout.rows[$scope.getValueRowIndex()];
                    $scope.rowsAfterFilling = () => $scope.widget.settings.layout.rows.slice($scope.getValueRowIndex() + 1);
                    $scope.columnsBeforeFilling = (row) => row.columns.slice(0, $scope.getValueColumnIndex());
                    $scope.getValueColumn = (row) => row.columns[$scope.getValueColumnIndex()];
                    $scope.columnsAfterFilling = (row) => row.columns.slice($scope.getValueColumnIndex() + 1);

                    $scope.getCellFormatting = function(cell) {
                        return IrisTableWidgetService.getCellFormatting(cell);
                    };
                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};
                    scope.params = angular.extend({}, scope.params, IrisTableWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    scope.widget.projects = ProjectsService.getPreloadedProjects();
                    scope.widget.devices = DevicesService.getDevices();

                    function refreshDataSeriesCells() {
                        var res = [];
                        scope.widget.settings.layout.rows.forEach(row => {
                            row.columns.forEach(cell => {
                                if (cell.type && cell.type.id == "dataSeries" && (cell.params.function == "MIN" || cell.params.function == "MAX" || cell.params.function == "START" || cell.params.function == "END")) {
                                    var link = $filter("irisColumnAddress")(cell.index + 1) + (row.index + 1);
                                    res.push({id: link, name: link, cell: cell, rowIndex: row.index, columnIndex: cell.index});
                                }
                            })
                        });
                        scope.widget.dataSeriesCells = res;
                    }
                    refreshDataSeriesCells();

                    if (scope.params.demo) {
                        scope.params.period = {
                            date_start: new Date(2016, 0, 1, 12),
                            date_end: new Date(2016, 0, 10, 12)
                        };
                    } else {
                        var advanceCells = [];
                        scope.widget.settings.layout.rows.forEach(row => {
                            row.columns.forEach(cell => {
                                if (cell.type && cell.type.id == "date" && cell.params && cell.params.timeRangeType == "ADVANCE") {
                                    advanceCells.push(cell);
                                } else if (cell.type && cell.type.id == "performance" && cell.params && cell.params.type == "ADVANCE") {
                                    advanceCells.push(cell);
                                }
                            });
                        });

                        if (advanceCells.length) {
                            scope.widget.advancesPromise = DeviceDataService.getAdvances({
                                project_id: scope.widget.projectId,
                                device_id: scope.widget.deviceId,
                                from: scope.params.period.date_start,
                                to: scope.params.period.date_end
                            }).then(data => {
                                data.sort((a, b) => (new Date(a.startTime) < new Date(b.startTime) ? -1 : 1));
                                return data;
                            });
                        }

                        var phaseCells = [];
                        scope.widget.settings.layout.rows.forEach(row => {
                            row.columns.forEach(cell => {
                                if (cell.type && cell.type.id == "date" && cell.params && cell.params.timeRangeType == "PHASE") {
                                    phaseCells.push(cell);
                                }
                            });
                        });

                        scope.widget.phasesPromises = {};
                        if (phaseCells.length) {
                            phaseCells.forEach(cell => {
                                if (!cell.params.intervalScannerId || !cell.params.phaseId || scope.widget.phasesPromises[cell.params.phaseId]) return;
                                scope.widget.phasesPromises[cell.params.phaseId] = DeviceDataService.getPhases({
                                    device_id: scope.widget.deviceId,
                                    scanner_id: cell.params.intervalScannerId,
                                    phase: cell.params.phaseId,
                                    from: scope.params.period.date_start,
                                    to: scope.params.period.date_end
                                });
                            });
                        }

                        var shiftReportCells = [];
                        scope.widget.settings.layout.rows.forEach(row => {
                            row.columns.forEach(cell => {
                                if (cell.type && cell.type.id == "date" && cell.params && cell.params.timeRangeType == "SHIFT_REPORT") {
                                    shiftReportCells.push(cell);
                                } else if (cell.type && cell.type.id == "shiftInformation") {
                                    shiftReportCells.push(cell);
                                }
                            });
                        });

                        if (shiftReportCells.length) {
                            scope.widget.shiftReportsPromise = ShiftProtocolService.getAllForProject(scope.widget.projectId).then(data => {
                                data.sort((a, b) => (new Date(a.protocol.startTime) < new Date(b.protocol.startTime) ? -1 : 1));
                                return data;
                            });
                        }

                        var dataSeriesIds = [];
                        scope.widget.settings.layout.rows.forEach(row => {
                            row.columns.forEach(cell => {
                                if (cell.type && cell.type.id == "dataSeries" && cell.params && cell.params.dataSeries && cell.params.function != "CURRENT") {
                                    dataSeriesIds.push({id: cell.params.dataSeries.id});
                                } else if (cell.type && cell.type.id == "performance" && cell.params && cell.params.type == "TUNNELMETER" && cell.params.dataSeries) {
                                    dataSeriesIds.push({id: cell.params.dataSeries.id});
                                }
                            });
                        });

                        if (dataSeriesIds.length) {
                            scope.widget.dataSeriesPromise = DataSeriesService.getValues({
                                dataseries: angular.toJson(dataSeriesIds),
                                'date-start': scope.params.period.date_start,
                                'date-end': scope.params.period.date_end,
                                'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}])
                            });
                        }

                        var dataSeriesCurrentIds = [];
                        scope.widget.settings.layout.rows.forEach(row => {
                            row.columns.forEach(cell => {
                                if (cell.type && cell.type.id == "dataSeries" && cell.params && cell.params.dataSeries && cell.params.function == "CURRENT") {
                                    dataSeriesCurrentIds.push({id: cell.params.dataSeries.id});
                                }
                            });
                        });

                        if (dataSeriesCurrentIds.length) {
                            scope.widget.dataSeriesCurrentPromise = DataSeriesService.getValues({
                                dataseries: angular.toJson(dataSeriesCurrentIds),
                                'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}])
                            });
                        }
                    }

                    if (scope.params.tableType != "STANDARD") {
                        IrisTableWidgetService.getCondensationIntervals(scope.params, scope.params.period.date_start, scope.params.period.date_end, scope.widget.projectId, scope.widget.deviceId).then(res => {
                            scope.condensationIntervals = res;
                        });
                    }
                }
            };
        });
})();

