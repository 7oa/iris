(function () {
    angular.module('irisWidgetTypes', []);

    angular.module('irisWidgetTypes').factory('WidgetTimeType',
        function ($filter, $translate, WidgetParameterService) {

            var typeAny = {type: 'any', label: $translate.instant('label.widget.time.type.any')};
            var typeNone = {type: 'none', label: $translate.instant('label.widget.time.type.none')};
            var typePeriod = {type: 'period', label: $translate.instant('label.widget.time.type.period')};
            var typeDate = {type: 'date', label: $translate.instant('label.widget.time.type.date')};

            var allTypes = [
                typeAny,
                typeNone,
                typePeriod,
                typeDate
            ];
            var allReportTypes = [typeDate, typePeriod];
            return {
                getAllWidgetTypes: function () {
                    return allTypes;
                },
                getReportTypes: function () {
                    return allReportTypes;
                },

                getDefault: function (timeType) {
                    return WidgetParameterService.getParameter(timeType);
                },

                getTimeSupport: function (type) {
                    switch (type) {
                        case 'any':
                            return [typeDate, typePeriod];
                        case 'period':
                            return [typePeriod];
                        case 'date':
                            return [typeDate];
                        case 'none':
                        default:
                            return [];
                    }
                },

                setDateParams: function (widget, type) {
                    console.log(widget);
                    if(widget.widget_type.timeType=='none'){
                        return;
                    }
                    if (type == 'any') {
                        type = 'date';
                    }
                    for (var i = widget.parameters.length; i >= 0; i--) {
                        var p = widget.parameters[i];
                        if (p && (p.type == 'date' || p.type == 'period')) {
                            widget.parameters.splice(i, 1);
                        }
                    }
                    var dateParam = this.getDefault(type);
                    if (dateParam != null) { //set new date param
                        widget.parameters.push(angular.copy(dateParam));
                    }
                }
            };
        });


    angular.module('irisWidgetTypes').factory('WidgetTypeService',
        function ($filter, $translate, WidgetParameterService) {

            var widget_types = {
                'iris-bar-chart': {
                    name: $translate.instant('label.BarChart'),
                    directive: 'iris-bar-chart',
                    configController: 'BarChartConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-bar-chart/templates/iris-bar-chart.edit.html`,
                    timeType: 'date',
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        label: 'Device',
                        is_required: true,
                        type: 'project-device'
                    }]
                },
                'iris-html': {
                    name: 'Html',
                    directive: 'iris-html',
                    timeType: 'none',
                    parameters: []
                },
                'iris-iframe': {
                    name: 'IFrame',
                    directive: 'iris-iframe',
                    timeType: 'none',
                    isPreviewNeeded: true,
                    parameters: []
                },
                'iris-in-progress-files': {
                    name: $translate.instant('label.widgets.FilesInProgress'),
                    directive: 'iris-in-progress-files',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-in-progress-files/templates/iris-in-progress-files.edit.html`,
                    timeType: 'date',
                    parameters: []
                },
                'iris-files-comments': {
                    name: $translate.instant('label.widgets.FilesComments'),
                    directive: 'iris-files-comments',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-files-comments/templates/iris-files-comments.edit.html`,
                    timeType: 'date',
                    parameters: []
                },
                'iris-navi-view': {
                    name: $translate.instant('label.NavigationView'),
                    directive: 'iris-navi-view',
                    configController: 'NaviViewConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-navi-view/templates/iris-navi-view.edit.html`,
                    timeType: 'date',
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        label: 'Device',
                        is_required: true,
                        type: 'project-device'
                    }]
                },
                'iris-interval-condensed': {
                    name: $translate.instant('label.IntervalCondensed'),
                    directive: 'iris-interval-condensed',
                    timeType: 'period',
                    configController: 'IntervalCondensedEditCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-interval-condensed/templates/iris-interval-condensed.edit.html`,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        label: 'Device',
                        is_required: true,
                        type: 'project-device'
                    }]
                },
                'iris-spoil-management': {
                    name: $translate.instant('label.SpoilManagement'),
                    directive: 'iris-spoil-management',
                    configController: 'SpoilManagementConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-spoil-management/templates/iris-spoil-management.edit.html`,
                    timeType: 'date',
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        label: 'Device',
                        is_required: true,
                        type: 'project-device'
                    }]
                },
                'iris-charttool': {
                    name: $translate.instant('label.CharttoolWidget'),
                    directive: 'iris-charttool',
                    configController: 'CharttoolWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-charttool-widget/templates/iris-charttool-widget.edit.html`,
                    timeType: 'period',
                    parameters: []
                },
                'iris-damage-repair-widget': {
                    name: $translate.instant('label.DamageRepairWidget'),
                    directive: 'iris-damage-repair-widget',
                    configController: 'DamageRepairWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-damage-repair-widget/templates/iris-damage-repair-widget.edit.html`,
                    timeType: 'period',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }]
                },
                'iris-ring-build-widget': {
                    name: $translate.instant('label.RingBuildWidget'),
                    directive: 'iris-ring-build-widget',
                    configController: 'RingBuildWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-ring-build-widget/templates/iris-ring-build-widget.edit.html`,
                    timeType: 'date',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        is_required: true,
                        type: 'device'
                    }]
                },
                'iris-segment-table-widget': {
                    name: $translate.instant('label.SegmentTableWidget'),
                    directive: 'iris-segment-table-widget',
                    configController: 'SegmentTableWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-segment-table-widget/templates/iris-segment-table-widget.edit.html`,
                    timeType: 'date',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }]
                },
                'iris-tunnelmeter-performance-widget': {
                    name: $translate.instant('label.TunnelmeterPerformance'),
                    directive: 'iris-tunnelmeter-performance-widget',
                    configController: 'TunnelmeterPerformanceWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-tunnelmeter-performance/templates/iris-tunnelmeter-performance.edit.html`,
                    timeType: 'period',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        is_required: true,
                        type: 'device'
                    }]
                },
                'iris-shift-management-widget': {
                    name: $translate.instant('label.ShiftManagementEvaluation'),
                    directive: 'iris-shift-management-widget',
                    configController: 'ShiftManagementWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-shift-management/templates/iris-shift-management.edit.html`,
                    timeType: 'period',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        is_required: false,
                        type: 'device'
                    }]
                },
                'iris-shift-report-widget': {
                    name: $translate.instant('label.ShiftReport'),
                    directive: 'iris-shift-report-widget',
                    configController: 'ShiftReportWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-shift-management/templates/iris-shift-report.edit.html`,
                    timeType: 'date',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        is_required: false,
                        type: 'device'
                    }]
                },
                'iris-shift-bar-chart-widget': {
                    name: $translate.instant('label.ShiftBarChartWidget'),
                    directive: 'iris-shift-bar-chart-widget',
                    configController: 'ShiftBarChartWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-shift-bar-chart-widget/templates/iris-shift-bar-chart-widget.edit.html`,
                    timeType: 'period',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: true,
                        type: 'project'
                    }, {
                        is_required: true,
                        type: 'device'
                    }]
                },
                'iris-table-widget': {
                    name: $translate.instant('label.TableWidget'),
                    directive: 'iris-table-widget',
                    configController: 'TableWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-table-widget/templates/iris-table-widget.edit.html`,
                    timeType: 'period',//'any',
                    isPreviewNeeded: true,
                    parameters: [{
                        is_required: false,
                        type: 'project'
                    }, {
                        is_required: false,
                        type: 'device'
                    }]
                },
                'iris-sensorboard-widget': {
                    name: $translate.instant('label.SensorboardWidget'),
                    directive: 'iris-sensorboard-widget',
                    configController: 'SensorboardWidgetConfigCtrl',
                    configViewUrl: `${iris.config.widgetsUrl}/iris-sensorboard-widget/templates/iris-sensorboard-widget.edit.html`,
                    timeType: 'date',
                    isPreviewNeeded: false,
                    parameters: [{
                        is_required: false,
                        type: 'project'
                    }, {
                        is_required: false,
                        type: 'device'
                    }]
                }
            };

            var widget_types_array = [];

            //Merge WidgetParameters with defaults in each widget type parameters
            (function initParameters() {
                for (var i in widget_types) {
                    for (var j in widget_types[i].parameters) {
                        var param = angular.copy(widget_types[i].parameters[j]);
                        widget_types[i].parameters[j] = angular.extend({}, WidgetParameterService.getParameter(param.type), param);
                    }
                }
            })();

            return {

                isSupportedType: function (widget, timeType) {
                    switch (widget.timeType) {
                        case 'any':
                        case 'none':
                            return true;
                        case 'date':
                            return timeType == 'date';
                        case 'period':
                            return timeType == 'period';
                        default :
                            return false;
                    }
                },

                getWidgetTypes: function (timeType) {
                    if (!widget_types_array.length) {
                        for (var obj in widget_types) {
                            widget_types_array.push(widget_types[obj]);
                        }
                    }

                    if (timeType) {
                        var filtered = [];
                        for (var i in widget_types_array) {
                            var t = widget_types_array[i];
                            if (this.isSupportedType(t, timeType)) {
                                filtered.push(t);
                            }
                        }
                        return filtered;
                    } else {
                        return widget_types_array;
                    }

                },

                getWidgetType: function (directive) {
                    var widgetType = widget_types[directive];
                    if (widgetType) {
                        widgetType.configViewUrl = widgetType.configViewUrl || `${iris.config.widgetsUrl}/${directive}/${directive}.edit.html`;
                        return widgetType;
                    }
                }
            }
        });

})();