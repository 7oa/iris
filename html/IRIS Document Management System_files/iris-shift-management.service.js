(function () {
    angular.module('irisShiftManagementWidget').factory('IrisShiftManagementWidgetService',
        function ($translate) {
            var defaultSettings = {
                selectedOperatingStates: [],
                useOnlyWithTasks: false,
                useOnlyCriticalTasks: true,
                projectChildrenTasks: true,
                title: "Shift Management",
                titleTranslations: {},
                showSummary: true,
                columns: ['COLOR', 'CODE_NAME', 'PERCENTAGE'],
                subWidgets: [
                    { alias: "chart", type: "iris-shift-pie-chart", name: $translate.instant("label.PieChart"), visible: true },
                    { alias: "path", type: "iris-shift-criticalpath-table", name: $translate.instant("label.CriticalPath"), visible: true }
                ]
            };

            var allColumns = [
                { column: 'Color', code: 'COLOR' },
                { column: 'Code names', code: 'CODE_NAME', cantRemove: true },
                { column: 'Percentage', code: 'PERCENTAGE' },
                { column: 'Minutes', code: 'SUM_MINUTES' },
                { column: 'Hours', code: 'SUM_HOURS' },
                { column: 'Days', code: 'SUM_DAYS' },
                { column: 'Weeks', code: 'SUM_WEEKS'},
                { column: 'Months', code: 'SUM_MONTHS'},
                { column: 'Hours Per Day', code: 'HOURS_PER_DAY'},
                { column: 'Minutes Per Day', code: 'MINUTES_PER_DAY'},
                { column: 'Hours Per Ring', code: 'HOURS_PER_RING'},
                { column: 'Minutes Per Ring', code: 'MINUTES_PER_RING'},
                { column: 'Hours Per Meter', code: 'HOURS_PER_METER'},
                { column: 'Minutes Per Meter', code: 'MINUTES_PER_METER'}];

            return {
                getDefaultSettings: () => defaultSettings,
                getAllColumns: () => allColumns,
                getColumnByCode: (code) => allColumns.find(c => c.code == code)
            };
        });

})();