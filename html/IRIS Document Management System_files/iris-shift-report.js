(function () {
    angular.module('irisShiftManagementWidget').directive('irisShiftReportWidget',
        function ($compile, $filter, $q, $timeout, IrisShiftReportWidgetService, ShiftProtocolService, irisDebounce) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                template: '',

                controller: function ($scope) {

                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};
                    scope.params = angular.extend({}, scope.params, IrisShiftReportWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    function refreshWidgetParams() {
                        var widgetParams = {
                                settings: {
                                    displayGantt: true,
                                    displayList: true,
                                    columnCount: scope.params.columnCount,
                                    selectedStates: scope.params.selectedOperatingStates,
                                    onlyWithTasks: scope.params.useOnlyWithTasks,
                                    showInternalComments: true,
                                    showPublicComments: true
                                }
                            };

                        var q = new $q.defer();

                        if (scope.params.demo) {
                            scope.widgetParams = JSON.stringify(widgetParams);
                            q.resolve();
                        } else {
                            ShiftProtocolService.findShiftProtocolsByWidgetParams({
                                projectId: scope.widget.projectId,
                                deviceId: scope.widget.deviceId,
                                bundleId: scope.params.shiftBundleId,
                                shiftModelIds: scope.params.shiftModels
                            }).then(res => {
                                if (scope.params.shiftProtocolTemplateId) res = res.filter(r => r.originTemplateId == scope.params.shiftProtocolTemplateId);

                                var date = new Date(scope.params.date.date_end),
                                    from = new Date(date),
                                    to = new Date(date);
                                from.setHours(0, 0, 0, 0);
                                to.setDate(to.getDate() + 1);
                                to.setHours(0, 0, 0, 0);
                                res = res.filter(r => (new Date(r.startTime)) >= from && (new Date(r.startTime)) <= to);

                                if (res.length) widgetParams.settings.protocolId = res[0].id;
                                scope.widgetParams = JSON.stringify(widgetParams);
                                q.resolve();
                            });
                        }

                        return q.promise;
                    }

                    function recompile() {
                        var template = `
                            <div>
                                <h3 class='iris-shift-management-header'>
                                    {{widget.settings.title | irisTranslate:widget.settings.titleTranslations}}
                                </h3>
                            </div>
                            <div class='container-fluid'>`;

                        (scope.widget.projectId && scope.widgetParams) && scope.params.subWidgets.filter(w => w.visible).forEach(w => {
                            template += `
                                <div class="row" ${w.type == 'iris-shift-mgmt-gantt' ? 'id="gantt-chart"': ''}>
                                    <${w.type} params="widgetParams" widget="widgetParams" print="true" ${scope.params.demo ? "mode='demo'" : ""}/>
                                </div>`;
                        });

                        template += "</div></div>";
                        element.html($compile(template)(scope));
                    }

                    function refreshWidget() {
                        refreshWidgetParams().then(() => {
                            recompile();
                        });
                    }

                    refreshWidget();

                    scope.$watch('params', irisDebounce.debounce((nv, ov) => {
                        if (!nv) {
                            return;
                        }

                        if (scope.params.demo) {
                            delete nv.selectedOperatingStates;
                            delete ov.selectedOperatingStates;
                        }

                        if (angular.equals(nv, ov)) {
                            return;
                        }

                        refreshWidget();

                    }, 500), true);
                }
            };
        });
})();

