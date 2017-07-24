(function () {
    'use strict';

    angular.module('iris_widget_shift_piechart', []);

    angular.module('iris_widget_shift_piechart').directive('irisShiftPieChart', function ($compile, $translate,
                                                                                          $timeout, $filter, ShiftProtocolService) {
        return {
            restrict: 'AE',
            scope: {
                params: '=',
                widget: '='
            },

            templateUrl: `${iris.config.widgetsUrl}/iris-shift-piechart/templates/piechart-view.html`,

            controller: function ($scope, $element, $attrs, $timeout) {
                var demoMode = ($attrs.mode == 'demo');

                const params = angular.copy(JSON.parse($scope.params));
                params.columns = ['CODE_NAME', 'COLOR', 'PERCENTAGE'];

                const series = {
                    name: 'brands',
                    colorByPoint: true,
                    data: []
                };

                var statisticsPromise = demoMode ? ShiftProtocolService.getDemoStatistics() : ShiftProtocolService.getStatistics(params);
                statisticsPromise.then((result) => {
                    if (result.rows && result.rows.length) {
                        series.data = result.rows.map((it) => {
                            return {
                                name: demoMode ? it[1] : it[0],
                                y: it[2],
                                color: (demoMode ? it[0] : it[1]) || '#ddd'
                            }
                        });
                    }
                });

                let title = params.title || $translate.instant('label.ShiftManagement');
                if (params.addSuffix) {
                    title += ` ${$translate.instant('label.FromLowerCase')} ${$filter('irisTime')(params.from, 'DD/MM/YYYY')} ${$translate.instant('label.ToLowerCase')} ${$filter('irisTime')(params.to, 'DD/MM/YYYY')}`
                }

                $scope.chartConfig = {
                    options: {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: 'pie'
                        },
                        title: {
                            text: params.hideTitle ? null : title
                        },
                        tooltip: {
                            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                        },
                        exporting: {
                            enabled: false
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                    style: {
                                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                    }
                                }
                            }
                        }
                    },
                    series: [series],
                    func: function (chart) {
                        $timeout(function () {
                            chart.reflow();
                        }, 0);
                    }
                };
            }

        }
    });
})
();