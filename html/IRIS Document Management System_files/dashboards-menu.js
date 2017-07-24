(function (globals) {
    globals.angular.module('irisApp').directive('irisDashboardsMenu',
        function (DashboardsService, SecurityService, $translate) {

            return {
                restrict: 'A',
                templateUrl: iris.config.directivesUrl + '/dashboards-menu/dashboards-menu.html',
                link: function (scope, element, attrs) {
                    scope.dashboards = DashboardsService.getPreloadedDashboards();
                    angular.forEach(scope.dashboards, val => {
                        val.href = iris.config.baseUrl + '/ui/ui/dashboards/dashboard?id=' + val.id;
                    });
                    if (SecurityService.hasPermissions('TASK_MGMT', 'Module', 'access')) {
                        scope.dashboards.unshift({
                            id: 'root',
                            name: $translate.instant('label.MyDashboard'),
                            href: iris.config.baseUrl + '/ui/ui/dashboard/root'
                        });
                    }
                    scope.me = iris.config.me;
                    scope.config = iris.config;
                }
            };

        });
})({
    angular,
    config: iris.config
});
