(function() {
    'use strict';

    angular.module('iris_widget_shift_criticalpath_table', []);

    angular.module('iris_widget_shift_criticalpath_table').directive('irisShiftCriticalpathTable', function ($compile,
        $timeout, ShiftProtocolService) {
        return {
            restrict: 'AE',
            scope: {
                params: '=',
                widget: '='
            },

            templateUrl: iris.config.widgetsUrl + '/iris-shift-criticalpath-table/templates/criticalpath-view.html',

            controller: function ($scope, $element, $attrs) {
                var demoMode = ($attrs.mode == 'demo');

                const params = JSON.parse($scope.params);

                $scope.table = [];

                var statisticsPromise = demoMode ? ShiftProtocolService.getDemoStatisticsDynamic(params) : ShiftProtocolService.getStatistics(params);
                statisticsPromise.then((result) => {
                    $scope.table = result.rows;
                    $scope.summary = result.summary;
                });

                $scope.data = [];

                $scope.to = params.to;
                $scope.from = params.from;
                $scope.addSuffix = params.addSuffix;
                $scope.title = params.title;
                $scope.hideTitle = params.hideTitle;
                $scope.columns = params.columns;
            }
        }
    });
})();