(function() {
    "use strict";

    angular.module('iris_widget_shift_mgmt_gantt', []);

    angular.module('iris_widget_shift_mgmt_gantt').directive('irisShiftMgmtGantt', function ($compile,
        $timeout, ShiftProtocolService, ProjectsService) {
        return {
            restrict: 'AE',
            scope: {
                params: '=',
                widget: '=',
                print: '='
            },

            templateUrl: iris.config.widgetsUrl + '/iris-shift-mgmt-gantt/templates/gantt-view.html',

            link: function ($scope, element, attrs) {
                var demoMode = (attrs.mode == 'demo');

                const period = JSON.parse($scope.params).period;
                const settings = JSON.parse($scope.widget).settings;

                if ($scope.print) {
                    settings.scale = '30 minutes';
                }

                $scope.data = [];

                if (!settings.displayGantt) {
                    return;
                }

                function roundTime(t, scale, isStartingDate) {
                    const time = convertTimeToCurrentTimeZone(t);
                    const minutes = $scope.scales.find((it) => it.value == scale).minutes;
                    const remainder = (minutes - time.minute()) % minutes;
                    const rounded = time.add('minutes', remainder);
                    if (!isStartingDate || (isStartingDate && remainder != 0)) {
                        rounded.add(-minutes, 'minutes')
                    }
                    return rounded;
                }

                function convertTimeToCurrentTimeZone(time) {
                    return moment.tz(time, $scope.timeZone);
                }

                function convertTaskTimes(task) {
                    task.to = convertTimeToCurrentTimeZone(task.to);
                    task.from = convertTimeToCurrentTimeZone(task.from);
                    task.duration = moment.duration(moment(task.to).diff(moment(task.from))).asMinutes();
                }

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
                    $scope.project = demoMode ? ProjectsService.getPreloadedProjects()[0] : ProjectsService.getProjectById($scope.projectId);
                    $scope.timeZone = $scope.project.timeZone;
                    $scope.protocol = protocol.protocol;

                    const childRows = protocol.rows.filter((r) => r.parent);
                    if (settings.selectedStates && settings.selectedStates.length) {
                        protocol.rows = protocol.rows.filter(r => settings.selectedStates.indexOf(r.id) >= 0 || r.checkBit || r.ringRow);
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

                    $scope.drawGanttChart(protocol)
                });

                // Reload data action
                $scope.load = function(data) {
                    $scope.data = data;

                    $scope.data.scale = $scope.scale;
                    $scope.data.from = $scope.fromDate;
                    $scope.data.to = $scope.toDate;

                    $scope.api.columns.refresh();

                    $timeout(function() {
                        $scope.isSuccess = true
                    }, 3000)
                };

                $scope.scales = [{
                    value: '5 minutes',
                    short: '5m',
                    minutes: 5
                },{
                    value: '10 minutes',
                    short: '10m',
                    minutes: 10
                },{
                    value: '30 minutes',
                    short: '30m',
                    minutes: 30
                },{
                    value: '1 hour',
                    short: '1h',
                    minutes: 60
                }];

                let fromDate, toDate;
                let scale;

                $scope.drawGanttChart = (protocol) => {
                    const startTime = convertTimeToCurrentTimeZone(protocol.protocol.startTime);
                    const endTime = convertTimeToCurrentTimeZone(protocol.protocol.endTime);

                    $scope.selectedTasks = [];

                    $scope.ganttTasks = [];
                    $scope.ganttRows = [];

                    if(settings.scale) {
                        scale = settings.scale;
                    } else {
                        scale = $scope.scales.find((it) => it.short === $scope.protocol.defaultGridResolution);

                        if (scale) {
                            scale = scale.value;
                        } else {
                            scale = $scope.scales[$scope.scales.length - 1].value;
                        }
                    }

                    fromDate = roundTime(startTime, scale, true);
                    toDate = roundTime(endTime, scale);

                    $scope.$watch('options.scale', () => {
                        if ($scope.options.scale) {
                            $timeout(() => {
                                $scope.options.fromDate = roundTime(startTime, $scope.options.scale, true);
                                $scope.options.toDate = roundTime(endTime, $scope.options.scale);
                            });
                        }
                    });

                    function getGanttSizes(scale) {
                        const leftSideBarWidthPx = $('.gantt-side').width();
                        const rightSideBarWidthPx = $('.gantt-right-sidebar').width();
                        const panelWidthPx = $('#gantt-chart .panel').width() - 5;

                        const s = scale.split(' ');
                        const m = {[ s[1] ]: s[0]};
                        const duration = moment.duration(m);
                        const count = parseInt(toDate.diff(fromDate) / duration._milliseconds) + 1;
                        const room = panelWidthPx - leftSideBarWidthPx - rightSideBarWidthPx;

                        return {room, count}
                    }

                    $scope.options = {
                        mode: 'custom',
                        scale: scale,
                        sortMode: undefined,
                        sideMode: 'Table',
                        daily: false,
                        maxHeight: false,
                        width: false,
                        zoom: 1,
                        treeTableColumns: ['model.code'],
                        columnsClasses: {
                            'model.code': 'gantt-column-code'
                        },
                        columns: ['model.code', 'model.name'],
                        columnsHeaders: {'model.name': 'Name', 'model.code': 'Code'},
                        headersFormats: { minute: 'm' },
                        autoExpand: 'none',
                        taskOutOfRange: 'truncate',
                        fromDate: fromDate,
                        toDate: toDate,
                        rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
                        taskContent: '<i class="fa fa-tasks"></i> {{task.model.name}}',
                        allowSideResizing: true,
                        labelsEnabled: true,
                        currentDate: 'none',
                        draw: false,
                        readOnly: false,
                        groupDisplayMode: 'overview',
                        filterTask: '',
                        filterRow: '',
                        timeFrames: {
                            'day': {
                                start: moment('8:00', 'HH:mm'),
                                end: moment('20:00', 'HH:mm'),
                                color: '#ACFFA3',
                                working: true,
                                default: true
                            },
                            'noon': {
                                start: moment('12:00', 'HH:mm'),
                                end: moment('13:30', 'HH:mm'),
                                working: false,
                                default: true
                            },
                            'closed': {
                                working: false,
                                default: true
                            },
                            'weekend': {
                                working: false
                            },
                            'holiday': {
                                working: false,
                                color: 'red',
                                classes: ['gantt-timeframe-holiday']
                            }
                        },
                        timeFramesWorkingMode: 'cropped',
                        timeFramesNonWorkingMode: 'visible',
                        columnMagnet: '1 minute',
                        timeFramesMagnet: true,
                        dependencies: true,
                        api: function (api) {
                            $scope.api = api;

                            api.core.on.ready($scope, () => {
                                $scope.load(protocol.rows);
                            });
                        }
                    };

                    $scope.canAutoWidth = function (scale) {
                        return !(scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/));
                    };

                    $scope.getColumnWidth = function (widthEnabled, scale, zoom) {
                        if (!widthEnabled && $scope.canAutoWidth(scale)) {
                            return undefined;
                        }

                        if (zoom < 1) {
                            zoom = 1;
                        }

                        const ganttSizes = getGanttSizes(scale);
                        return ganttSizes.room * zoom / ganttSizes.count;
                    };
                }
            }
        }
    });
})();