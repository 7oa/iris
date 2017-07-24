(function () {
    irisAppDependencies.add('charttool_charts');

    angular.module('charttool_charts', []);

    angular.module('charttool_charts').factory('ChartsService',
            function ($filter, $translate) {

                return {
                    getChartTypes(){
                        return [ {
                            name : 'LINE',
                            title: $translate.instant('label.LineChart'),
                            label : 'label.LineChart',
                            highChartsCode : 'line'
                        }, {
                            name : 'BAR',
                            title: $translate.instant('label.BarChart'),
                            label : 'label.BarChart',
                            highChartsCode : 'bar'
                        }, {
                            name : 'STEP',
                            title: $translate.instant('label.StepChart'),
                            label : 'label.StepChart',
                            highChartsCode : 'step'
                        }, {
                            name : 'POINT',
                            title: $translate.instant('label.PointChart'),
                            label : 'label.PointChart',
                            highChartsCode : 'point'
                        }, {
                            name : 'POINTLINE',
                            title: $translate.instant('label.PointLineChart'),
                            label : 'label.PointLineChart',
                            highChartsCode : 'pointline'
                        } ]
                    }
                };
            }
    );

})();