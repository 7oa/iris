(function () {

    angular.module('iris_bar_chart').service('IrisBarChartService',
        function () {

            this.getDefaultSettings = function () {
                return {
                    isHorizontal: true,
                    barColor: '#93be3d',
                    chartHeight: 350,
                    dataSeriesUnit: null,

                    isAutoScale: true,
                    maxRange: 100,
                    minRange: 0,
                    measurementLabel: "",
                    measurementDecimals: 0,

                    isShowValues: true,
                    valueDecimals: 2,

                    dataSeries: []
                }
            };
        });

})()