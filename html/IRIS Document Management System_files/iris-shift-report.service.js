(function () {
    angular.module('irisShiftManagementWidget').factory('IrisShiftReportWidgetService',
        function ($translate) {
            var defaultSettings = {
                selectedOperatingStates: [],
                useOnlyWithTasks: true,
                useOnlyCriticalTasks: true,
                projectChildrenTasks: true,
                title: "Shift Management",
                titleTranslations: {},
                showSummary: true,
                columns: ['COLOR', 'CODE_NAME', 'PERCENTAGE'],
                columnCount: 1,
                subWidgets: [
                    { alias: "header", type: "iris-shift-mgmt-header", name: $translate.instant("label.Header"), visible: true },
                    { alias: "gantt", type: "iris-shift-mgmt-gantt", name: $translate.instant("label.Gantt"), visible: true },
                    { alias: "table", type: "iris-shift-mgmt-table", name: $translate.instant("label.Table"), visible: true }
                ]
            };

            var tableLayouts = [
                {
                    count: 1,
                    name: $translate.instant('label.OneColumn')
                },
                {
                    count: 2,
                    name: $translate.instant('label.TwoColumns')
                }
            ];

            return {
                getDefaultSettings: () => defaultSettings,
                getTableLayouts: () => tableLayouts
            };
        });

})();