(function () {
    angular.module('irisShiftBarChartWidget').directive('irisShiftBarChartWidget',
        function ($q, $filter, IrisShiftBarChartWidgetService, IrisTunnelmeterPerformanceWidgetService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-shift-bar-chart-widget/templates/iris-shift-bar-chart-widget.view.html',

                controller: function ($scope) {

                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};
                    scope.params = angular.extend({}, scope.params, IrisShiftBarChartWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    function redrawChart(settings, dataIntervals, rawData) {
                        Highcharts.chart("shiftBarChart", IrisShiftBarChartWidgetService.getChartConfiguration(settings, dataIntervals, rawData));
                    }

                    function refreshWidgetData() {
                        var q = new $q.defer(),
                            period = scope.params.demo ? { date_start: new Date(), date_end: new Date() } : scope.params.period,
                            shiftDataPromises = [];
                        if (scope.params.demo) {
                            period.date_start.setDate(1);
                            period.date_end.setDate(45);
                        }

                        scope.widgetData = {
                            shiftData: [],
                            tunnelmeterData: []
                        };

                        IrisShiftBarChartWidgetService.getDataIntervals(scope.params, period.date_start, period.date_end, scope.widget.projectId).then(res => {
                            scope.widgetDataIntervals = res.map(r => { return { from: new Date(r.from), to: new Date(r.to) }; });

                            for (let i = 0; i < scope.widgetDataIntervals.length; i++) {
                                shiftDataPromises[i] = scope.params.demo
                                    ? IrisShiftBarChartWidgetService.getDemoShiftData()
                                    : IrisShiftBarChartWidgetService.getShiftData(scope.params, scope.widgetDataIntervals[i].from, scope.widgetDataIntervals[i].to, scope.widget.projectId, scope.widget.deviceId);

                                shiftDataPromises[i].then(res => {
                                    scope.widgetData.shiftData[i] = res;
                                })
                            }

                            $q.all(shiftDataPromises).then(() => {
                                if (scope.params.dataSeries && scope.params.dataSeries.id) {
                                    var tunnelmeterDataPromise = scope.params.demo
                                        ? IrisShiftBarChartWidgetService.getDemoTunnelmeterData(scope.params.dataSeries.id, scope.widgetDataIntervals[0].from, scope.widgetDataIntervals[scope.widgetDataIntervals.length - 1].to)
                                        : IrisTunnelmeterPerformanceWidgetService.getData(scope.params.dataSeries.id, scope.widgetDataIntervals[0].from, scope.widgetDataIntervals[scope.widgetDataIntervals.length - 1].to);

                                    tunnelmeterDataPromise.then(data => {
                                        scope.widgetData.tunnelmeterData = data ? (data[scope.params.dataSeries.id] || []) : [];
                                        q.resolve();
                                    });
                                } else {
                                    q.resolve();
                                }
                            });
                        });

                        return q.promise;
                    };

                    function refreshWidget() {
                        refreshWidgetData().then(() => {
                            redrawChart(scope.params, scope.widgetDataIntervals, scope.widgetData);
                        });
                    }
                    refreshWidget();

                    scope.$watch('params', function (nv, ov) {
                        if (!nv || angular.equals(nv, ov)) return;

                        var nds = nv.dataSeries ? nv.dataSeries.id : 0,
                            ods = ov.dataSeries ? ov.dataSeries.id : 0;

                        if (scope.widgetDataIntervals && scope.widgetDataIntervals.length && nv.condensationType == ov.condensationType && nds == ods) {
                            redrawChart(scope.params, scope.widgetDataIntervals, scope.widgetData);
                        } else {
                            refreshWidget();
                        }

                        //refreshWidget();
                    }, true);
                }
            };
        });
})();

