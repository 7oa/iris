(function (undefined) {
    var module = angular.module('irisShiftManagementWidget');
    module.controller('ShiftReportWidgetConfigCtrl', function ($scope, $translate, $controller,
                      IrisShiftReportWidgetService, ShiftProtocolTemplateService) {

        angular.extend($scope, $controller('ShiftManagementWidgetBaseConfigCtrl', { $scope }));

        $scope.tabs = [{
            title: $translate.instant('label.Settings'),
            contentUrl: iris.config.widgetsUrl + '/iris-shift-management/templates/iris-shift-report.tabs.settings.html'
        }, {
            title: $translate.instant('label.Codes'),
            contentUrl: iris.config.widgetsUrl + '/iris-shift-management/templates/iris-shift-report.tabs.codes.html'
        }];

        $scope.tableLayout = IrisShiftReportWidgetService.getTableLayouts();

        $scope.shiftProtocolTemplates = [];

        function refreshShiftProtocolTemplates(projectId) {
            if (projectId) {
                ShiftProtocolTemplateService.findAllByProject(projectId).then(res => {
                    $scope.shiftProtocolTemplates = res;
                });
            } else {
                $scope.shiftProtocolTemplates = [];
                $scope.widget.settings.shiftProtocolTemplateId = null;
            }
        }
        refreshShiftProtocolTemplates($scope.widget.projectId);

        $scope.$watch("widget.projectId", function(nv, ov) {
            if (nv == ov) return;
            refreshShiftProtocolTemplates(nv);
        });
    });
})();