(function(){
    angular.module('iris_navi_view').directive('irisNaviViewPeriodSelector', function () {
        return {
            restrict: 'EA',
            templateUrl: iris.config.widgetsUrl + '/iris-navi-view/templates/iris-navi-view.period-selector.html'
        }
    });
})();