(function(globals) {
    globals.angular.module('irisApp').directive('irisHtmlOutput', function ($compile) {

        var directive = {

            restrict: 'E',

            scope: {
                content: "=",
                model: "="
            },

            link: function (scope, element, attrs) {
                scope.$watch('content', () => {
                    element.html($compile(scope.content)(scope.$parent));
                    element.find('table').addClass('table').addClass('table-bordered').addClass('table-striped')
                });
            }
        };

        return directive;
    });
})({
    angular,
    config: iris.config
});
