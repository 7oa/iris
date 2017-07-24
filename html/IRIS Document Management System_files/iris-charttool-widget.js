(function () {
    angular.module('irisCharttoolWidget').directive('irisCharttool',
        function ($timeout, CharttoolTemplatesService) {
            return {
                restrict: 'AE',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-charttool-widget/templates/iris-charttool-widget.view.html',
                link: function ($scope, element, attrs) {
                    $scope.widget = $scope.widget || {};
                    $scope.widget.settings = $scope.widget.settings || {};
                    $scope.params = $scope.params || {};
                    $scope.params.liveMode = $scope.params.liveMode || attrs.liveMode == "true";
                    $scope.params.liveModeInterval = +$scope.widget.settings.liveModeInterval;
                    if(attrs.liveMode == "true"){
                        var dateEnd = new Date();
                        $scope.params.period = {
                            date_start: new Date(dateEnd.getTime() - 5 * 60 * 1000), //-5 min
                            date_end: dateEnd
                        };
                    }
                    $scope.isSilentMode = attrs.silentMode == "true";
                    $scope.showControls = attrs.showControls == "true";
                    $scope.chartTemplate = null;
                    $scope.linkedCharts = {};

                    if(attrs.mode == "demo"){
                        $scope.params = $scope.params || {};
                        $scope.params.period = {date_start: new Date(), date_end: new Date()}
                    }

                    $scope.$watch('widget.chartTemplate.charttoolCharts', initTemplateCharts, true);
                    $scope.$watch('widget.chartTemplate', initTemplate);
                    $scope.$watch('widget.chartTemplateId', initTemplateId);
                    $scope.$watch('widget.settings.chartTemplateId', initTemplateId);
                    $scope.$watch('widget.chartTemplate.view', forceHighChartsToResizeCharts);

                    function initTemplateId(templateId, oldTemplateId, skipCheck){
                        if (skipCheck !== true) {
                            //set it as null only if we have changed from old template to a new one
                            if(!templateId && oldTemplateId) $scope.chartTemplate = null;
                            if (!templateId || attrs['templateId']) return;
                        }
                        CharttoolTemplatesService.getById(templateId).then(template => $scope.widget.chartTemplate = template)
                    }

                    // attrs['templateId'] - workaround to hardcode templateId
                    attrs['templateId'] && initTemplateId(attrs['templateId'], attrs['templateId'], true);

                    function initTemplate(chartTemplate){
                        if(!chartTemplate) return;

                        $scope.chartTemplate = chartTemplate;
                        initTemplateCharts(chartTemplate.charttoolCharts)
                    }

                    function initTemplateCharts(newCharts, oldCharts){
                        if(!$scope.chartTemplate || angular.equals(newCharts, oldCharts)) return;

                        var unevaluatedCharts = angular.copy(newCharts);
                        var charts = [];
                        // check for old charts without sensortablesetting
                        for (var i = 0; i < unevaluatedCharts.length; i++) {
                            if (unevaluatedCharts[i].sensorTableSetting) charts.push(unevaluatedCharts[i]);
                        }


                        $scope.chartTemplate.charts = charts.sort((a,b)=>a.orderId - b.orderId).map(chart => {
                            console.log('raw chart', chart);
                            var xAxis = (chart.sensorTableSetting.chartSettings && chart.sensorTableSetting.chartSettings.xAxis) || 'DATE';
                            var xAxisColor = (chart.sensorTableSetting.chartSettings && chart.sensorTableSetting.chartSettings.xAxisColor) || '#606060';
                            var xAxisReferenceDeviceId = xAxis === 'CHAINAGE' || xAxis === 'TUNNELMETER' ? chart.sensorTableSetting.chartSettings.xAxisReferenceDeviceId : null;
                            var specificReferenceDsId = xAxis === 'SPECIFIC' ? chart.sensorTableSetting.chartSettings.specificReferenceDsId : null;
                            var xAxisIntervalDsId = xAxis === 'ADVANCE' ? chart.sensorTableSetting.chartSettings.xAxisIntervalDsId : null;
                            return {
                                id: chart.sensorTableSetting.id,
                                markers: chart.markers,
                                originChartId: chart.id || 'unsaved',
                                name: chart.sensorTableSetting.name,
                                geology: chart.sensorTableSetting.chartSettings && chart.sensorTableSetting.chartSettings.geology,
                                orderId: chart.orderId,
                                intervalConfig: {
                                    ringBorderSourceDsId: chart.sensorTableSetting.chartSettings && chart.sensorTableSetting.chartSettings.ringBorderSourceDsId,
                                    showIntervals: chart.sensorTableSetting.chartSettings && chart.sensorTableSetting.chartSettings.showRingBorders
                                },
                                options: chart.sensorTableSetting.chartSettings,
                                axisConfig: {
                                    x: {
                                        xAxis: xAxis,
                                        xAxisColor: xAxisColor,
                                        xAxisReferenceDeviceId: xAxisReferenceDeviceId,
                                        specificReferenceDsId: specificReferenceDsId,
                                        xAxisIntervalDsId: xAxisIntervalDsId
                                    },
                                    y: {
                                        settings: chart.sensorTableSetting.chartSettings && chart.sensorTableSetting.chartSettings.yAxisSettings
                                    },
                                    style: chart.sensorTableSetting.chartSettings && chart.sensorTableSetting.chartSettings.axisStyle
                                },
                                dataseries: chart.sensorTableSetting.dataSeriesList.map(ds => {
                                    return {
                                        id: ds.dataSeries.id,
                                        irisUnit: ds.targetUnit,
                                        name: ds.resultTitle,
                                        color: ds.chartSettings.color || '#000000',
                                        lineWidth: ds.chartSettings.lineWidth || 1,
                                        type: ds.dataSeries.type,
                                        displayType: ds.chartSettings.displayType || 'step',
                                        showAlarmLimits: ds.chartSettings.showAlarmLimits || 'NONE',
                                        showAlarmLimitLabel: ds.chartSettings.showAlarmLimitLabel !== undefined ? !!+ds.chartSettings.showAlarmLimitLabel : false,
                                        showInChart: ds.chartSettings.showInChart !== undefined ? !!+ds.chartSettings.showInChart : true
                                    }
                                })
                            }
                        });
                        console.log('mapped charts', $scope.chartTemplate.charts);
                        forceHighChartsToResizeCharts();
                    }

                    $scope.setFullscreenChart = function (chart) {
                        $scope.widget.fullscreenChart = $scope.widget.fullscreenChart && $scope.widget.fullscreenChart.id == chart.id
                            ? null : chart;
                        forceHighChartsToResizeCharts();
                    };

                    $scope.setFocusedChart = function (chart) {
                        $scope.widget.focusedChart = $scope.widget.focusedChart && $scope.widget.focusedChart.id == chart.id
                            ? null : chart;
                    };

                    /**
                     * TODO:
                     * this method is currently a workaround, because highcharts not automatically adapt the size
                     * of the charts depending on their container (only on window resize event).
                     * So after changing viewMode (Tile, List) or switching to fullscreen mode, we have to
                     * manually trigger a window resize event
                     */
                    function forceHighChartsToResizeCharts() {
                        $timeout(() => {
                            $(window).trigger('resize');
                        }, 500);
                    }

                    $scope.openPrintChartModal = function($event, chart) {
                        var params = {
                            view: "list",
                            filter: $scope.params.period,
                            charts: [chart.id]
                        };
                        console.log('print chart params = ', angular.toJson(params));
                        chart.printUrl = `/ui/ui/charts/charttool?params=${angular.toJson(params)}`;
                        $timeout(()=>{
                            $($event.currentTarget).closest('.chart-wrapper').find('.iris-print').click();
                        })
                    };

                    $scope.toggleChartLink = function(chart) {
                        $scope.linkedCharts[chart.id] = !$scope.linkedCharts[chart.id];
                    };

                    $scope.chartLinked = function(chart) {
                        return !!$scope.linkedCharts[chart.id];
                    };

                    $scope.toggleShowValuesInChart = function (chart) {
                        $scope.widget.api.toggleShowValuesInChart(chart);
                    };

                    $scope.downloadAsSvg = function (chart) {
                        $scope.widget.api.export(chart, Highcharts.exporting.MIME_TYPES.SVG);
                    };

                    $scope.downloadAsPng = function (chart) {
                        $scope.widget.api.export(chart, Highcharts.exporting.MIME_TYPES.PNG);
                    };
                }
            }
        });

    angular.module('irisCharttoolWidget').service('IrisCharttoolService', [
        function () {
            this.getDefaultSettings = function () {
                return {
                    templateId: null,
                    showTemplateTitle: true,
                    useTemplateLimits: false
                }
            };
        }
    ]);

})();