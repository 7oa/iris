(function() {
    angular.module('iris_html', []);

    angular.module('iris_html').directive('irisHtml', ['$compile', function ($compile) {
        return {
            restrict: 'AE',
            scope: {
                params: '=',
                widget: '='
            },
            template: '',
            link: function (scope, element, attrs) {
                element.html($compile(scope.widget.settings.html)(scope));
            }
        }
    }]);

    angular.module('iris_html').controller('HtmlEditCtrl', ['$scope',
        function ($scope) {
        }
    ]);

    angular.module('iris_html').service('IrisHtmlService', ['IrisHtmlDefaults',
        function(IrisHtmlDefaults){
            this.getDefaultSettings = function(){
                return IrisHtmlDefaults;
            }
        }
    ]);

    angular.module('iris_html').factory('IrisHtmlDefaults', [function(){
        return {
            html: ""
        };
    }])
})();