(function () {
    angular.module('irisTunnelmeterPerformanceWidget').directive('irisTunnelmeterPerformanceWidget',
        function ($q, $filter, $compile, IrisTunnelmeterPerformanceWidgetService, WorkDaysConfigurationService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-tunnelmeter-performance/templates/iris-tunnelmeter-performance.view.html',

                controller: function ($scope) {
                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};
                    scope.params = angular.extend({}, scope.params, IrisTunnelmeterPerformanceWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    function redrawChart(settings, dataIntervals, rawData) {
                        Highcharts.chart("tunnelmeterChart", IrisTunnelmeterPerformanceWidgetService.getChartConfiguration(settings, dataIntervals, rawData));
                    }

                    function refreshWidgetData() {
                        var q = new $q.defer();

                        scope.widgetData = [];
                        if (scope.params.demo) {
                            IrisTunnelmeterPerformanceWidgetService.getDataIntervals(scope.params, IrisTunnelmeterPerformanceWidgetService.getDemoDataStart(), IrisTunnelmeterPerformanceWidgetService.getDemoDataEnd(), scope.widget.projectId).then(res => {
                                scope.widgetDataIntervals = res.map(r => { return { from: new Date(r.from), to: new Date(r.to) }; });
                                scope.widgetData = IrisTunnelmeterPerformanceWidgetService.getDemoData();
                                q.resolve();
                            });
                        } else {
                            IrisTunnelmeterPerformanceWidgetService.getDataIntervals(scope.params, scope.params.period.date_start, scope.params.period.date_end, scope.widget.projectId).then(res => {
                                scope.widgetDataIntervals = res.map(r => { return { from: new Date(r.from), to: new Date(r.to) }; });
                                IrisTunnelmeterPerformanceWidgetService.getData(scope.params.dataSeries.id, scope.widgetDataIntervals[0].from, scope.widgetDataIntervals[scope.widgetDataIntervals.length - 1].to).then((data) => {
                                    scope.widgetData = data ? (data[scope.params.dataSeries.id] || []) : [];
                                    q.resolve();
                                });
                            });
                        }

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
                        refreshWidget();
                        //if (nv.condensationPeriod != ov.condensationPeriod) {
                        //    switch (nv.condensationPeriod) {
                        //        case "MDAY":
                        //            scope.widget.settings.xAxisFormat = "DD.MM";
                        //            break;
                        //        case "MWEEK":
                        //            scope.widget.settings.xAxisFormat = "ww";
                        //            break;
                        //        case "MMONTH":
                        //            scope.widget.settings.xAxisFormat = "MMM";
                        //            break;
                        //    }
                        //}
                    }, true);
                }
            };
        });
})();

