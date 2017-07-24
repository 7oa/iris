(function() {
    angular.module('irisMyTasksCalendar').directive('irisMyTasksCalendar', function ($window, $compile, IrisMyTasksCalendarService, TasksService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=?',
                widget: '=?'
            },

            templateUrl: iris.config.widgetsUrl + '/iris-my-tasks-calendar/templates/iris-my-tasks-calendar.view.html',

            controller: function ($scope) {
                $scope.lowTasks = { color: "#777", events: [] };
                $scope.normalTasks = { color: "#93be3d", events: [] };
                $scope.hiTasks = { color: "#a94442", events: [] };
                $scope.calendarEvents = [$scope.lowTasks, $scope.normalTasks, $scope.hiTasks];

                $scope.taskPopover = {
                    template: iris.config.widgetsUrl + '/iris-my-tasks-calendar/templates/iris-my-tasks-calendar.task.popover.html'
                };

                $scope.onEventRender = function(event, element) {
                    element.attr({
                        'popover-trigger': "'mouseenter'",
                        'uib-popover-template': "taskPopover.template"
                        // 'popover-placement': "top"
                    });

                    element.find(".fc-title").html(`[${event.taskId}] ${event.title}`);

                    var innerScope = $scope.$new(true);
                    innerScope.taskPopover = $scope.taskPopover;
                    innerScope.task = event;
                    $compile(element)(innerScope);
                };

                $scope.calendarConfig = {
                    calendar: {
                        height: 360,
                        eventRender: $scope.onEventRender,
                        viewRender: function(view) {
                            $scope.getItems && $scope.getItems(view.start, view.end);
                        }
                    }
                };
            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisMyTasksCalendarService.getDefaultSettings(), scope.widget.settings);

                // scope.taskEvents.push({
                //     title: 'All Day Event',
                //     start: new Date(),
                //     allDay: true
                // });

                var loadedPeriods = [],
                    loadedTasks = [];

                function isLoaded(task) {
                    if (!!loadedTasks.find(t => t.id == task.id)) return true;

                    loadedTasks.push(task);
                    return false;
                }

                scope.getItems = function (start, end) {
                    if (!!loadedPeriods.find(p => p.start == start.toISOString() && p.end == end.toISOString())) return;

                    TasksService.getUserTasks(iris.config.me.id, {
                        filter: [{f:"dateEnd", v:[start.toDate(), end.toDate()], m:"btw", s:false}]
                    }).then(tRes => {
                        loadedPeriods.push({start: start.toISOString(), end: end.toISOString()});

                        tRes = tRes.filter(t => !!t.dateEnd && !!t.priority && new Date(t.dateEnd) >= new Date(start) && new Date(t.dateEnd) <= new Date(end));
                        tRes.filter(t => !isLoaded(t)).forEach(t => {
                            t.start = new Date(t.dateEnd);
                            t.allDay = true;
                            t.stick = true;
                            t.url = TasksService.getTaskViewUrl(t.id);
                            t.isResolved && (t.className = ['task-resolved']);

                            switch (t.priority) {
                                case "LOW":
                                    scope.lowTasks.events.push(t);
                                    break;
                                case "NORMAL":
                                    scope.normalTasks.events.push(t);
                                    break;
                                case "HIGH":
                                    scope.hiTasks.events.push(t);
                                    break;
                            }
                        });
                    });
                };
                //scope.getItems();
            }
        }
    });
})();