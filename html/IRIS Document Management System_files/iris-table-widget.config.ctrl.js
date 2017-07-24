(function () {
    var module = angular.module('irisTableWidget');
    module.controller('TableWidgetConfigCtrl', function ($scope, $translate, $filter, $window, $timeout, $uibModal, DataSeriesService, IrisUnitsService, IrisTableWidgetService, WorkDaysConfigurationService, ShiftModelService, IntervalScannerService) {
        $scope.tabs = [{
            alias: 'Settings', // for form validation
            title: $translate.instant('label.Settings'),
            contentUrl: iris.config.widgetsUrl + '/iris-table-widget/templates/iris-table-widget.tabs.settings.html'
        },{
            title: $translate.instant('label.tableWidget.CellConfig'),
            contentUrl: iris.config.widgetsUrl + '/iris-table-widget/templates/iris-table-widget.tabs.cell-config.html'
        },{
            title: $translate.instant('label.tableWidget.CellFormat'),
            contentUrl: iris.config.widgetsUrl + '/iris-table-widget/templates/iris-table-widget.tabs.cell-format.html'
        }];

        $scope.fonts = [{name:"Arial"},{name:"Tahoma"},{name:"Helvetica"},{name:"Verdana"}];

        $scope.cellClipboard = null;

        $scope.cellTypes = IrisTableWidgetService.getCellTypes();
        $scope.textCellType = $scope.cellTypes.filter(t => t.id == "text")[0];
        $scope.tableTypes = IrisTableWidgetService.getTableTypes();
        $scope.condensationTypes = IrisTableWidgetService.getCondensationTypes();
        $scope.devices = iris.data.devices;
        $scope.widget.workDaysConfigurations = [];

        $scope.widget.timeRangeTypes = IrisTableWidgetService.getTimeRangeTypes();
        $scope.widget.pointsInTime = IrisTableWidgetService.getPointsInTime();
        $scope.widget.units = IrisUnitsService.getUnitsAsArray();
        $scope.widget.dataSeriesFunctions = IrisTableWidgetService.getDataSeriesFunctions();
        $scope.widget.shiftParameters = IrisTableWidgetService.getShiftParameters();
        $scope.widget.performanceFunctions = IrisTableWidgetService.getPerformanceFunctions();
        $scope.widget.performanceTypes = IrisTableWidgetService.getPerformanceTypes();
        $scope.widget.performancePeriods = IrisTableWidgetService.getPerformancePeriods();
        $scope.widget.intervalScanners = [];
        $scope.widget.phases = [];
        $scope.widget.dataSeriesCells = [];

        $scope.formatInfoVisible = false;

        var minRowCount = 1,
            minColumnCount = 1;

        function refreshWorkDaysConfigurations(projectId, autoSetDefault) {
            if (projectId) {
                WorkDaysConfigurationService.getWorkDaysConfigurations(projectId).then(res => {
                    $scope.widget.workDaysConfigurations = res;
                    if (autoSetDefault) {
                        var defaultConf = $scope.widget.workDaysConfigurations.filter(t => t.isDefault);
                        defaultConf.length && ($scope.widget.settings.workDaysConfigurationId = defaultConf[0].id);
                    }
                })
            } else {
                $scope.widget.workDaysConfigurations = [];
            }
        }
        refreshWorkDaysConfigurations($scope.widget.projectId);

        function refreshShiftBundles(projectId, autoSelect) {
            if (projectId) {
                ShiftModelService.findAllBundlesByProject(projectId).then(res => {
                    $scope.widget.shiftBundles = res;
                    if (autoSelect && res.length) $scope.widget.settings.shiftBundleId = $scope.widget.shiftBundles[0].id;
                });
                ShiftModelService.findAllByProject(projectId).then((res) => {
                    $scope.widget.projectShiftModels = res;
                });
            } else {
                $scope.widget.shiftBundles = [];
                $scope.widget.projectShiftModels = [];
                $scope.widget.settings.shiftBundleId = null;
            }
        }
        refreshShiftBundles($scope.widget.projectId);

        function refreshShiftModels(shiftBundleId, autoSelect) {
            if (shiftBundleId) {
                ShiftModelService.findAllByBundleId(shiftBundleId).then(res => {
                    $scope.shiftModels = res;
                    if (autoSelect) $scope.widget.settings.shiftModels = res.map(t => t.id);
                })
            } else {
                $scope.shiftModels = [];
                $scope.widget.settings.shiftModels = null;
            }
        }
        refreshShiftModels($scope.widget.settings.shiftBundleId);

        function refreshIntervalScanners(deviceId) {
            if (deviceId) {
                IntervalScannerService.getScanners(deviceId).then(res => {
                    $scope.widget.intervalScanners = res.filter(s => !!s.mainNamedIntervalScanner);
                    if ($scope.widget.intervalScanners.length) {
                        var mainIntervalScannerId = $scope.widget.intervalScanners[0].id;
                        $scope.$broadcast('mainIntervalScannerIdChanged', mainIntervalScannerId);
                        IntervalScannerService.getScannerIntervalPhases(mainIntervalScannerId, deviceId).then(intervalPhases => {
                            $scope.widget.phases = intervalPhases.map(phase => {
                                    return {
                                        id: phase,
                                        name: phase
                                    }
                                }
                            );
                        });
                    } else {
                        $scope.$broadcast('mainIntervalScannerIdChanged', null);
                        $scope.widget.phases = [];
                    }
                })
            } else {
                $scope.$broadcast('mainIntervalScannerIdChanged', null);
                $scope.widget.intervalScanners = [];
                $scope.widget.phases = [];
            }
        }
        refreshIntervalScanners($scope.widget.deviceId);

        function refreshDataSeriesCells() {
            var res = [];
            $scope.widget.settings.layout.rows.forEach(row => {
                row.columns.forEach(cell => {
                    if (cell.type && cell.type.id == "dataSeries" && (cell.params.function == "MIN" || cell.params.function == "MAX" || cell.params.function == "START" || cell.params.function == "END")) {
                        var link = $filter("irisColumnAddress")(cell.index + 1) + (row.index + 1);
                        res.push({id: link, name: link, cell: cell, rowIndex: row.index, columnIndex: cell.index});
                    }
                })
            });
            $scope.$broadcast('dataSeriesCellsChanged', res);
            $scope.widget.dataSeriesCells = res;
        }
        refreshDataSeriesCells();

        $scope.$watch("widget.settings.layout", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            refreshDataSeriesCells();
        }, true);

        $scope.$watch("widget.projectId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            refreshShiftBundles(nv, true);
            refreshWorkDaysConfigurations(nv, true);
        });

        $scope.$watch("widget.deviceId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            refreshIntervalScanners(nv);
        });

        $scope.$watch("widget.settings.shiftBundleId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            refreshShiftModels(nv, true);
        });

        $scope.openSelectDSModal = function(tunnelmeterSelect) {
            if ($scope.widget.activeCell.cell.params.dataSeries && $scope.widget.activeCell.cell.params.dataSeries.id) {
                $scope.widget.activeCell.cell.params.dataSeries = null;
                if (!tunnelmeterSelect) processDataSeries($scope.widget.activeCell);
                return;
            }

            return DataSeriesService.openSelectDSListModal({
                'params': () => {
                    return {
                        project_id: $scope.widget.projectId,
                        device_id: $scope.widget.deviceId,
                        is_project_device_fixed: false,
                        is_multiple: false,
                        autoSelectTunnelmeter: !!tunnelmeterSelect,
                        result: []
                    }
                }
            }).then(function (ds) {
                $scope.widget.activeCell.cell.params.dataSeries = ds;
                if (!tunnelmeterSelect) processDataSeries($scope.widget.activeCell);
            });
        };

        function processDataSeries(activeCell) {
            activeCell.cell.params.dataSeriesName = activeCell.cell.params.dataSeries ? activeCell.cell.params.dataSeries.name : null;
            activeCell.cell.params.dataSeriesNameTranslations = {};
            activeCell.cell.params.dataSeriesUnit = activeCell.cell.params.dataSeries ? activeCell.cell.params.dataSeries.irisUnit : null;
            activeCell.cell.params.dataSeriesAllowedUnits = activeCell.cell.params.dataSeriesUnit
                ? IrisUnitsService.getPossibleConvertsForUnit(activeCell.cell.params.dataSeriesUnit)
                : $scope.widget.units;
            activeCell.cell.params.decimals = activeCell.cell.params.dataSeries ? activeCell.cell.params.dataSeries.digits : 0;

            $scope.refreshDataSeriesName(activeCell);
            $scope.refreshDataSeriesUnit(activeCell);
        }

        $scope.refreshDataSeriesName = function(activeCell) {
            $timeout(() => {
                refreshDataSeriesSibling(activeCell, "nameAlign", "showName", activeCell.cell.params.dataSeriesName, activeCell.cell.params.dataSeriesNameTranslations);
            });
        };

        $scope.refreshDataSeriesUnit = function(activeCell) {
            refreshDataSeriesSibling(activeCell, "unitAlign", "showUnit", $filter("irisUnits")(activeCell.cell.params.dataSeriesUnit), {});
        };

        function refreshDataSeriesSibling(activeCell, alignField, showField, siblingText, siblingTranslations) {
            var cellParams = activeCell.cell.params,
                targetCell = getSiblingCell(activeCell, cellParams[alignField]);

            if (!cellParams[showField]) {
                if (cellParams[alignField] && targetCell) {
                    targetCell.type = null;
                    targetCell.params = {};
                }
                cellParams[alignField] = null;
            }
            if (!cellParams[alignField] || !targetCell) return;

            targetCell.type = $scope.textCellType;
            targetCell.params = {
                managedText: siblingText,
                managedTextTranslations: siblingTranslations
            };
        };

        $scope.setDataSeriesNameAlign = function(activeCell, align) {
            setSiblingDataAlign(activeCell, "nameAlign", "refreshDataSeriesName", align);
        };

        $scope.setDataSeriesUnitAlign = function(activeCell, align) {
            setSiblingDataAlign(activeCell, "unitAlign", "refreshDataSeriesUnit", align);
        };

        function setSiblingDataAlign(activeCell, alignField, refreshFunction, align) {
            var targetCell = getSiblingCell(activeCell, align);

            if (targetCell && targetCell.type) {
                alertify.alert($translate.instant('text.tableWidget.LostCellDataError'));
            } else {
                setSiblingDataAlignCore(activeCell, alignField, refreshFunction, align);
            }
        };

        function setSiblingDataAlignCore(activeCell, alignField, refreshFunction, align) {
            var cellParams = activeCell.cell.params;

            if (cellParams[alignField] && cellParams[alignField] != align) {
                var oldTargetCell = getSiblingCell(activeCell, cellParams[alignField]);
                if (oldTargetCell) {
                    oldTargetCell.type = null;
                    oldTargetCell.params = {};
                }
            }

            cellParams[alignField] = align;
            $scope[refreshFunction](activeCell);
        };

        function getSiblingCell (cell, align) {
            switch (align) {
                case "top":
                    return (cell.row > 0) ? $scope.widget.settings.layout.rows[cell.row - 1].columns[cell.col] : null;
                case "bottom":
                    return (cell.row < $scope.widget.settings.layout.rows.length - 1) ? $scope.widget.settings.layout.rows[cell.row + 1].columns[cell.col] : null;
                case "left":
                    return (cell.col > 0) ? $scope.widget.settings.layout.rows[cell.row].columns[cell.col - 1] : null;
                case "right":
                    return (cell.col < $scope.widget.settings.metaRow.columns.length - 1) ? $scope.widget.settings.layout.rows[cell.row].columns[cell.col + 1] : null;
            }
            return null;
        };

        $scope.getCell = function(rowIndex, colIndex) {
            return $scope.widget.settings.layout.rows[rowIndex].columns[colIndex];
        };

        $scope.getCellFormatting = function(cell) {
            return IrisTableWidgetService.getCellFormatting(cell);
        };

        function setActiveCell(row, col, cell) {
            $scope.widget.activeCell = { row, col, cell };
        }

        $scope.toggleActiveCell = function(rowIndex, colIndex) {
            if ($window.event && $window.event.defaultPrevented) return;

            if ($scope.widget.activeCell && $scope.widget.activeCell.row == rowIndex && $scope.widget.activeCell.col == colIndex) {
                //$scope.widget.activeCell = null;
            } else {
                setActiveCell(rowIndex, colIndex, $scope.getCell(rowIndex, colIndex));
            }
        };

        $scope.setCellType = function(rowIndex, colIndex, cellType) {
            var cell = $scope.getCell(rowIndex, colIndex);
            cell.type = cellType;
            cell.params = {};
            setActiveCell(rowIndex, colIndex, cell);
        };

        $scope.copyCell = function(cell) {
            $scope.cellClipboard = {
                format: angular.copy(cell.format),
                type: angular.copy(cell.type),
                params: angular.copy(cell.params)
            };
        };

        $scope.pasteCell = function(cell) {
            cell.format = $scope.cellClipboard.format;
            cell.type = $scope.cellClipboard.type;
            cell.params = $scope.cellClipboard.params;
            $scope.cellClipboard = null;
        };

        $scope.getMaxColumns = function() {
            var max = 0;
            for (var i in $scope.widget.settings.layout.rows) {
                max = Math.max(max, $scope.widget.settings.layout.rows[i].columns.length);
            }
            return max;
        };

        $scope.addWidgetRow = function() {
            var row = {columns: []};
            for (var i = 0; i < $scope.getMaxColumns(); i++) {
                row.columns.push(IrisTableWidgetService.getEmptyCell());
            }
            $scope.widget.settings.layout.rows.push(row);
        };

        $scope.removeWidgetRow = function (i) {
            if ($scope.widget.settings.layout.rows.length <= minRowCount) return;
            $scope.widget.settings.layout.rows.splice(i, 1);
        };

        $scope.addWidgetColumn = function (row) {
            for (var i in $scope.widget.settings.layout.rows) {
                $scope.widget.settings.layout.rows[i].columns.push(IrisTableWidgetService.getEmptyCell())
            }
            $scope.updateMetaRow();
        };

        $scope.removeWidgetColumn = function () {
            if ($scope.getMaxColumns() <= minColumnCount) return;
            for (var i in $scope.widget.settings.layout.rows) {
                $scope.widget.settings.layout.rows[i].columns.splice(-1, 1);
            }
            $scope.updateMetaRow();
        };

        $scope.updateMetaRow = function () {
            var colCount = $scope.getMaxColumns();
            if (colCount === $scope.widget.settings.metaRow.columnSizes.length) return;

            var avgColWidth = 100 / colCount;
            var k = (100 - avgColWidth) / 100;

            if (colCount > $scope.widget.settings.metaRow.columnSizes.length) {
                for (var i = 0; i < $scope.widget.settings.metaRow.columnSizes.length; i++) {
                    $scope.widget.settings.metaRow.columnSizes[i] *= k;
                }
                $scope.widget.settings.metaRow.columnSizes.push(avgColWidth);
                $scope.widget.settings.metaRow.columns.push({index: $scope.widget.settings.metaRow.columns.length, name: $filter("irisColumnAddress")($scope.widget.settings.metaRow.columns.length + 1)});
            } else {
                for (var i = 0; i < $scope.widget.settings.metaRow.columnSizes.length; i++) {
                    $scope.widget.settings.metaRow.columnSizes[i] = k == 0 ? 100 : $scope.widget.settings.metaRow.columnSizes[i] * (1 + k);
                }
                $scope.widget.settings.metaRow.columnSizes.splice(-1, 1);
                $scope.widget.settings.metaRow.columns.splice(-1, 1);
            }
        };

        $scope.clearTextFormatting = function() {
            angular.extend($scope.widget.activeCell.cell.format, IrisTableWidgetService.getDefaultTextFormat());
        };

        $scope.clearCellFormatting = function() {
            angular.extend($scope.widget.activeCell.cell.format, IrisTableWidgetService.getDefaultCellFormat());
        };

        $scope.tableTypeChanged = function() {
            if ($scope.widget.settings.tableType == "RIGHT") $scope.widget.settings.valueColumn = $scope.widget.settings.metaRow.columns.length - 1;
            if ($scope.widget.settings.tableType == "BOTTOM") $scope.widget.settings.valueRow = $scope.widget.settings.layout.rows.length - 1;
        };

        $scope.getDate = function() {
            $scope.formatInfoExample = new Date();
            $scope.formatInfoExampleTry = $scope.widget.activeCell.cell.params.format;
        };

        $scope.placeholders = [{
            alias: "project.name",
            description: "text.tableWidget.ProjectName"
        }, {
            alias: "device.name",
            description: "text.tableWidget.DeviceName"
        }, {
            alias: "widget.name",
            description: "text.tableWidget.WidgetName"
        }, {
            alias: "period.date_start | irisTime:this",
            description: "text.tableWidget.PeriodStart"
        }, {
            alias: "period.date_end | irisTime:this",
            description: "text.tableWidget.PeriodEnd"
        }, {
            alias: "period.date_start | irisTime:this:'DD.MM.YYYY'",
            description: "text.tableWidget.PeriodStartWithFormat"
        }, {
            alias: "period.date_end | irisTime:this:'DD.MM.YYYY'",
            description: "text.tableWidget.PeriodEndWithFormat"
        }];

        $scope.openTextPlaceholdersModal = function () {
            $uibModal.open({
                templateUrl: iris.config.widgetsUrl + '/iris-table-widget/templates/iris-table-widget.managedTextPlaceholders.modal.html',
                scope: $scope
            });
        };

        $scope.addTextPlaceholder = function (alias) {
            $scope.widget.activeCell.cell.params.managedText || ($scope.widget.activeCell.cell.params.managedText = "");
            $scope.widget.activeCell.cell.params.managedText += ` {{${alias}}}`;
        };
    });
})();