(function () {
    angular.module('iris_interval_condensed').directive('irisIntervalCondensed', function ($compile, $filter, $uibModal, IrisIntervalCondensedDefaults, DeviceDataService,
                                                                                           DevicesService, ProjectsService, IrisIntervalCondensedService, UserGroupsService) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                params: '=',
                widget: '='
            },
            templateUrl: iris.config.widgetsUrl + '/iris-interval-condensed/templates/iris-interval-condensed.view.html',
            link: function ($scope, $element, $attrs) {
                $scope.show_controls = $scope.$eval($attrs.showControls) || false;

                $scope.widget = $scope.widget || {};
                $scope.widget.settings = $scope.widget.settings || {};
                $scope.mode = $scope.widget.settings.mode = $attrs.mode;
            },
            controller: 'IntervalCondensedDefaultCtrl'
        }
    })
})();