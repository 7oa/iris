(function () {
    angular.module('irisTableWidget').directive('irisTableWidgetCellDataSeries',
        function ($q, $filter, $compile, $translate, DataSeriesService) {
            return {
                restrict: 'EA',
                scope: {
                    widget: '=',
                    cell: '=',
                    interval: '='
                },
                template: '',

                controller: function ($scope) {
                    $scope.cell.params.function || ($scope.cell.params.function = "CURRENT");
                    $scope.cell.params.decimals || ($scope.cell.params.decimals = 0);
                },

                link: function (scope, element, attrs) {
                    var mode = attrs["mode"],
                        condensationShift = attrs["condensationShift"] ? Number(attrs["condensationShift"]) : 0;

                    scope.cellValue = null;
                    scope.cell.params.valueDates = scope.cell.params.valueDates || [];
                    function refreshCellValue() {
                        if (mode == "demo") {
                            scope.cellValue = Math.random() * 100;
                            scope.cell.params.valueDates[condensationShift] = new Date();
                        } else {
                            if (scope.cell.params.function == "CURRENT") {
                                scope.widget.dataSeriesCurrentPromise.then(res => {
                                    var data = res ? (res[scope.cell.params.dataSeries.id] || []) : [];
                                    if (!data.length) return;

                                    scope.cellValue = data[0].value;
                                    scope.cell.params.valueDates[condensationShift] = new Date(data[0].date);
                                });
                            } else {
                                scope.widget.dataSeriesPromise.then(res => {
                                    var data = res ? (res[scope.cell.params.dataSeries.id] || []) : [];
                                    data = data.filter(d => d.date && new Date(d.date) >= new Date(scope.interval.from) && new Date(d.date) <= new Date(scope.interval.to));
                                    if (!data.length) return;

                                    var dataValues = data.map(d => d.value);
                                    switch (scope.cell.params.function) {
                                        case "START":
                                            var dataItem = data[0];
                                            scope.cellValue = dataItem.value;
                                            scope.cell.params.valueDates[condensationShift] = new Date(dataItem.date);
                                            break;
                                        case "END":
                                            var dataItem = data[data.length - 1];
                                            scope.cellValue = dataItem.value;
                                            scope.cell.params.valueDates[condensationShift] = new Date(dataItem.date);
                                            break;
                                        case "MIN":
                                            var minVal = Math.min.apply(Math, dataValues);
                                            var dataItems = data.filter(d => d.value == minVal);
                                            scope.cellValue = Math.min(dataItems[0].value);
                                            scope.cell.params.valueDates[condensationShift] = new Date(dataItems[0].date);
                                            break;
                                        case "MAX":
                                            var maxVal = Math.max.apply(Math, dataValues);
                                            var dataItems = data.filter(d => d.value == maxVal);
                                            scope.cellValue = Math.max(dataItems[0].value);
                                            scope.cell.params.valueDates[condensationShift] = new Date(dataItems[0].date);
                                            break;
                                        case "AVERAGE":
                                            var sum = 0;
                                            dataValues.forEach(v => sum += v);
                                            scope.cellValue = sum / dataValues.length;
                                            break;
                                        case "MEDIAN":
                                            var sortedValues = dataValues.sort((a, b) => a - b),
                                                lowMedian = sortedValues[Math.floor((sortedValues.length - 1) / 2)],
                                                hiMedian = sortedValues[Math.ceil((sortedValues.length - 1) / 2)];
                                            scope.cellValue = (lowMedian + hiMedian) / 2;
                                            break;
                                        case "SUM":
                                            var sum = 0;
                                            dataValues.forEach(v => sum += v);
                                            scope.cellValue = sum;
                                            break;
                                        case "DIFFERENCE":
                                            scope.cellValue = dataValues[dataValues.length - 1] - dataValues[0];
                                            break;
                                    }
                                });
                            }
                        }
                    }

                    switch (mode) {
                        case "edit":
                            var template = "<div><i>{{'label.DataSeries' | translate}}:</i> {{cell.params.dataSeries.name}}</div>";
                            template += "<div><i>{{'label.Function' | translate}}:</i> {{cell.params.function | IrisFilterField:[widget.dataSeriesFunctions]}}</div>";
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

