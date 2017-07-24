(function(){
    angular.module('iris_navi_view').directive('irisNaviViewDemo',
        function ($timeout, $filter, $translate, DevicesService, ProjectsService, IrisNaviViewService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-navi-view/templates/iris-navi-view.view.html',
                link: function (scope, element, attrs) {
                    scope.is_demo = true;
                    angular.extend(scope,IrisNaviViewService.getDemoScope());

                    IrisNaviViewService.drawPaperPlane(scope.navi_view.model, scope, element);
                }
            };
        });
})();