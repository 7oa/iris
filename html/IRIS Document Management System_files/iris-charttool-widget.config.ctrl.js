(function () {
    var module = angular.module('irisCharttoolWidget');
    module.controller('CharttoolWidgetConfigCtrl', function ($scope, $translate, CharttoolTemplatesService) {
        $scope.tabs = [{
            alias: 'ViewOptions', // for form validation
            title: $translate.instant('label.ViewOptions'),
            contentUrl: iris.config.widgetsUrl + '/iris-charttool-widget/templates/iris-charttool-widget.tabs.config.html'
        }];

        $scope.templates = [];
        CharttoolTemplatesService.requestTemplates()
            .then(templates => $scope.templates = templates);



    });
})();