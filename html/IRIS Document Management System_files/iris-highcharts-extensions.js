(function () {
    angular.module('irisApp').run(
        function ($translate) {
            Highcharts.setOptions({
                lang: {
                    noData: $translate.instant('text.NoDataAvailable'),
                    decimalPoint: '.',
                    thousandsSep: ''
                }
            });
        });

})();