(function () {
    angular.module('irisShiftManagementWidget').directive('irisShiftManagementWidget',
        function ($compile, $filter, IrisShiftManagementWidgetService) {
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
                    scope.params = angular.extend({}, scope.params, IrisShiftManagementWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    function refreshWidgetParams() {
                        scope.widgetParams = JSON.stringify({
                            projectId: scope.widget.projectId,
                            deviceId: scope.widget.deviceId,
                            from: scope.params.demo ? new Date() : scope.params.period.date_start,
                            to: scope.params.demo ? new Date() : scope.params.period.date_end,
                            shiftModelIds: scope.params.shiftModels,
                            selectedStates: scope.params.selectedOperatingStates,
                            onlyCriticalTasks: scope.params.useOnlyCriticalTasks,
                            projectChildrenTasks: true,//scope.projectChildrenTasks,
                            showSummary: scope.params.showSummary,
                            columns: scope.params.columns,
                            hideTitle: true
                        });
                    }

                    function recompile() {
                        var template = `
                            <div>
                                <h3 class="iris-shift-management-header">
                                    {{widget.settings.title | irisTranslate:widget.settings.titleTranslations}}
                                </h3>`;

                        (scope.widget.projectId) && scope.params.subWidgets.filter(w => w.visible).forEach(w => {
                            template += `<${w.type} params="widgetParams" widget="widget" ${scope.params.demo ? "mode='demo'" : ""}/>`;
                        });

                        template += "</div>";
                        element.html($compile(template)(scope));
                    }

                    function refreshWidget() {
                        refreshWidgetParams();
                        recompile();
                    }
                    refreshWidget();

                    scope.$watch('params', function (nv, ov) {
                        if (!nv || angular.equals(nv, ov)) return;
                        refreshWidget();
                    }, true);
                }
            };
        });
})();

