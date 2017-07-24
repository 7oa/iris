(function() {
    angular.module('iris_iframe', []);

    angular.module('iris_iframe').directive('irisIframe', function ($sce, IrisIframeService) {
        return {
            restrict: 'AE',
            scope: {
                params: '=',
                widget: '='
            },
            templateUrl: iris.config.widgetsUrl + '/iris-iframe/iris-iframe.view.html',

            controller: function($scope) {
                $scope.trustSrc = function(src) {
                    return $sce.trustAsResourceUrl(src);
                }
            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisIframeService.getDefaultSettings(), scope.widget.settings);
            }
        }
    });

    angular.module('iris_iframe').controller('IframeEditCtrl', ['$scope',
        function ($scope) {
        }
    ]);

    angular.module('iris_iframe').service('IrisIframeService', ['IrisIframeDefaults',
        function(IrisIframeDefaults){
            this.getDefaultSettings = function(){
                return IrisIframeDefaults;
            }
        }
    ]);

    angular.module('iris_iframe').factory('IrisIframeDefaults', [function(){
        return {
            url: "",
            height: 500
        };
    }])
})();