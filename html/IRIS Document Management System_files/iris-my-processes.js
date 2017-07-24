(function() {
    angular.module('irisMyProcesses').directive('irisMyProcesses', function (IrisMyProcessesService, ProjectsService, TasksService, ProcessTemplateService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=?',
                widget: '=?'
            },

            templateUrl: iris.config.widgetsUrl + '/iris-my-processes/templates/iris-my-processes.view.html',

            controller: function ($scope) {
                $scope.getProcessUrl = function(processId) {
                    return ProcessTemplateService.getProcessViewUrl(processId);
                };

                $scope.getTaskUrl = function (taskId) {
                    return TasksService.getTaskViewUrl(taskId);
                };

                $scope.projects = [];
                ProjectsService.requestProjects().then(pRes => {
                    $scope.projects = pRes;
                });

                $scope.processStatuses = ProcessTemplateService.getProcessStatuses();

                $scope.currentTaskPopover = {
                    template: iris.config.widgetsUrl + '/iris-my-processes/templates/iris-my-processes.current-task.popover.html'
                };
                $scope.currentTasksPopover = {
                    template: iris.config.widgetsUrl + '/iris-my-processes/templates/iris-my-processes.current-tasks.popover.html'
                };
            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisMyProcessesService.getDefaultSettings(), scope.widget.settings);

                scope.items = [];
                var loadCounter = 1;

                function getTasksCompleted(item) {
                    if (!item.tasks || !item.tasks.length) return 0;
                    return item.tasks.filter(t => t.isResolved).length / item.tasks.length * 100;
                };

                function extendProcessTemplates(items) {
                    items.forEach(t => {
                        t.tasksCompleted = getTasksCompleted(t);
                        t.currentTasks = t.tasks && t.tasks.filter(f => f.active && !f.isResolved);
                    });
                    return items;
                }

                scope.getItems = function () {
                    ProcessTemplateService.query({filter: angular.toJson([{f:'entityId', v:["null"], n:true}])}).then(tRes => {
                        tRes = extendProcessTemplates(tRes.filter(pt => pt.entityId !== null));
                        tRes.forEach(t => {
                            if (!scope.items.find(k => k.id == t.id)) scope.items.push(t);
                        });

                        scope.canLoadMore = tRes.length && (tRes.length >= scope.params.limit * loadCounter);
                        loadCounter++;
                    });
                };
                scope.getItems();
            }
        }
    });
})();