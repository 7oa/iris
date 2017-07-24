(function () {
    irisAppDependencies.add('iris_fast_task');

    angular.module('iris_fast_task', []);

    angular.module('iris_fast_task').directive('irisFastTask',
        function (TasksService) {
            return {
                replace: true,
                restrict: 'EA',
                scope: {},
                templateUrl: iris.config.baseUrl + '/common/directives/irisFastTask/templates/iris-fast-task.html',
                link: function (scope, element, attrs) {
                    scope.config = iris.config;
                    scope.me = iris.config.me;
                    scope.currentIRISTime = new Date();

                    let d1 = moment(scope.currentIRISTime).startOf('day'),
                        d2 = angular.copy(d1).add(1, 'day');

                    scope.tasks = [];
                    const filter = {
                        filter: angular.toJson([
                            {
                                f: 'assigneeId', v: [iris.config.me.id]
                            },
                            {
                                f: 'dateEnd', v: [d1, d2], m: "btw", s: false
                            }
                        ])
                    };

                    scope.requestTasks = function() {
                        TasksService.getTasks(filter).then(tasks => scope.tasks = tasks);
                    };
                    scope.requestTasks();
                }
            };
        });
})();