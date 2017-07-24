(function () {

   angular.module('iris_dashboards', ['iris_reports']);

    angular.module('iris_dashboards').factory('Dashboards', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/reporting/dashboards/:id", {
            id: '@id'
        });
    }]);

    angular.module('iris_dashboards').factory('DashboardsService',
        function ($filter, $translate, Dashboards, WidgetService) {
            var dashboards = Dashboards.query({}, function (reports) {
                for (var i = 0, c = reports.length; i < c; i++) {
                    init(reports[i]);
                }

                return reports;
            });

            var init = function (report) {
                report.widgets = report.widgets || [];
                for (var i = 0, c = report.widgets.length; i < c; i++) {
                    report.widgets[i] = WidgetService.initWidget(report.widgets[i]);
                }
            };

            return {
                query: function (filter) {
                    filter = filter || {};
                    return Dashboards.query(filter).$promise;
                },

                getDashboards: function () {
                    return dashboards;
                },

                getPreloadedDashboards: function () {
                    return iris.data.dashboards || [];
                },

                save: function(dashboard) {
                    return Dashboards.save(dashboard).$promise
                }
            };
        }
    );
})();
