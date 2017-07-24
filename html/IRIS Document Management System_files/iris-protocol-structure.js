(function() {
    angular.module('irisProtocolStructure')
        .directive('irisProtocolStructure', function(IrisProtocolStructureService) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    structure: '=',
                    api: '=?'
                },

                templateUrl: iris.config.baseUrl + '/common/components/iris-protocol-structure/templates/iris-protocol-structure.html',

                controller: function($scope) {
                    $scope.cloneProperties = function(property) {
                        var res = angular.copy(property.properties);
                        // res.forEach(p => {
                        //     p.value = p.defaultValue;
                        // });
                        return res;
                    };

                    $scope.removeInlineProperties = function(value, properties) {
                        var index = value.indexOf(properties);
                        value.splice(index, 1);
                    };
                },

                link: function(scope, element, attrs) {
                    scope.readonly = attrs["readonly"] == "true";
                    scope.autoInit = attrs["autoInit"] == "true";
                    scope.viewMode = attrs["viewMode"] || "wide";
                }
            };
        });
})();