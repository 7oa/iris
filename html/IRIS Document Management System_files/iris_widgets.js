(function () {
    angular.module('iris_widgets', ['irisWidgetTypes', 'irisWidgetParameters',
        'iris_grid',
        'iris_html',
        'iris_iframe',
        'irisCharttoolWidget',
        'irisSpoilManagement',
        'iris_interval_condensed',
        'iris_interval_chart',
        'iris_bar_chart',
        'iris_widget_shift_mgmt_table',
        'iris_widget_shift_mgmt_header',
        'iris_widget_shift_mgmt_gantt',
        'iris_widget_shift_criticalpath_table',
        'iris_widget_shift_piechart',
        'irisRingBuildWidget',
        'irisSegmentTableWidget',
        'irisDamageRepairWidget',
        'irisTableWidget',
        'irisTunnelmeterPerformanceWidget',
        'irisShiftManagementWidget',
        'irisSensorboardWidget',
        'irisShiftBarChartWidget',
        'irisInProgressFiles',
        'irisFilesComments',
        'irisCommentsFlow',
        'irisMyTasks',
        'irisMyTasksCalendar',
        'irisNewsstream',
        'irisFavoriteFiles',
        'irisMyProcesses'
    ]);

    angular.module('iris_widgets').factory('Widgets', function ($resource) {
        return $resource(iris.config.apiUrl + '/reporting/widgets/:id', {
            id: '@id'
        });
    });

    angular.module('iris_widgets').factory('WidgetTypeParameters', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + '/reporting/widget-types/:widget_type_id/parameters/:id', {
            widget_type_id: '@widget_type_id',
            id: '@id'
        });
    }]);

    angular.module('iris_widgets').directive('irisWidget', ['$compile', 'Widgets', 'WidgetService', function ($compile, Widgets, WidgetService) {
        return {
            restrict: 'AE',
            scope: {
                id: '=',
                params: '='
            },
            link: function (scope, element, attrs) {
                if (scope.id) {
                    scope.iris_widget = {};
                    Widgets.get({id: scope.id}, function (widget) {
                        widget = WidgetService.initWidget(widget);
                        scope.iris_widget = widget;
                        var directive = `${widget.widget_type.directive}${widget.service.demo_mode && attrs.mode=='demo' ?'-demo':''}`;
                        var template = `<div ${directive} params="params" ${attrs.mode ? 'mode="' + attrs.mode + '"' : ''} widget="iris_widget"></div>`;
                        element.html($compile(template)(scope));
                    })
                }
            }
        }
    }]);

    angular.module('iris_widgets').service('WidgetService', ['$rootScope','$injector', '$filter', 'Widgets', 'WidgetTypeParameters', 'WidgetTypeService', 'WidgetTimeType',
        function ($rootScope, $injector, $filter, Widgets, WidgetTypeParameters, WidgetTypeService, WidgetTimeType) {

            this.getTimeSupport = function (widget) {
                return WidgetTimeType.getTimeSupport(widget.timeType);
            };

            var self = this;

            var widgets = Widgets.query({}, function (widgets) {
                for (var i = 0, c = widgets.length; i < c; i++) {
                    widgets[i] = self.initWidget(widgets[i]);
                }
            });

            this.getWidgets = function () {
                return widgets;
            };

            this.filter = function (filter, strict) {
                strict = strict || true;
                return $filter('filter')(widgets, filter, strict);
            };

            this.getWidget = function (id) {
                return this.filter({id: id})[0];
            };

            this.injectWidgetService = function(widget){
                if (widget && widget.widget_type) {
                    var str = widget.widget_type.directive.split('-').join('_');
                    widget.service = $injector.get(camelize(str, true) + 'Service');
                    if(!widget.service) widget.service = {};
                }
            };

            this.createWidget = function (directive, report_id, timeType) {
                report_id = report_id || null;
                var widget = new Widgets({
                    directive: directive,
                    reportId: report_id
                });
                widget.widget_type = WidgetTypeService.getWidgetType(widget.directive);

                if (!widget.name) widget.name = widget.widget_type.name;

                if (timeType) {
                    widget.timeType = timeType;
                } else {
                    widget.timeType = 'none';
                }

                this.injectWidgetService(widget);

                if (widget.service) {
                    widget.settings = widget.settings || angular.copy(widget.service.getDefaultSettings());
                } else {
                    widget.settings = widget.settings || {};
                }
                widget = addWidgetParams(widget);
                return widget;
            };

            this.copyWidget = function (widget, report_id, timeType) {

                var new_widget = angular.copy(widget);
                new_widget.id = null;
                widget.timeType = timeType;
                new_widget.timeType = timeType;
                if (report_id) {
                    new_widget.reportId = report_id;
                }
                for (var i in new_widget.parameters) {
                    new_widget.parameters[i].key = new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
                }
                return self.initWidget(new_widget);
            };

            this.save = function (widget) {
                var is_new = !widget.id;
                console.log("widget to save",widget);
                return widget.$save({}, function (data) {
                    data = self.initWidget(data);
                    if (is_new) widgets.push(data);
                    $rootScope.$broadcast('iris.widget.saved');
                    return data;
                })
            };

            this.initWidget = function (widget) {
                widget.widget_type = WidgetTypeService.getWidgetType(widget.directive);
                this.injectWidgetService(widget);
                widget.timeSupport = this.getTimeSupport(widget);
                return new Widgets(widget);
            };

            this.remove = function (widget) {
                if(!widget) return null;
                return widget.$remove({}, function (widget) {
                    for (var i = 0, c = widgets.length; i < c; i++) {
                        if (widgets[i].id == widget.id) {
                            widgets.splice(i, 1);
                            break;
                        }
                    }
                    return widget;
                })
            };

            var addWidgetParams = function (widget) {
                widget.parameters = angular.copy(widget.widget_type.parameters);
                widget.parameters = widget.parameters || [];
                WidgetTimeType.setDateParams(widget, widget.timeType);
                for (var i in widget.parameters) {
                    widget.parameters[i].key = new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
                }

                return widget;
            };

            /**
             * Converts string to camelcase
             *
             * @param str string
             * @param with_first first argument should be big too
             *
             * @return resulted string to camelcase
             * */
            var camelize = function (str, with_first) {
                with_first = with_first || false;
                str = str.toLowerCase().replace(/_(.)/g, function (match, group1) {
                    return group1.toUpperCase();
                });
                if (with_first) {
                    str = str.replace(/^(.)/, function (match, group) {
                        return group.toUpperCase();
                    });
                }
                return str;
            }

        }
    ]);

})();