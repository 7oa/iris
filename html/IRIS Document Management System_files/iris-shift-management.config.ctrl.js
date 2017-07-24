(function (undefined) {
    var module = angular.module('irisShiftManagementWidget');
    module.controller('ShiftManagementWidgetConfigCtrl', function ($scope, $timeout, $translate, $controller, IrisShiftManagementWidgetService) {

        angular.extend($scope, $controller('ShiftManagementWidgetBaseConfigCtrl', { $scope }));

        $scope.tabs = [{
            title: $translate.instant('label.Settings'),
            contentUrl: iris.config.widgetsUrl + '/iris-shift-management/templates/iris-shift-management.tabs.settings.html'
        }, {
            title: $translate.instant('label.Codes') + " & " + $translate.instant('label.Columns'),
            contentUrl: iris.config.widgetsUrl + '/iris-shift-management/templates/iris-shift-management.tabs.codes.html'
        }];

        $scope.allColumns = IrisShiftManagementWidgetService.getAllColumns().filter(c => $scope.widget.settings.columns.indexOf(c.code) < 0);
        $scope.selectedColumns = [];
        $scope.widget.settings.columns && $scope.widget.settings.columns.forEach(c => {
            $scope.selectedColumns.push(IrisShiftManagementWidgetService.getColumnByCode(c));
        });

        $scope.selectedColumnsGrid = {
            data: 'selectedColumns',

            enableSorting: false,
            enableFiltering: false,
            enableVerticalScrollbar: true,

            columnDefs: [{
                name: 'column'
            }, {
                name: 'action',
                cellTemplate: `

                        <div class="ui-grid-cell-contents actions">
                            <button uib-tooltip="{{'label.Up' | translate}}" ng-click="grid.appScope.moveColumnUp(row.entity); $event.preventDefault();" class="btn btn-default">
                                <i class="fa fa-chevron-up"></i>
                            </button>
                            <button uib-tooltip="{{'label.Down' | translate}}" ng-click="grid.appScope.moveColumnDown(row.entity); $event.preventDefault();" class="btn btn-default">
                                <i class="fa fa-chevron-down"></i>
                            </button>
                            <button ng-if="!row.entity.cantRemove" uib-tooltip="{{'label.Remove' | translate}}" ng-click="grid.appScope.removeColumn(row.entity); $event.preventDefault();" class="btn btn-default">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>
                    `
            }],
            onRegisterApi() {
                $timeout(() => {$(window).trigger('resize')}, 200);
            }
        };

        $scope.moveColumnUp = (entity) => {
            const arr = $scope.selectedColumns;
            const i = arr.indexOf(entity);
            if (i > 0) {
                const tmp = arr[i - 1];
                arr[i - 1] = arr[i];
                arr[i] = tmp;
            }
        };

        $scope.moveColumnDown = (entity) => {
            const arr = $scope.selectedColumns;
            const i = arr.indexOf(entity);
            if (i < arr.length - 1) {
                const tmp = arr[i + 1];
                arr[i + 1] = arr[i];
                arr[i] = tmp;
            }
        };

        $scope.removeColumn = (column) => {
            if (column.cantRemove) {
                return;
            }
            $scope.selectedColumns.splice($scope.selectedColumns.indexOf(column), 1);
            $scope.allColumns.push(column);
        };

        $scope.addColumn = (columnCode) => {
            const c = $scope.allColumns.find((it) => it.code === columnCode);
            if (c) {
                $scope.allColumns.splice($scope.allColumns.indexOf(c), 1);
                $scope.selectedColumns.push(c);
            }
        };

        $scope.$watch('selectedColumns', () => {
            $scope.widget.settings.columns = $scope.selectedColumns.map((it) => it.code);
        }, true);
    });
})();