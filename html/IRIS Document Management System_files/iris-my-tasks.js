(function() {
    angular.module('irisMyTasks').directive('irisMyTasks', function (IrisMyTasksService, TasksService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=?',
                widget: '=?'
            },

            templateUrl: iris.config.widgetsUrl + '/iris-my-tasks/templates/iris-my-tasks.view.html',

            controller: function ($scope) {
                $scope.getTaskUrl = function (taskId) {
                    return TasksService.getTaskViewUrl(taskId);
                };

                TasksService.getTaskPriorities().then(pRes => {
                    $scope.priorities = pRes;
                });
            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisMyTasksService.getDefaultSettings(), scope.widget.settings);

                scope.items = [];
                var loadCounter = 1;

                scope.getItems = function () {
                    TasksService.getUserTasks(iris.config.me.id, {
                        limit: scope.params.limit * loadCounter,
                        'order-by': angular.toJson([{name:'dateEnd', value:'desc'}])
                    }).then(tRes => {
                        tRes.forEach(t => {
                            if (!scope.items.find(k => k.id == t.id)) scope.items.push(t);
                        });
                        scope.items.sort((a,b) => a.dateEnd == b.dateEnd ? a.taskId - b.taskId : new Date(b.dateEnd) - new Date(a.dateEnd));

                        scope.canLoadMore = tRes.length && (tRes.length >= scope.params.limit * loadCounter);
                        loadCounter++;
                    });
                };
                scope.getItems();
            }
        }
    });
})();