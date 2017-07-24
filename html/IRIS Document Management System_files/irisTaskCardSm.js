(function () {
    angular.module('iris_taskmanagement').directive('irisTaskCardSm',
        function () {
            return {
                replace: true,
                restrict: 'EA',

                scope: {
                    task: '=',
                    onTaskClick: '&',
                    onTaskDblClick: '&',
                    highlighted: '=?'
                },

                templateUrl: iris.config.baseUrl + '/common/components/taskmanagement/templates/iris-task-card-sm.html',

                controller: function($scope) {

                },

                link: function (scope, element, attrs) {
                    if (scope.onTaskClick) {
                        element.css("cursor", "pointer");
                    }
                }
            };
        });
})();