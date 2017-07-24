(function () {
    var module = angular.module('irisRingBuildWidget');
    module.controller('RingBuildWidgetConfigCtrl', function ($scope, $translate, IrisUnitsService) {
        $scope.tabs = [{
            title: $translate.instant('label.Table'),
            contentUrl: iris.config.widgetsUrl + '/iris-ring-build-widget/templates/iris-ring-build-widget.tabs.table.html'
        },{
            title: $translate.instant('label.Figure'),
            contentUrl: iris.config.widgetsUrl + '/iris-ring-build-widget/templates/iris-ring-build-widget.tabs.figure.html'
        }];

        $scope.units = IrisUnitsService.getPossibleConvertsForUnit('MILLIMETER');
    });
})();