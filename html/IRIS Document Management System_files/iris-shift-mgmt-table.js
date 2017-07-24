(function() {
    "use strict";

    angular.module('iris_widget_shift_mgmt_table', []);

    angular.module('iris_widget_shift_mgmt_table').directive('irisShiftMgmtTable', function ($compile, $controller,
        ShiftProtocolService, ProjectsService) {
        return {
            restrict: 'AE',
            scope: {
                params: '=',
                widget: '='
            },
            templateUrl: `${iris.config.widgetsUrl}/iris-shift-mgmt-table/templates/table-view.html`,

            link: function ($scope, element, attrs) {
                var demoMode = (attrs.mode == 'demo');

                angular.extend($scope, $controller('SecurityMixin',{ $scope }));

                const settings = JSON.parse($scope.widget).settings;

                if (!settings.displayList) {
                    return;
                }

                function convertTimeToCurrentTimeZone(time) {
                    return moment.tz(time, $scope.timeZone);
                }

                function convertTaskTimes(task) {
                    task.duration = moment.duration(moment(task.to).diff(moment(task.from))).asMinutes();
                    task.to = convertTimeToCurrentTimeZone(task.to).format('DD/MM/YYYY HH:mm');
                    task.from = convertTimeToCurrentTimeZone(task.from).format('DD/MM/YYYY HH:mm');
                }

                const columnCount = settings.columnCount|| 1;
                $scope.headers = [];
                for (var i = 0; i < columnCount; i++) {
                    ['Code', 'Start', 'End', 'Sum', 'Process', 'Comment'].forEach((it) => $scope.headers.push(it));
                }
                $scope.rows = [];

                function decorateTask(t) {
                    convertTaskTimes(t);
                    return t;
                }

                if (!demoMode && !settings.protocolId) {
                    console.log('protocol is not found');
                    return;
                }

                var fullModelPromise = demoMode ? ShiftProtocolService.getDemoFullModel() : ShiftProtocolService.getFullModelById(settings.protocolId);
                fullModelPromise.then((protocol) => {
                    $scope.projectId = protocol.protocol.projectId;
                    $scope.project = !demoMode ? ProjectsService.getProjectById($scope.projectId) : { id: $scope.projectId, title: 'Demo Project'};
                    $scope.timeZone = $scope.project.timeZone;
                    $scope.protocol = protocol.protocol;

                    protocol.rows = protocol.rows.filter(r => !r.checkBit && !r.ringRow && !r.downTime);

                    const childRows = protocol.rows.filter((r) => r.parent);
                    if (settings.selectedStates && settings.selectedStates.length) {
                        protocol.rows = protocol.rows.filter(r => settings.selectedStates.indexOf(r.id) >= 0);
                    }

                    if (settings.onlyWithTasks) {
                        protocol.rows = protocol.rows.filter(r => r.tasks.length > 0);
                    }

                    protocol.rows.forEach((r) => {
                        if (r.name && r.name.length > 20) {
                            r.name = r.name.substring(0, 20) + '...'
                        }
                        r.tasks.forEach(decorateTask)
                    });

                    protocol.rows.forEach((r) => {
                        let children = childRows.filter((c) => c.parent == r.id);
                        children.forEach((c) => {
                            children = children.concat(childRows.filter((it) => it.parent == c.id))
                        });

                        if (children && children.length) {
                            const hiddenChildren = children.filter((c) => !protocol.rows.find((it) => it.id === c.id))
                            if (hiddenChildren && hiddenChildren.length) {
                                hiddenChildren.forEach((c) => {
                                    c.tasks.forEach((c) => c.classes.push('gantt-task-overview'));
                                    r.tasks = r.tasks.concat(c.tasks)
                                });
                            }
                        }
                    });

                    let tasks = [];
                    protocol.rows.forEach((r) => {
                        r.tasks.forEach((t) => {
                            t.code = r.code;
                            t.name = r.name;

                            convertTaskTimes(t);
                            if (t.data.comments && t.data.comments.length) {
                                var comments = t.data.comments.reverse();

                                if (!settings.showInternalComments || !$scope.hasPermission($scope.projectId, 'Project', 'readInternalComments'))
                                    comments = comments.filter(c => c.publicComment == true);

                                if (!settings.showPublicComments)
                                    comments = comments.filter(c => c.publicComment == false);

                                if (comments.length && (settings.showInternalComments || settings.showPublicComments))
                                    t.comment = comments[0].text;
                            }
                        });
                        tasks = tasks.concat(r.tasks)
                    });

                    let taskIndex = 0;
                    const fields = ['code', 'from', 'to', 'duration', 'name', 'comment'];
                    for (var i = 0; i < tasks.length; i++) {
                        const row = [];
                        for (var j = 0; j < columnCount; j++) {
                            if (taskIndex < tasks.length) {
                                const task = tasks[taskIndex++];
                                fields.forEach((field) => {
                                    if (typeof task[field] == 'number') {
                                        task[field] = Math.round(task[field] * 100) / 100;
                                    }
                                    row.push(task[field])
                                });
                            }
                        }
                        $scope.rows.push(row);
                    }
                });
            }
        }
    });
})();