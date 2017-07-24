var renderedHighcharts = {};

(function () {
    angular.module('simple_charts', []);

    angular.module('simple_charts').filter('orderByXValue', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[0] > b[0] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
        };
    });

    angular.module('simple_charts').directive('simpleChart',
        function ($q,$filter,$translate,$timeout,$interval,DataSeriesService, IrisTimeService, NaviConfigService, GeologySectionsService, AlarmingService) {
            return {
                restrict: 'AE',
                scope: {
                    dataseries: '=',
                    period: '=',
                    intervals: '=',
                    intervalConfiguration: '=',
                    markers: '=',
                    api: '=',
                    geology: '=',
                    chartOptions: '=options',
                    xaxisConfiguration: '=xaxisConfig',
                    yaxisConfiguration: '=yaxisConfig',
                    liveMode: '=',
                    liveModeInterval: '='
                },
                //template:'<span ng-repeat="p in params">{{p.label}} = {{p.value}}</span>',
                template: '<highchart class="simple-chart" config="chartConfig"></highchart>',
                link: function (scope, element, attrs) {
                    var LIVE_MODE_INTERVAL = scope.liveModeInterval || 2000,
                        LIVE_MODE_FREQ = 400;

                    var isSilentMode = false; //to not show loader if data requested from time to time
                    var markerSymbols = ["circle", "square", "diamond", "triangle", "triangle-down"];
                    var markerSymbolPointer = 0;
                    scope.alarmLimits = {};

                    // FALLBACK
                    if (!scope.chartOptions) scope.chartOptions = {};
                    if (!scope.chartOptions.axisStyle) scope.chartOptions.axisStyle = {};

                    attrs.$observe('title', (title) => {
                        scope.chartConfig.title.text = title || '';
                        scope.title = title || '';
                    });
                    
                    scope.title = attrs.title || '';

                    attrs.$observe('silentMode', (silentMode) => {
                        isSilentMode = silentMode == "true";
                    });

                    scope.$watchCollection('dataseries', function (nv,ov) {
                        if(nv && nv.length) scope.refresh();
                    });

                    scope.$watch('period', function (nv,ov) {
                        if(nv && !angular.equals(nv, ov)) {
                            scope.refresh();
                        }
                    },true);

                    var isLiveMode = () => scope.liveMode && scope.periodMilliseconds;

                    function processPeriod() {
                        if (!scope.period || !scope.period.date_start || !scope.period.date_end) {
                            scope.periodMilliseconds = 0;
                        } else {
                            scope.periodMilliseconds = Math.abs(new Date(scope.period.date_start) - new Date(scope.period.date_end));
                            LIVE_MODE_INTERVAL = Math.max(LIVE_MODE_INTERVAL, Math.floor(scope.periodMilliseconds / LIVE_MODE_FREQ));
                        }
                    }

                    function initDateAxisLiveMode() {
                        $interval.cancel(scope.scliveModeInterval);
                        if (isLiveMode()) {
                            scope.scliveModeInterval = $interval(() => updateDateAxisLiveMode(), LIVE_MODE_INTERVAL);
                        }
                    }

                    function prepareLiveModeData(data) {
                        if (!data || !data.length) return [];

                        var resData = [],
                            dates = data.map(d => d[0]),
                            now = +iris.Time.convertTimeToOutputString(new Date(), 'x', iris.config.timezone),
                            currDate = Math.min(now, Math.floor(Math.min.apply(Math, dates) / LIVE_MODE_INTERVAL) * LIVE_MODE_INTERVAL),
                            endDate = Math.min(now, Math.max.apply(Math, dates));

                        while (currDate < endDate) {
                            var intervalData = data.filter(d => d[0] >= currDate && d[0] <= currDate + LIVE_MODE_INTERVAL);
                            if (intervalData.length) {
                                resData.push(intervalData[0]);
                            } else {
                                if (resData.length) {
                                    resData.push(angular.copy(resData[resData.length - 1]));
                                }
                            }
                            currDate += LIVE_MODE_INTERVAL;
                        }

                        return resData;
                    }

                    scope.$on("$destroy", function() {
                        if (scope.scliveModeInterval) {
                            $interval.cancel(scope.scliveModeInterval);
                        }
                    });

                    function updateDateAxisLiveMode() {
                        DataSeriesService.getValues({
                            dataseries: angular.toJson(scope.dataseries.map(function (v) {
                                return {id: v.id, targetUnit: v.irisUnit};
                            })),
                            'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}]),
                            'exclude-fields': angular.toJson(['grouped', 'projectId', 'deviceId', 'unit', 'dataseriesId'])
                        }).then(result => {
                            var seriesIndex = 0;
                            for (let i = 0; i < scope.dataseries.length; i++) {
                                if (scope.dataseries[i].showInChart == false) continue;

                                if (result[scope.dataseries[i].id] && result[scope.dataseries[i].id].length) {
                                    var currData = result[scope.dataseries[i].id][0],
                                        valueMilliseconds = +iris.Time.convertTimeToOutputString(new Date()/*currData.date)*/, 'x', iris.config.timezone),
                                        valueDate = new Date(valueMilliseconds),
                                        edgeDate = new Date(valueMilliseconds - scope.periodMilliseconds);

                                    /* future data is not possible, because prepareLiveModeData() exists */
                                    //var futureSeriesData = scope.chartConfig.series[seriesIndex].data.filter(d => new Date(d[0]) > valueDate);
                                    //if (scope.chartConfig.series[seriesIndex].data.length && futureSeriesData.length) {
                                    //    scope.chartConfig.series[seriesIndex].data.splice(scope.chartConfig.series[seriesIndex].data.length - futureSeriesData.length, futureSeriesData.length);
                                    //}
                                    var obsoleteSeriesData = scope.chartConfig.series[seriesIndex].data.filter(d => new Date(d[0]) < edgeDate);
                                    if (scope.chartConfig.series[seriesIndex].data.length && obsoleteSeriesData.length) {
                                        scope.chartConfig.series[seriesIndex].data.splice(0, obsoleteSeriesData.length);
                                    }

                                    scope.chartConfig.series[seriesIndex].data.push([valueMilliseconds, currData.value || 0]);
                                }
                                seriesIndex++;
                            }
                            $timeout(() => {
                                $(window).trigger('resize');
                            });
                        });
                    }

                    scope.api = scope.api || { };

                    scope.api.toggleShowValuesInChart = function (chart) {
                        var highChartContainer = $('.icm-chart#id-' + chart.id + ' .highcharts-container');
                        var renderedChart = renderedHighcharts[highChartContainer.attr('id')];
                        if (renderedChart) {
                            angular.forEach(renderedChart.series, (v,k) => {
                                var dataLabelsState = v.options.dataLabels.enabled;
                                v.update({
                                    dataLabels: {
                                        enabled: !dataLabelsState
                                    }
                                });

                            });
                        }
                    };

                    scope.api.export = function (chart, type) {
                        var highChartContainer = $('.icm-chart#id-' + chart.id + ' .highcharts-container');
                        var dataHighcharts = highChartContainer.parent().highcharts();
                        if (Highcharts.exporting.supports(type)) {
                            dataHighcharts.exportChartLocal({ type : type });
                            console.log("E X P O R T E D | Type:", type, chart);
                        }
                        else {
                            console.log("E X P O R T   F A I L E D | Type not supported:", type);
                        }
                    };

                    scope.api.refresh = scope.refresh = function () {
                        scope.alarmLimits = {};
                        processPeriod();

                        if(!scope.dataseries || !scope.period || !scope.period.date_start || !scope.period.date_end) {
                            console.log(scope.dataseries,scope.period);
                            return;
                        }

                        if(!isSilentMode) iris.loader.start(element);
                        var requestingDataseriesDataLogger = new JSTimeLogger('Requesting data for dataseries');

                        let promises = {
                            alarmLimits: fetchAlarmLimits(),
                            fetchedData: DataSeriesService.getValues({
                                dataseries: angular.toJson(scope.dataseries.map(function (v) {
                                    return {id: v.id, targetUnit: v.irisUnit};
                                })),
                                'date-start': scope.period.date_start,
                                'date-end': scope.period.date_end,
                                'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}]),
                                'exclude-fields': angular.toJson(['grouped', 'projectId', 'deviceId', 'unit', 'dataseriesId']),
                                'compression-intervals': 400
                            })
                        };

                        $q.all(promises).then((result) => {
                            processAlarmLimits(result.alarmLimits);
                            processFetchedDsValues(result.fetchedData);
                        });

                        function fetchAlarmLimits() {
                            var dsIds = [];
                            for (var i = 0; i < scope.dataseries.length; i++) {
                                dsIds.push(scope.dataseries[i].id);
                            }
                            return AlarmingService.getLimitsForDs(dsIds);
                        }

                        function processFetchedDsValues(result) {
                            requestingDataseriesDataLogger.finished(result);
                            //support old usage of simple-charts
                            if (!scope.xaxisConfiguration || (scope.xaxisConfiguration && scope.xaxisConfiguration.xAxis === 'DATE')) {
                                var periodString = '(' +  $filter('irisTime')(scope.period.date_start) + ' - ' + $filter('irisTime')(scope.period.date_end) + ')';
                                scope.chartConfig.title.text = scope.title + (scope.liveMode ? '' : ' ' + periodString);
                                processDateAxisChart(result);
                            }
                            else  {
                                scope.chartConfig.title.text = scope.title;
                                processNonDateAxisChart(result);
                            }
                            if(scope.geology) {
                                GeologySectionsService.getGeologySections(scope.geology.projectDeviceId, scope.geology.geologyId, {
                                    'date-start': scope.period.date_start,
                                    'date-end': scope.period.date_end,
                                }).then(processGeologySections);
                            }
                        }

                        function processGeologySections(geologySections) {
                            var resultData = {};
                            var yAxises = scope.chartConfig.options.yAxis;
                            if(angular.isUndefined(yAxises['%'])){
                                var defaultSettings = {
                                    title: {
                                        text: '%'
                                    },
                                    labels: {
                                        format: '{value:.1f}'
                                    }
                                };

                                scope.chartConfig.options.yAxis.push(defaultSettings);
                                yAxises['%'] = scope.chartConfig.options.yAxis.length - 1;
                            }

                            for (var j = 0, l = geologySections.length; j < l; j++) {
                                var section = geologySections[j];
                                var geoClasses = section.sectionGeologicalClasses;

                                for (var i = 0; i < geoClasses.length; i++) {
                                    var geoClass = geoClasses[i];
                                    resultData[geoClass.geologicalClass.id] = resultData[geoClass.geologicalClass.id] || {
                                            type: "area",
                                            color: geoClass.geologicalClass.color,
                                            data: [],
                                            yAxis: yAxises['%'],
                                            name: geoClass.geologicalClass.name
                                        };
                                    var geoClassData = resultData[geoClass.geologicalClass.id].data;
                                    geoClassData.push([+iris.Time.convertTimeToOutputString(new Date(section.dateStart), 'x', iris.config.timezone), geoClass.ratio]);
                                    geoClassData.push([+iris.Time.convertTimeToOutputString(new Date(section.dateEnd), 'x', iris.config.timezone), geoClass.ratio])
                                }
                            }


                            Object.keys(resultData).forEach(key => {
                                scope.chartConfig.series.push(resultData[key]);
                            });

                            scope.chartConfig.plotOptions = scope.chartConfig.plotOptions || {};
                            scope.chartConfig.plotOptions.area = {
                                stacking: 'percent',
                                lineColor: '#666666',
                                lineWidth: 1,
                                marker: {
                                    lineWidth: 1,
                                    lineColor: '#666666'
                                }
                            };

                        }

                        function processAlarmLimits(alarmLimits) {
                            for (var i = 0; i < alarmLimits.length; i ++) {
                                var alarmLimit = alarmLimits[i];
                                if (alarmLimit.isActive) {
                                    scope.alarmLimits[alarmLimit.dataSeriesId] = scope.alarmLimits[alarmLimit.dataSeriesId] || [];
                                    scope.alarmLimits[alarmLimit.dataSeriesId].push({
                                        name: alarmLimit.level.name,
                                        level: alarmLimit.level.level,
                                        color: alarmLimit.level.color,
                                        lower: alarmLimit.lower,
                                        upper: alarmLimit.upper
                                    });
                                }
                            }
                        }

                        function fetchValuesForReferenceDs(dsId) {
                            return DataSeriesService.getValues({
                                dataseries: angular.toJson([{'id':+dsId}]),
                                'date-start': scope.period.date_start,
                                'date-end': scope.period.date_end,
                                'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}]),
                                'exclude-fields': angular.toJson(['grouped', 'projectId', 'deviceId', 'unit', 'dataseriesId']),
                                'compression-intervals': 800
                            });
                        }

                        function correlateData(xAxisReferenceData, dataSeriesData, considerGaps) {
                            if (!xAxisReferenceData) return [];
                            var correlatingDataLogger = new JSTimeLogger('Correlating data');
                            var resultData = [];
                            var dataPointsWithGaps = [];

                            var iterateGapsLogger = new JSTimeLogger('Iterate data for gaps NON-DATE x-axis');
                            //check for gaps
                            for (var i = 0, l = dataSeriesData.length; i < l; i++) {
                                var currData = dataSeriesData[i];
                                dataPointsWithGaps.push({ xDate: currData.date, yValue: currData.value});

                                if (!considerGaps) continue;
                                if (!currData.dateEnd || !dataSeriesData[i+1]) continue;

                                var hasGap = new Date(currData.dateEnd) < new Date(dataSeriesData[i+1].date);
                                if (hasGap) {
                                    dataPointsWithGaps.push({ xDate: currData.dateEnd, yValue: currData.value});
                                    dataPointsWithGaps.push({ xDate: currData.dateEnd, yValue: null});
                                }
                            }

                            // NEW algorithm
                            var refDataLength = xAxisReferenceData.length;
                            var dataPointsLength = dataPointsWithGaps.length;
                            var j = 0, i = 0, currDataPointVal;
                            while (j < refDataLength) {
                                while (i < dataPointsLength && new Date(xAxisReferenceData[j].date) >= new Date(dataPointsWithGaps[i].xDate)) {
                                    currDataPointVal = dataPointsWithGaps[i].yValue;
                                    i++;
                                }
                                var x = xAxisReferenceData[j].value;
                                if (x) resultData.push([x, currDataPointVal]);
                                j++;
                            }

                            // OLD algorithm
                            /*
                           for (var i = 0, l = dataPointsWithGaps.length; i < l; i++) {
                                var currDataPoint = dataPointsWithGaps[i];
                                var k = 0;
                                var refDataLength = xAxisReferenceData.length;
                                var x;

                                while (k < refDataLength && new Date(xAxisReferenceData[k].date) <= new Date(currDataPoint.xDate)) {
                                    x = xAxisReferenceData[k].value;
                                    k++;
                                }

                                if (x) resultData.push([x, currDataPoint.yValue]);
                            }*/
                            iterateGapsLogger.finished();

                            var filteredResult = $filter('orderByXValue')(resultData);
                            correlatingDataLogger.finished();
                            return filteredResult;
                        }

                        function processNonDateAxisChart(result) {
                            var processDataSeriesLogger = new JSTimeLogger('Process dataseries NON-DATE axis');
                            delete result[""];
                            var dataseries = angular.copy(scope.dataseries);
                            var referenceDsId = null;
                            var xAxisTitle = "";
                            var resultData = [];
                            var promises = [];
                            markerSymbolPointer = 0;

                            if (scope.xaxisConfiguration.xAxis === 'CHAINAGE') {
                                var referenceSeries = NaviConfigService.getReferenceSeries(+scope.xaxisConfiguration.xAxisReferenceDeviceId);
                                promises.push(referenceSeries.then(references => {
                                    if (references && references.chainageDataSeries) {
                                        referenceDsId = references.chainageDataSeries.id;
                                        xAxisTitle = $translate.instant('label.Chainage') + ', ' + $filter('irisUnits')(references.chainageDataSeries.irisUnit,'short');
                                    }
                                }));
                            }
                            else if (scope.xaxisConfiguration.xAxis === 'TUNNELMETER') {
                                var referenceSeries = NaviConfigService.getReferenceSeries(+scope.xaxisConfiguration.xAxisReferenceDeviceId);
                                promises.push(referenceSeries.then(references => {
                                    if (references && references.tunnelmeterDataSeries) {
                                        referenceDsId = references.tunnelmeterDataSeries.id;
                                        xAxisTitle = $translate.instant('label.Tunnelmeter') + ', ' + $filter('irisUnits')(references.tunnelmeterDataSeries.irisUnit,'short');
                                    }
                                }));
                            }
                            else if (scope.xaxisConfiguration.xAxis === 'ADVANCE') {
                                referenceDsId = scope.xaxisConfiguration.xAxisIntervalDsId;
                                xAxisTitle = $translate.instant('label.Advance');
                            }
                            else if (scope.xaxisConfiguration.xAxis === 'SPECIFIC') {
                                referenceDsId = scope.xaxisConfiguration.specificReferenceDsId;
                                var ds = $filter('filter')(dataseries, {id: +referenceDsId}, true)[0];
                                var xAxisUnit = $filter('irisUnits')(ds.irisUnit,'short');
                                xAxisTitle = ds.name + ', ' + xAxisUnit;
                            }

                            $q.all(promises).then(function() {

                                scope.chartConfig.series = [];
                                scope.chartConfig.options.yAxis = [];
                                scope.chartConfig.options.xAxis[0] = {
                                    title: {
                                        enabled: true,
                                        text: xAxisTitle,
                                        style: {
                                            color: scope.xaxisConfiguration.xAxisColor || '#606060'
                                        }
                                    },
                                    tickInterval: scope.xaxisConfiguration.xAxis === 'ADVANCE' ? 1 : undefined,
                                    labels: {
                                        style: {
                                            color: scope.xaxisConfiguration.xAxisColor || '#606060',
                                            fontFamily: scope.chartOptions.axisStyle.font || 'Arial',
                                            fontWeight: scope.chartOptions.axisStyle.boldFont ? 'bold' : 'normal',
                                            fontSize: scope.chartOptions.axisStyle.fontSize || 11
                                        }
                                    }
                                };
                                var plotOptions = chartPlotOptions();
                                if (plotOptions) {
                                    scope.chartConfig.options.plotOptions = plotOptions;
                                }

                                var yAxises = {};
                                var opposite = false;

                                if (referenceDsId && angular.isNumber(+referenceDsId)) {
                                    var requestDataReferenceDsLogger = new JSTimeLogger('Requesting data for reference ds');
                                    fetchValuesForReferenceDs(referenceDsId).then(referenceData => {
                                        requestDataReferenceDsLogger.finished(referenceData);
                                        if (!referenceData || referenceData.length === 0) return;

                                        // iterate dataseries
                                        for (var i = 0, c = dataseries.length; i < c; i++) {
                                            if (dataseries[i].showInChart == false) continue;
                                            resultData = [];
                                            var unit = $filter('irisUnits')(dataseries[i].irisUnit,'short');

                                            if(angular.isUndefined(yAxises[unit])){
                                                var defaultSettings = {
                                                    title: {
                                                        text: unit
                                                    },
                                                    labels: {
                                                        format: '{value:.1f}'
                                                    },
                                                    opposite: opposite
                                                };
                                                var yAxisSettings = angular.merge({}, defaultSettings, yAxisCustomSettings(dataseries[i].irisUnit));
                                                scope.chartConfig.options.yAxis.push(yAxisSettings);

                                                opposite = !opposite;
                                                yAxises[unit] = scope.chartConfig.options.yAxis.length - 1;
                                            }

                                            // add horizontal lines for alarm limits
                                            if (angular.isDefined(scope.alarmLimits[dataseries[i].id])) {
                                                appendAlarmLimits(scope.alarmLimits[dataseries[i].id], dataseries[i],
                                                    scope.chartConfig.options.yAxis[yAxises[unit]]);
                                            }

                                            // prepare data for series
                                            if (result[scope.dataseries[i].id]) {
                                                resultData = correlateData(referenceData[referenceDsId], result[scope.dataseries[i].id], true);
                                            }

                                            var seriesConfiguration = {
                                                name: scope.dataseries[i].name + ', ' + unit,
                                                yAxis: yAxises[unit],
                                                tooltip: {
                                                    valueSuffix: ' ' + unit,
                                                    valueDecimals: 3
                                                },
                                                data: resultData,
                                                color: dataseries[i].color
                                            };

                                            angular.extend(seriesConfiguration, seriesAppearance(dataseries[i], 'right'));
                                            scope.chartConfig.series.push(seriesConfiguration);
                                        }

                                        //clear intervals
                                        scope.chartConfig.options.xAxis[0].plotLines = [];

                                        // check for intervals
                                        if(scope.intervalConfiguration && scope.intervalConfiguration.showIntervals){
                                            if (scope.intervalConfiguration.ringBorderSourceDsId)
                                            requestIntervals(scope.intervalConfiguration.ringBorderSourceDsId, scope.xaxisConfiguration.xAxis, referenceData[referenceDsId]);
                                        }

                                        // check for chart markers
                                        if (scope.markers && scope.markers.list) {
                                            renderMarkers(scope.markers.list);
                                        }
                                    });
                                }
                            });
                            processDataSeriesLogger.finished();
                            iris.loader.stop();
                        }

                        function convertDateToMillis(date) {
                            const d = new Date(date);
                            let t = moment.tz(d, iris.config.timezone);
                            return t.valueOf() + t._offset*60*1000;
                        }

                        function processDateAxisChart(result) {
                            var processDataSeriesLogger = new JSTimeLogger('Process dataseries DATE axis');
                            delete result[""];
                            var dataseries = angular.copy(scope.dataseries);
                            markerSymbolPointer = 0;

                            scope.chartConfig.series = [];
                            scope.chartConfig.options.yAxis = [];
                            scope.chartConfig.options.xAxis[0].dateTimeLabelFormats = {
                                millisecond: '%H:%M:%S',
                                second: '%H:%M:%S',
                                minute: '%H:%M',
                                hour: '%H:%M',
                                day: '%e. %b',
                                week: '%e. %b',
                                month: '%b \'%y',
                                year: '%Y'
                            };
                            scope.chartConfig.options.xAxis[0].labels = {
                                style: {
                                    color: scope.xaxisConfiguration.xAxisColor || '#606060',
                                    fontFamily: scope.chartOptions.axisStyle.font || 'Arial',
                                    fontWeight: scope.chartOptions.axisStyle.boldFont ? 'bold' : 'normal',
                                    fontSize: scope.chartOptions.axisStyle.fontSize || 11
                                }
                            };
                            scope.chartConfig.options.xAxis[0].title = {
                                style: {
                                    color: scope.xaxisConfiguration.xAxisColor || '#606060'
                                }
                            };
                            var plotOptions = chartPlotOptions();
                            if (plotOptions) {
                                scope.chartConfig.options.plotOptions = plotOptions;
                            }

                            var yAxises = {};
                            var opposite = false;
                            for (var i = 0, c = scope.dataseries.length; i < c; i++) {
                                if (dataseries[i].showInChart == false) continue;
                                var unit = $filter('irisUnits')(dataseries[i].irisUnit,'short');

                                if(angular.isUndefined(yAxises[unit])){
                                    var defaultSettings = {
                                        title: {
                                            text: unit
                                        },
                                        labels: {
                                            format: '{value:.1f}'
                                        },
                                        opposite: opposite
                                    };
                                    var yAxisSettings = angular.merge({}, defaultSettings, yAxisCustomSettings(dataseries[i].irisUnit));
                                    scope.chartConfig.options.yAxis.push(yAxisSettings);

                                    opposite = !opposite;
                                    yAxises[unit] = scope.chartConfig.options.yAxis.length - 1;
                                }

                                // add horizontal lines for alarm limits
                                if (angular.isDefined(scope.alarmLimits[dataseries[i].id])) {
                                    appendAlarmLimits(scope.alarmLimits[dataseries[i].id], dataseries[i],
                                        scope.chartConfig.options.yAxis[yAxises[unit]]);
                                }

                                var resultData = [];
                                if (result[scope.dataseries[i].id]) {
                                    var rawData = result[scope.dataseries[i].id];

                                    var iterateForGapsLogger = new JSTimeLogger('Iterate data for gaps DATE x-axis');

                                    for (var j = 0, l = rawData.length; j < l; j++) {
                                        var currData = rawData[j];
                                        if (currData.value === undefined || !currData.date) continue;

                                        resultData.push([convertDateToMillis(currData.date), currData.value]);

                                        /**
                                         * if it's the last value, also push the value to dateEnd
                                         */
                                        if (j === (rawData.length - 1) && currData.dateEnd !== undefined) {
                                            resultData.push([convertDateToMillis(currData.dateEnd), currData.value]);
                                            continue;
                                        }

                                        if (!rawData[j+1] || !currData.dateEnd) continue;

                                        var hasGap = new Date(currData.dateEnd) < new Date(rawData[j+1].date);
                                        if (hasGap) {
                                            const dateEndMillis = convertDateToMillis(currData.dateEnd);
                                            resultData.push([dateEndMillis, currData.value]);
                                            resultData.push([dateEndMillis, null]);
                                        }
                                    }

                                    iterateForGapsLogger.finished();
                                }

                                var seriesConfiguration = {
                                    name: scope.dataseries[i].name + ', ' + unit,
                                    yAxis: yAxises[unit],
                                    tooltip: {
                                        valueSuffix: ' ' + unit,
                                        valueDecimals: 3,
                                        xDateFormat: IrisTimeService.getDateTimePatternForHighChartsById(iris.config.me.profile.dateTimeFormatId)
                                    },
                                    data: isLiveMode() ? prepareLiveModeData(resultData) : resultData,
                                    color: dataseries[i].color
                                };
                                angular.extend(seriesConfiguration, seriesAppearance(dataseries[i], 'left'));
                                scope.chartConfig.series.push(seriesConfiguration);
                            }

                            scope.chartConfig.options.xAxis[0].plotLines = [];
                            if(scope.intervals) {
                                renderIntervals(scope.intervals);
                            } else if(scope.intervalConfiguration && scope.intervalConfiguration.showIntervals){
                                requestIntervals(scope.intervalConfiguration.ringBorderSourceDsId);
                            }

                            // check for markers
                            if (scope.markers && scope.markers.list) {
                                renderMarkers(scope.markers.list);
                            }
                            processDataSeriesLogger.finished();
                            iris.loader.stop();

                            initDateAxisLiveMode();
                        }

                        function chartPlotOptions() {
                            if (!scope.chartOptions) return {};

                            if (scope.chartOptions.valuesInChart !== undefined) {
                                var config = {
                                    dataLabels: {
                                        enabled: (scope.chartOptions.valuesInChart.enabled == true),
                                        style: {
                                            color: scope.chartOptions.valuesInChart.color || '#606060',
                                            fontSize: scope.chartOptions.valuesInChart.fontSize || 11,
                                            fontFamily: scope.chartOptions.valuesInChart.font || 'Arial',
                                            fontWeight: scope.chartOptions.valuesInChart.boldFont ? 'bold' : 'normal'

                                        },
                                        shadow: false
                                    },
                                    cursor: 'pointer'
                                };
                                if (scope.chartOptions.valuesInChart.decimalPlaces !== undefined) {
                                    config.dataLabels.format = '{y:.' + scope.chartOptions.valuesInChart.decimalPlaces + 'f}';
                                }
                                else {
                                    config.dataLabels.format = '{y:.1f}';
                                }
                                return {
                                    line: config,
                                    bar: config,
                                    series: {
                                        stickyTracking: true,
                                        point: {
                                            events: {
                                                mouseOver: function () {
                                                    syncTooltipsAndMarkers(this.series.chart.container, this.x);
                                                },
                                                click: function(event) {
                                                    var highChartsContainer = event.currentTarget;
                                                    var chartId = +$(highChartsContainer.closest('[simple-chart]')).attr('origin-chart-id')
                                                    console.log('Chart-ID:', chartId, 'X-POS:', event.point.x);
                                                    scope.api.addMarkerToChart(chartId, event.point.x);
                                                }
                                            }
                                        }
                                    }
                                };
                            }
                        }

                        function seriesAppearance(ds, stepType) {
                            var displayType = ds.displayType;
                            var step = displayType === 'step' ? stepType : false;
                            var showPoints = displayType === 'point' || displayType === 'pointline';
                            var hideLine = displayType === 'point';
                            var highChartsType = displayType === 'bar' ? 'column' : 'line';
                            var lineWidth = ds.lineWidth !== undefined ? ds.lineWidth : 1;
                            var i = markerSymbolPointer;
                            markerSymbolPointer++;

                            return {
                                type: highChartsType,
                                step: step,
                                marker: {
                                    enabled: showPoints,
                                    symbol: markerSymbols[(i % markerSymbols.length)]
                                },
                                lineWidth: hideLine ? 0 : lineWidth,
                                states: {
                                    hover: {
                                        enabled: !hideLine
                                    }
                                }
                            };
                        }

                        function appendAlarmLimits(alarmLimits, dataSeries, yAxis) {
                            if (angular.isUndefined(dataSeries.showAlarmLimits) || dataSeries.showAlarmLimits === 'NONE') return;

                            yAxis.plotLines = yAxis.plotLines || [];
                            for (var i in alarmLimits) {
                                var alarmLimit = alarmLimits[i];
                                var alarmColor = alarmLimit.color.charAt(0) === '#' ? alarmLimit.color : '#' + alarmLimit.color;
                                var textLabel = "";
                                if (angular.isDefined(dataSeries.showAlarmLimitLabel) && dataSeries.showAlarmLimitLabel === true) {
                                    textLabel = '[' + alarmLimit.level + '] ' + alarmLimit.name + ' (' + dataSeries.name + ')';
                                }
                                if (dataSeries.showAlarmLimits === 'UPPER' || dataSeries.showAlarmLimits === 'ALL') {
                                    if (angular.isDefined(alarmLimit.upper) && alarmLimit.upper !== null) {

                                        var upperLine = {
                                            dashStyle: 'shortdash',
                                            width: 1,
                                            color: alarmColor,
                                            value: alarmLimit.upper,
                                            zIndex:1000,
                                            label: {
                                                text: textLabel
                                            }
                                        };
                                        yAxis.plotLines.push(upperLine);
                                    }
                                }

                                if (dataSeries.showAlarmLimits === 'LOWER' || dataSeries.showAlarmLimits === 'ALL') {
                                    if (angular.isDefined(alarmLimit.lower) && alarmLimit.lower !== null) {
                                        var lowerLine = {
                                            dashStyle: 'shortdash',
                                            width: 1,
                                            color: alarmColor,
                                            value: alarmLimit.lower,
                                            zIndex:1000,
                                            label: {
                                                text: textLabel
                                            }
                                        };
                                        yAxis.plotLines.push(lowerLine);
                                    }
                                }
                            }
                        }

                        function yAxisCustomSettings(irisUnit) {
                            if (!irisUnit) return {};

                            if (scope.yaxisConfiguration && scope.yaxisConfiguration.settings) {
                                var settings = $filter('filter')(scope.yaxisConfiguration.settings, {targetUnit: irisUnit}, true)[0];
                                if (settings) {
                                    var oppositeAxis = settings.opposite !== undefined ? !!+settings.opposite : false;
                                    var yAxisSettings = {
                                        min: settings.fromY === null ? undefined : settings.fromY,
                                        max: settings.toY === null ? undefined : settings.toY,
                                        style: {},
                                        labels: {
                                            format: settings.decimalPlaces !== undefined ? '{value:.' + settings.decimalPlaces + 'f}' : '{value:.1f}',
                                            style: {
                                                fontFamily: scope.chartOptions.axisStyle.font || 'Arial',
                                                fontWeight: scope.chartOptions.axisStyle.boldFont ? 'bold' : 'normal',
                                                fontSize: scope.chartOptions.axisStyle.fontSize || 11
                                            }
                                        },
                                        title: {
                                            rotation: 270,
                                            margin: oppositeAxis ? 20 : 10,
                                            style: {}
                                        }
                                    };
                                    yAxisSettings.opposite = oppositeAxis;
                                    if (settings.yColor) {
                                        yAxisSettings.lineColor = settings.yColor || '#606060';
                                        yAxisSettings.style.color =  settings.yColor || '#606060';
                                        yAxisSettings.title.style.color = settings.yColor || '#606060';
                                        yAxisSettings.labels.style.color = settings.yColor || '#606060';
                                    }
                                }
                                return yAxisSettings;
                            }
                            return {};
                        }

                        function requestIntervals(intervalDataseriesId, xAxisType, xAxisReferenceData){
                            var requestIntervalsLogger = new JSTimeLogger('Request intervals');
                            DataSeriesService.getValues({
                                'dataseries': angular.toJson([{'id': intervalDataseriesId}]),
                                'date-start': scope.period.date_start,
                                'date-end': scope.period.date_end,
                                'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}]),
                                'compression-intervals': 500
                            }).then(result => {
                                requestIntervalsLogger.finished(intervalDataseriesId);
                                var intervals = [];
                                if (result && result[intervalDataseriesId]) {
                                    // for date x axis
                                    if (!xAxisType || xAxisType === 'DATE') {
                                        result[intervalDataseriesId].forEach(rawInterval => {
                                            if (rawInterval.date && rawInterval.value != null) {
                                                var interval = {
                                                    startTime: rawInterval.date,
                                                    name: rawInterval.value
                                                };
                                                intervals.push(interval);
                                            }
                                        });
                                    }
                                    // for non-date x axis
                                    else if (xAxisType && xAxisType !== 'DATE' && xAxisReferenceData) {
                                        var intervalsRaw = correlateData(xAxisReferenceData, result[intervalDataseriesId], false);
                                        var orderedIntervalsRaw = $filter('orderByXValue')(intervalsRaw);
                                        orderedIntervalsRaw.forEach(rawInterval => {
                                            var interval = {
                                                x: rawInterval[0],
                                                name: rawInterval[1]
                                            };
                                            intervals.push(interval);
                                        });
                                    }
                                    renderIntervals(intervals);
                                }

                            });
                        }

                        function renderMarkers(markersList) {
                            var plotLines = scope.chartConfig.options.xAxis[0].plotLines;
                            markersList.forEach(marker => {
                                if (scope.xaxisConfiguration.xAxis === marker.xType) {
                                    plotLines.push({
                                        value: (marker.xType === 'DATE') ? new Date(marker.xPos).getTime() : marker.xPos,
                                        color: marker.color || '#606060',
                                        width: 2,
                                        label: {
                                            text: marker.name,
                                            style: {
                                                color: 'grey'
                                            },
                                            rotation: 270,
                                            textAlign: 'right',
                                            x: 15,
                                            y: 0
                                        }
                                    });
                                }
                            });
                        }

                        function renderIntervals(intervals){
                            var plotLines = scope.chartConfig.options.xAxis[0].plotLines;
                            intervals.forEach(interval => {
                                //if interval inside boundaries - draw vertical line
                                if (interval.startTime && new Date(interval.startTime) >= scope.period.date_start
                                    && new Date(interval.startTime) <= scope.period.date_end) {
                                    plotLines.push({
                                        value: +iris.Time.convertTimeToOutputString(new Date(interval.startTime), 'x', iris.config.timezone),
                                        color: '#D74C0C',
                                        width: 1,
                                        label: {
                                            text: $translate.instant('label.Interval') + ' ' + (interval.name || ('id: ' + interval.id)),
                                            style: {
                                                color: 'grey'
                                            },
                                            rotation: 270,
                                            textAlign: 'right',
                                            x: 15,
                                            y: 0
                                        }
                                    });
                                }
                                // no date x axis
                                else if (interval.x) {
                                    plotLines.push({
                                        value: interval.x,
                                        color: '#D74C0C',
                                        width: 1,
                                        label: {
                                            text: $translate.instant('label.Interval') + ' ' + (interval.name || ('id: ' + interval.id)),
                                            style: {
                                                color: 'grey'
                                            },
                                            rotation: 270,
                                            textAlign: 'right',
                                            x: 15,
                                            y: 0
                                        }
                                    });
                                }
                            });
                        }

                        function syncTooltipsAndMarkers(highChartWrapper, p) {
                            var sourceChart = renderedHighcharts[highChartWrapper.id];
                            angular.forEach(renderedHighcharts, targetChart => {
                                if (targetChart.container && sourceChart.container.id != targetChart.container.id) {
                                    if (!sourceChart.xAxis.length || !targetChart.xAxis.length) return;
                                    var sameXAxisRange = sourceChart.xAxis[0].min === targetChart.xAxis[0].min
                                        && sourceChart.xAxis[0].max === targetChart.xAxis[0].max;
                                    var targetChartLinked = !!$(targetChart.container).closest('[simple-chart]').hasClass('hover-linked');
                                    if (sameXAxisRange && targetChartLinked) {
                                        var dataPoints = [];

                                        for (var iSeries in targetChart.series) {
                                            var data = targetChart.series[iSeries].data;
                                            if (!data) continue;
                                            for (var j = 0; j < data.length; j++) {
                                                if (data[j].x === p) {
                                                    dataPoints.push(data[j]);
                                                }
                                            }
                                        }
                                        if (dataPoints.length) {
                                            targetChart.tooltip.refresh(dataPoints);
                                            targetChart.xAxis[0].drawCrosshair(null, dataPoints[0]);
                                        }
                                    }
                                }
                            });
                        }
                    };

                    $(window).on('resize', function () {
                        $timeout(() => {
                            scope.simpleChart && scope.simpleChart.options && scope.simpleChart.reflow();
                            //scope.simpleChart && scope.simpleChart.redraw();
                        });
                    })

                },
                controller: function ($scope) {
                    $scope.simpleChart = null;
                    $scope.chartConfig = {
                        options: {
                            chart: {
                                zoomType: 'xy'
                            },
                            xAxis: [{
                                type: 'datetime',
                                crosshair: true,
                                plotlines: []
                            }],
                            yAxis: [],
                            exporting: {
                                enabled: false
                            },
                            tooltip: {
                                shared: true
                            }
                        },
                        title: {
                            text: '',
                            x: -20 //center
                        },
                        series: [],
                        func: function (chart) {
                            $scope.simpleChart = chart;

                            if (angular.isDefined(chart.container)) {
                                renderedHighcharts[chart.container.id] = chart;

                                $(chart.container).bind('mouseleave', function() {
                                    for (var i = 0; i < Highcharts.charts.length; i++) {
                                        var currChart = Highcharts.charts[i];
                                        if (currChart) {
                                            currChart.pointer.reset();
                                            currChart.tooltip.hide();
                                            currChart.xAxis[0].hideCrosshair();
                                        }
                                    }
                                });
                            }
                        }
                    };
                }
            };
        });

})();