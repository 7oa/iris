(function () {
    angular.module('iris_taskmanagement').directive('tmModulesList',
        function ($controller) {
            return {
                restrict: 'EA',

                scope: {},

                templateUrl: iris.config.baseUrl + '/common/components/taskmanagement/templates/tm-modules-list.html',

                controller: function($scope) {
                    angular.extend($scope, $controller('SecurityMixin', {$scope}));
                    $scope.config = iris.config;
                },

                link: function (scope, element, attrs) {
                    scope.module = attrs["tmModulesList"];
                }
            };
        });
})();