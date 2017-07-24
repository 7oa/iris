(function () {
    angular.module('iris_taskmanagement').directive('irisTaskCard',
        function ($uibModal, TasksService) {
            return {
                replace: true,
                restrict: 'EA',

                scope: {
                    task: '=',
                    onTitleClick: '&',
                    onTaskClick: '&'
                },

                templateUrl: iris.config.baseUrl + '/common/components/taskmanagement/templates/iris-task-card.html',

                controller: function($scope) {

                },

                link: function (scope, element, attrs) {
                    scope.readonly = attrs["readonly"] == "true";

                    scope.getTaskUrl = function(task) {
                        return TasksService.getTaskViewUrl(task.id);
                    };

                    scope.checkDeadline = function (task) {
                        if (!task || !task.dateEnd || task.isResolved) return false;
                        return moment(new Date()).diff(moment(new Date(task.dateEnd))) > 0;
                    };
                }
            };
        });
})();