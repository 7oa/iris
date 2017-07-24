(function () {
    angular.module('irisSegmentTableWidget').directive('irisSegmentTableWidget',
        function ($q, $filter, $compile, IrisSegmentTableWidgetService, SegmentColumnsService, WorkflowService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-segment-table-widget/templates/iris-segment-table-widget.view.html',

                controller: function ($scope) {
                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};
                    scope.params = angular.extend({}, scope.params, IrisSegmentTableWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    if (scope.widget.settings.buildingId) {
                        SegmentColumnsService.query(scope.widget.settings.buildingId).then((res) => {
                            IrisSegmentTableWidgetService.refreshDemoData(res);
                            refreshWidget();
                            var workFlowColumn = res.find(c => c.type == 'WORKFLOW');
                            if(workFlowColumn){
                                var workflowId = workFlowColumn.workflowId;
                                if(workflowId){
                                    WorkflowService.getWorkflowStates(workflowId)
                                        .then(states => scope.params.workflowStates = states);
                                }
                            }
                        });
                    } else {
                        IrisSegmentTableWidgetService.refreshDemoData([]);
                    }

                    scope.dataSort = function (a, b) {
                        if (a[scope.sortColumnName] > b[scope.sortColumnName]) {
                            return 1;
                        }
                        if (a[scope.sortColumnName] < b[scope.sortColumnName]) {
                            return -1;
                        }
                        return 0;
                    };

                    scope.getTableData = function() {
                        var res = scope.widgetData.sort(scope.dataSort);
                        return res;
                    };

                    function refreshWidgetData() {
                        var q = new $q.defer();

                        scope.widgetData = [];
                        if (scope.params.demo) {
                            scope.widgetData = IrisSegmentTableWidgetService.getDemoData();
                            q.resolve();
                        } else {
                            IrisSegmentTableWidgetService.getData(scope.widget.settings.buildingId, scope.params.date.ring).then((data) => {
                                data || (data = []);
                                scope.widgetData = data.map(d => d.segment.configuredData);
                                q.resolve();
                            });
                        }

                        return q.promise;
                    };

                    function fixWidgetData() {
                        scope.sortColumnName = null;
                        if (!scope.widgetData || !scope.widgetData.length || scope.widget.settings.sortColumnIndex > scope.widget.settings.columns.length || !scope.widget.settings.columns[scope.widget.settings.sortColumnIndex - 1].attribute) return;
                        scope.sortColumnName = scope.widget.settings.columns[scope.widget.settings.sortColumnIndex - 1].attribute.id;
                    };

                    var headerTemplate = "<th iris-segment-table-widget-header params='params' ng-repeat='col in [] | irisRepeatRange:params.splitCount'></th>";
                    var dataTemplate = "<tr ng-repeat='row in getTableData() | irisRepeatSplit:params.splitCount:sortColumnName'>" +
                                         "<td iris-segment-table-widget-blockcell params='params' ng-model='item' ng-repeat='item in row'></td></tr>";

                    function refreshWidget() {
                        refreshWidgetData().then(() => {
                            fixWidgetData();
                        });
                        element.find(".segment-table-column-header").html($compile(scope.widget.settings.columnHeader.visible ? headerTemplate : "")(scope));
                        element.find(".segment-table-column-data").html($compile(dataTemplate)(scope));
                    }
                    refreshWidget();

                    scope.$watch('params', function (nv, ov) {
                        if (!nv || angular.equals(nv, ov)) return;
                        refreshWidget();
                    }, true);
                }
            };
        });

    angular.module('irisSegmentTableWidget').directive('irisSegmentTableWidgetHeader',
        function ($compile, $filter) {
            return {
                restrict: 'EA',
                replace: false,
                template: "",
                scope: {
                    params: "="
                },
                link: function (scope, element, attrs) {
                    var html = "";
                    scope.params.columns.forEach(col => {
                        html += "<th>" + $filter("irisTranslate")(col.caption, col.captionTranslations) + "</th>"
                    });
                    element.replaceWith($compile(html)({}));
                }
            }
        });

    angular.module('irisSegmentTableWidget').directive('irisSegmentTableWidgetBlockcell',
        function ($compile, $translate, IrisTimeService) {
            return {
                restrict: 'EA',
                replace: false,
                template: "",
                scope: {
                    params: "=",
                    ngModel: "="
                },
                link: function (scope, element, attrs) {
                    var html = "";
                    scope.params.columns.forEach(col => {
                        if (!col.attribute) {
                            html += "<td></td>";
                        } else {
                            switch (col.attribute.type) {
                                case "DATE":
                                    html += `<td>{{ngModel['${col.attribute.id}'] | irisTime:this:'${IrisTimeService.getDateTimeFormatById(iris.config.me.profile.dateFormatId).momentjsFormatString}'}}</td>`
                                    break;
                                case "DATETIME":
                                    html += `<td>{{ngModel['${col.attribute.id}'] | irisTime:this}}</td>`
                                    break;
                                case "NUMBER":
                                    html += "<td>{{ngModel['" + col.attribute.id + "'] | number:" + col.attribute.decimals + "}}</td>"
                                    break;
                                case "WORKFLOW":
                                    html += `<td>{{ngModel['${col.attribute.id}'].current | IrisFilterField:[params.workflowStates]}}</td>`
                                    break;
                                case "BOOLEAN":
                                    var val = "";
                                    if (!!scope.ngModel[col.attribute.id]) {
                                        val = col.attribute.trueValue || $translate.instant("label.True");
                                    } else {
                                        val = col.attribute.falseValue || $translate.instant("label.False");
                                    }
                                    html += "<td>" + val + "</td>"
                                    break;
                                default:
                                    html += "<td>{{ngModel['" + col.attribute.id + "']}}</td>"
                                    break;
                            }
                        }
                    });
                    element.replaceWith($compile(html)(scope));
                }
            }
        });
})();

